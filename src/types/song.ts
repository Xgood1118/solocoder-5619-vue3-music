export interface Song {
  id: string
  title: string
  artist: string
  album: string
  year: string
  duration: number
  coverUrl: string
  lyricsLrc: string
  source: 'local' | 'online'
  filePath: string
  fileUrl: string
  addedAt: number
}

export interface SongWithCover extends Song {
  accentColor: string
}
