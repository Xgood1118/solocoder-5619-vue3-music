export type EQPresetName = 'flat' | 'pop' | 'rock' | 'classical' | 'jazz' | 'custom'

export interface EQBand {
  frequency: number
  gain: number
}

export interface EQPreset {
  id: string
  name: EQPresetName
  displayName: string
  bands: number[]
}

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export const EQ_PRESETS: EQPreset[] = [
  { id: 'flat', name: 'flat', displayName: '默认', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'pop', name: 'pop', displayName: '流行', bands: [-1, 4, 6, 7, 5, 0, -2, -2, -1, -1] },
  { id: 'rock', name: 'rock', displayName: '摇滚', bands: [5, 4, 3, 1, -1, -1, 0, 2, 3, 4] },
  { id: 'classical', name: 'classical', displayName: '古典', bands: [0, 0, 0, 0, 0, 0, -2, -2, -1, -1] },
  { id: 'jazz', name: 'jazz', displayName: '爵士', bands: [3, 2, 1, 2, -2, -2, 0, 1, 3, 4] },
]
