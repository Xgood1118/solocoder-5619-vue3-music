export interface Playlist {
  id: string
  name: string
  coverUrl: string
  createdAt: number
  updatedAt: number
}

export interface PlaylistSong {
  playlistId: string
  songId: string
  order: number
}

export interface PlaylistWithSongs extends Playlist {
  songs: string[]
}
