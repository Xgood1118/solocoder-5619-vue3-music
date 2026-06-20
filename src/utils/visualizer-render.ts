import type { AnalyserNodeLike } from '@/types/global'

export type VisualizerMode = 'bars' | 'circular' | 'wave'

export function drawBars(
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNodeLike,
  width: number,
  height: number,
  accentColor: string,
) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  ctx.clearRect(0, 0, width, height)

  const barCount = 64
  const gap = 2
  const barWidth = (width - gap * (barCount - 1)) / barCount

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor(i * bufferLength / barCount)
    const value = dataArray[dataIndex] / 255
    const barHeight = value * height * 0.9

    const x = i * (barWidth + gap)
    const y = height - barHeight

    const gradient = ctx.createLinearGradient(x, height, x, y)
    gradient.addColorStop(0, accentColor)
    gradient.addColorStop(1, accentColor + '33')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, barWidth, barHeight)
  }
}

export function drawCircular(
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNodeLike,
  width: number,
  height: number,
  accentColor: string,
) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  ctx.clearRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const baseRadius = Math.min(width, height) * 0.25
  const maxRadius = Math.min(width, height) * 0.45
  const sliceCount = 128

  ctx.beginPath()
  for (let i = 0; i <= sliceCount; i++) {
    const dataIndex = Math.floor(i * bufferLength / sliceCount) % bufferLength
    const value = dataArray[dataIndex] / 255
    const radius = baseRadius + value * (maxRadius - baseRadius)
    const angle = (i / sliceCount) * Math.PI * 2 - Math.PI / 2

    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = accentColor + '15'
  ctx.fill()
}

export function drawWave(
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNodeLike,
  width: number,
  height: number,
  accentColor: string,
) {
  const bufferLength = analyser.fftSize
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)

  ctx.clearRect(0, 0, width, height)

  ctx.beginPath()
  const sliceWidth = width / bufferLength
  let x = 0

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0
    const y = (v * height) / 2

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth
  }

  ctx.strokeStyle = accentColor
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.lineTo(width, height / 2)
  ctx.lineTo(0, height / 2)
  ctx.fillStyle = accentColor + '10'
  ctx.fill()
}
