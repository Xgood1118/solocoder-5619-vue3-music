import Dexie, { type Table } from 'dexie'
import type { Song } from '@/types/song'
import type { Playlist, PlaylistSong } from '@/types/playlist'

interface Favorite {
  id: string
  targetId: string
  targetType: 'song' | 'artist' | 'album'
  createdAt: number
}

interface PlayHistoryRecord {
  id: string
  songId: string
  playedAt: number
  duration: number
}

interface EQPresetRecord {
  id: string
  name: string
  bands: string
}

class MusicDB extends Dexie {
  songs!: Table<Song, string>
  playlists!: Table<Playlist, string>
  playlistSongs!: Table<PlaylistSong, [string, number]>
  favorites!: Table<Favorite, string>
  playHistory!: Table<PlayHistoryRecord, string>
  eqPresets!: Table<EQPresetRecord, string>

  constructor() {
    super('SoundWaveDB')
    this.version(1).stores({
      songs: 'id, title, artist, album, source, addedAt',
      playlists: 'id, name, createdAt, updatedAt',
      playlistSongs: '[playlistId+order], playlistId, songId',
      favorites: 'id, targetId, targetType, createdAt',
      playHistory: 'id, songId, playedAt',
      eqPresets: 'id, name',
    })
  }
}

export const db = new MusicDB()

export async function getAllSongs(): Promise<Song[]> {
  return db.songs.toArray()
}

export async function addSong(song: Song): Promise<string> {
  return db.songs.put(song)
}

export async function addSongs(songs: Song[]): Promise<void> {
  await db.songs.bulkPut(songs)
}

export async function removeSong(id: string): Promise<void> {
  await db.songs.delete(id)
  await db.playlistSongs.where('songId').equals(id).delete()
}

export async function searchSongs(query: string): Promise<Song[]> {
  const q = query.toLowerCase()
  return db.songs.filter(song =>
    song.title.toLowerCase().includes(q) ||
    song.artist.toLowerCase().includes(q) ||
    song.album.toLowerCase().includes(q) ||
    song.lyricsLrc.toLowerCase().includes(q)
  ).toArray()
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  return db.playlists.toArray()
}

export async function createPlaylist(playlist: Playlist): Promise<string> {
  return db.playlists.put(playlist)
}

export async function updatePlaylist(playlist: Playlist): Promise<string> {
  return db.playlists.put(playlist)
}

export async function deletePlaylist(id: string): Promise<void> {
  await db.playlists.delete(id)
  await db.playlistSongs.where('playlistId').equals(id).delete()
}

export async function getPlaylistSongs(playlistId: string): Promise<PlaylistSong[]> {
  return db.playlistSongs.where('playlistId').equals(playlistId).sortBy('order')
}

export async function addSongToPlaylist(playlistId: string, songId: string, order: number): Promise<void> {
  await db.playlistSongs.put({ playlistId, songId, order })
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  const entries = await db.playlistSongs
    .where('playlistId').equals(playlistId)
    .filter(e => e.songId === songId)
    .toArray()
  for (const e of entries) {
    await db.playlistSongs.delete([e.playlistId, e.order])
  }
}

export async function addFavorite(targetId: string, targetType: 'song' | 'artist' | 'album'): Promise<void> {
  await db.favorites.put({
    id: `${targetType}-${targetId}`,
    targetId,
    targetType,
    createdAt: Date.now(),
  })
}

export async function removeFavorite(targetId: string, targetType: 'song' | 'artist' | 'album'): Promise<void> {
  await db.favorites.delete(`${targetType}-${targetId}`)
}

export async function isFavorite(targetId: string, targetType: 'song' | 'artist' | 'album'): Promise<boolean> {
  const entry = await db.favorites.get(`${targetType}-${targetId}`)
  return !!entry
}

export async function getFavoritesByType(targetType: 'song' | 'artist' | 'album'): Promise<Favorite[]> {
  return db.favorites.where('targetType').equals(targetType).toArray()
}

export async function addPlayHistory(songId: string, duration: number): Promise<void> {
  await db.playHistory.add({
    id: generateId(),
    songId,
    playedAt: Date.now(),
    duration,
  })
}

export async function getPlayHistory(limit = 100): Promise<PlayHistoryRecord[]> {
  return db.playHistory.orderBy('playedAt').reverse().limit(limit).toArray()
}

export async function getPlayStats(days: number): Promise<PlayHistoryRecord[]> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  return db.playHistory.where('playedAt').above(since).toArray()
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
