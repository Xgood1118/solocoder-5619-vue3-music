import * as musicMetadata from 'music-metadata-browser'
import type { Song } from '@/types/song'
import { parseFilename } from './filename-parser'

const SUPPORTED_EXTENSIONS = /\.(mp3|flac|wav|aac|ogg)$/i

export function isSupportedFile(file: File): boolean {
  return SUPPORTED_EXTENSIONS.test(file.name)
}

export async function parseMusicFile(file: File): Promise<Song> {
  let metadata: any = null
  try {
    if ((musicMetadata as any).parseBlob) {
      metadata = await (musicMetadata as any).parseBlob(file, { duration: true })
    } else if ((musicMetadata as any).fromBlob) {
      metadata = await (musicMetadata as any).fromBlob(file)
    }
  } catch {
    return fallbackFromFile(file)
  }
  if (!metadata) return fallbackFromFile(file)
  const parsed = parseFilename(file.name)
  const common = metadata.common || {}

  let coverUrl = ''
  if (common.picture && common.picture.length > 0) {
    const pic = common.picture[0]
    const blob = new Blob([pic.data], { type: pic.format })
    coverUrl = URL.createObjectURL(blob)
  }

  let lyricsLrc = ''
  if (common.lyrics && common.lyrics.length > 0) {
    lyricsLrc = typeof common.lyrics[0] === 'string'
      ? common.lyrics[0]
      : (common.lyrics[0] as any).text || ''
  }

  return {
    id: generateId(),
    title: common.title || parsed.title,
    artist: common.artist || parsed.artist,
    album: common.album || '未知专辑',
    year: common.year?.toString() || '',
    duration: metadata.format.duration || 0,
    coverUrl,
    lyricsLrc,
    source: 'local',
    filePath: file.name,
    fileUrl: URL.createObjectURL(file),
    addedAt: Date.now(),
  }
}

function fallbackFromFile(file: File): Song {
  const parsed = parseFilename(file.name)
  return {
    id: generateId(),
    title: parsed.title,
    artist: parsed.artist,
    album: '未知专辑',
    year: '',
    duration: 0,
    coverUrl: '',
    lyricsLrc: '',
    source: 'local',
    filePath: file.name,
    fileUrl: URL.createObjectURL(file),
    addedAt: Date.now(),
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export async function scanFilesFromDirectory(): Promise<File[]> {
  const files: File[] = []

  if ('showDirectoryPicker' in window) {
    try {
      const dirHandle = await (window as any).showDirectoryPicker()
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile()
          if (isSupportedFile(file)) {
            files.push(file)
          }
        }
      }
    } catch {
      // user cancelled or not supported
    }
  }

  return files
}

export function createFileInput(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.webkitdirectory = true
    input.accept = '.mp3,.flac,.wav,.aac,.ogg'
    input.onchange = () => {
      const fileList = input.files
      if (!fileList) return resolve([])
      const files = Array.from(fileList).filter(isSupportedFile)
      resolve(files)
    }
    input.click()
  })
}
