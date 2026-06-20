export interface LrcLine {
  time: number
  text: string
  translation?: string
  syllables?: LrcSyllable[]
}

export interface LrcSyllable {
  time: number
  duration: number
  text: string
}

export function parseLrc(lrcContent: string): LrcLine[] {
  if (!lrcContent) return []
  const lines = lrcContent.split('\n')
  const result: LrcLine[] = []

  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (const line of lines) {
    const timestamps: number[] = []
    let match: RegExpExecArray | null

    timeRegex.lastIndex = 0
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
      timestamps.push(minutes * 60 + seconds + ms / 1000)
    }

    const text = line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim()
    if (!text || timestamps.length === 0) continue

    for (const time of timestamps) {
      result.push({ time, text })
    }
  }

  result.sort((a, b) => a.time - b.time)
  return result
}

export function parseEnhancedLrc(lrcContent: string): LrcLine[] {
  if (!lrcContent) return []
  const lines = lrcContent.split('\n')
  const result: LrcLine[] = []

  const lineTimeRegex = /^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/
  const syllableRegex = /<(\d{2}):(\d{2})(?:\.(\d{2,3}))?>([^<]*)/g

  for (const line of lines) {
    const lineMatch = line.match(lineTimeRegex)
    if (!lineMatch) continue

    const lineTime = parseInt(lineMatch[1], 10) * 60 + parseInt(lineMatch[2], 10) +
      (lineMatch[3] ? parseInt(lineMatch[3].padEnd(3, '0'), 10) / 1000 : 0)

    const content = line.replace(lineTimeRegex, '').trim()
    const syllables: LrcSyllable[] = []

    let sMatch: RegExpExecArray | null
    syllableRegex.lastIndex = 0
    while ((sMatch = syllableRegex.exec(content)) !== null) {
      const sTime = parseInt(sMatch[1], 10) * 60 + parseInt(sMatch[2], 10) +
        (sMatch[3] ? parseInt(sMatch[3].padEnd(3, '0'), 10) / 1000 : 0)
      syllables.push({
        time: sTime,
        duration: 0,
        text: sMatch[4],
      })
    }

    if (syllables.length > 0) {
      for (let i = 0; i < syllables.length; i++) {
        const nextTime = i < syllables.length - 1 ? syllables[i + 1].time : lineTime + 2
        syllables[i].duration = nextTime - syllables[i].time
      }
      const fullText = syllables.map(s => s.text).join('')
      result.push({ time: lineTime, text: fullText, syllables })
    } else {
      const text = content.replace(/<[^>]*>/g, '').trim()
      if (text) {
        result.push({ time: lineTime, text })
      }
    }
  }

  result.sort((a, b) => a.time - b.time)
  return result
}

export function findCurrentLine(lines: LrcLine[], currentTime: number): number {
  if (lines.length === 0) return -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) return i
  }
  return -1
}
