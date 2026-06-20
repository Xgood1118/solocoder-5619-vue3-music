export interface AnalyserNodeLike {
  frequencyBinCount: number
  fftSize: number
  getByteFrequencyData(dataArray: Uint8Array): void
  getByteTimeDomainData(dataArray: Uint8Array): void
}
