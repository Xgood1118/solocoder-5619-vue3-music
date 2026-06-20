import type { Song } from '@/types/song'

export function setupMediaSession(
  audio: HTMLAudioElement,
  song: Song,
  onPlay: () => void,
  onPause: () => void,
  onPrev: () => void,
  onNext: () => void,
): void {
  if (!('mediaSession' in navigator)) return

  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork: song.coverUrl ? [{ src: song.coverUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
  })

  navigator.mediaSession.setActionHandler('play', onPlay)
  navigator.mediaSession.setActionHandler('pause', onPause)
  navigator.mediaSession.setActionHandler('previoustrack', onPrev)
  navigator.mediaSession.setActionHandler('nexttrack', onNext)
  navigator.mediaSession.setActionHandler('seekto', (details) => {
    if (details.seekTime !== undefined) {
      audio.currentTime = details.seekTime
    }
  })
}

export function updateMediaSessionPosition(audio: HTMLAudioElement): void {
  if (!('mediaSession' in navigator)) return

  navigator.mediaSession.setPositionState({
    duration: audio.duration || 0,
    playbackRate: audio.playbackRate,
    position: audio.currentTime,
  })
}
