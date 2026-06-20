export function parseFilename(filename: string): { title: string; artist: string } {
  const name = filename.replace(/\.(mp3|flac|wav|aac|ogg)$/i, '').trim()

  const separators = [' - ', '–', '—', '-']
  for (const sep of separators) {
    if (name.includes(sep)) {
      const parts = name.split(sep)
      if (parts.length >= 2) {
        return {
          artist: parts[0].trim(),
          title: parts.slice(1).join(sep).trim(),
        }
      }
    }
  }

  return { title: name, artist: '未知艺术家' }
}
