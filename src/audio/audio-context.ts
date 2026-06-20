let audioCtx: AudioContext | null = null
let analyserNode: AnalyserNode | null = null

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function getAnalyser(): AnalyserNode {
  if (!analyserNode) {
    const ctx = getAudioContext()
    analyserNode = ctx.createAnalyser()
    analyserNode.fftSize = 256
    analyserNode.smoothingTimeConstant = 0.8
  }
  return analyserNode
}

export function connectSource(source: AudioNode): void {
  const analyser = getAnalyser()
  source.connect(analyser)
}
