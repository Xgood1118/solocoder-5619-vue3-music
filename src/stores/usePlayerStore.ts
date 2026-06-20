import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Song } from '@/types/song'
import type { PlayMode, PlayerState } from '@/types/player'
import { addPlayHistory } from '@/utils/db'

export const usePlayerStore = defineStore('player', () => {
  const state = ref<PlayerState>('idle')
  const currentSong = ref<Song | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const muted = ref(false)
  const playMode = ref<PlayMode>('list-loop')
  const speed = ref(1)
  const queue = ref<Song[]>([])
  const queueIndex = ref(-1)
  const accentColor = ref('#8b5cf6')

  const isPlaying = computed(() => state.value === 'playing')
  const progress = computed(() => duration.value > 0 ? currentTime.value / duration.value : 0)

  function setCurrentSong(song: Song | null) {
    currentSong.value = song
    if (song) {
      state.value = 'loading'
    }
  }

  function setState(s: PlayerState) {
    state.value = s
  }

  function play() {
    state.value = 'playing'
  }

  function pause() {
    state.value = 'paused'
  }

  function togglePlay() {
    if (state.value === 'playing') {
      pause()
    } else {
      play()
    }
  }

  function updateTime(time: number) {
    currentTime.value = time
  }

  function setDuration(d: number) {
    duration.value = d
  }

  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(1, v))
    if (v > 0) muted.value = false
  }

  function toggleMute() {
    muted.value = !muted.value
  }

  function setPlayMode(mode: PlayMode) {
    playMode.value = mode
  }

  function cyclePlayMode() {
    const modes: PlayMode[] = ['list-loop', 'single-loop', 'random', 'sequential']
    const idx = modes.indexOf(playMode.value)
    playMode.value = modes[(idx + 1) % modes.length]
  }

  function setSpeed(s: number) {
    speed.value = Math.max(0.5, Math.min(2, s))
  }

  function setQueue(songs: Song[], startIndex: number = 0) {
    queue.value = songs
    queueIndex.value = startIndex
    if (songs[startIndex]) {
      setCurrentSong(songs[startIndex])
    }
  }

  function getNextIndex(): number {
    if (queue.value.length === 0) return -1

    switch (playMode.value) {
      case 'single-loop':
        return queueIndex.value
      case 'list-loop':
        return (queueIndex.value + 1) % queue.value.length
      case 'sequential':
        return queueIndex.value + 1 < queue.value.length ? queueIndex.value + 1 : -1
      case 'random':
        return Math.floor(Math.random() * queue.value.length)
      default:
        return -1
    }
  }

  function getPrevIndex(): number {
    if (queue.value.length === 0) return -1

    switch (playMode.value) {
      case 'single-loop':
        return queueIndex.value
      case 'list-loop':
        return queueIndex.value - 1 >= 0 ? queueIndex.value - 1 : queue.value.length - 1
      case 'sequential':
        return queueIndex.value - 1 >= 0 ? queueIndex.value - 1 : -1
      case 'random':
        return Math.floor(Math.random() * queue.value.length)
      default:
        return -1
    }
  }

  function next() {
    const idx = getNextIndex()
    if (idx >= 0 && queue.value[idx]) {
      queueIndex.value = idx
      setCurrentSong(queue.value[idx])
    }
  }

  function prev() {
    const idx = getPrevIndex()
    if (idx >= 0 && queue.value[idx]) {
      queueIndex.value = idx
      setCurrentSong(queue.value[idx])
    }
  }

  async function recordPlay(songId: string, dur: number) {
    await addPlayHistory(songId, dur)
  }

  function setAccentColor(color: string) {
    accentColor.value = color
  }

  return {
    state,
    currentSong,
    currentTime,
    duration,
    volume,
    muted,
    playMode,
    speed,
    queue,
    queueIndex,
    accentColor,
    isPlaying,
    progress,
    setCurrentSong,
    setState,
    play,
    pause,
    togglePlay,
    updateTime,
    setDuration,
    setVolume,
    toggleMute,
    setPlayMode,
    cyclePlayMode,
    setSpeed,
    setQueue,
    next,
    prev,
    recordPlay,
    setAccentColor,
  }
})
