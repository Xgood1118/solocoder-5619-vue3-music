import { getAudioContext } from './audio-context'
import { EQ_FREQUENCIES } from '@/types/equalizer'

let filters: BiquadFilterNode[] = []

export function createEQ(): BiquadFilterNode[] {
  const ctx = getAudioContext()
  filters = EQ_FREQUENCIES.map((freq) => {
    const filter = ctx.createBiquadFilter()
    if (filters.length === 0) {
      filter.type = 'lowshelf'
    } else if (freq >= 16000) {
      filter.type = 'highshelf'
    } else {
      filter.type = 'peaking'
    }
    filter.frequency.value = freq
    filter.Q.value = 1.4
    filter.gain.value = 0
    return filter
  })
  return filters
}

export function getEQFilters(): BiquadFilterNode[] {
  return filters
}

export function updateEQBand(index: number, gain: number): void {
  if (filters[index]) {
    filters[index].gain.value = gain
  }
}

export function applyEQPreset(bands: number[]): void {
  bands.forEach((gain, i) => {
    if (filters[i]) {
      filters[i].gain.value = gain
    }
  })
}

export function connectEQ(source: AudioNode, destination: AudioNode): void {
  if (filters.length === 0) {
    createEQ()
  }

  source.disconnect()
  let currentNode: AudioNode = source

  for (const filter of filters) {
    currentNode.connect(filter)
    currentNode = filter
  }
  currentNode.connect(destination)
}
