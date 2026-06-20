export type PlayMode = 'list-loop' | 'single-loop' | 'random' | 'sequential'

export type PlayerState = 'idle' | 'playing' | 'paused' | 'loading'

export interface PlayerStatus {
  state: PlayerState
  currentSongId: string | null
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playMode: PlayMode
  speed: number
  queue: string[]
  queueIndex: number
}
