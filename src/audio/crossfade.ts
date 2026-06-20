export function crossfade(
  oldAudio: HTMLAudioElement,
  newAudio: HTMLAudioElement,
  duration: number = 500,
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      oldAudio.volume = 1 - progress
      newAudio.volume = progress

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        oldAudio.pause()
        oldAudio.volume = 1
        resolve()
      }
    }

    requestAnimationFrame(step)
  })
}
