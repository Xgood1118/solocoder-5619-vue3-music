import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Playlist, PlaylistSong } from '@/types/playlist'
import type { Song } from '@/types/song'
import {
  getAllPlaylists,
  createPlaylist as dbCreate,
  updatePlaylist as dbUpdate,
  deletePlaylist as dbDelete,
  getPlaylistSongs as dbGetSongs,
  addSongToPlaylist as dbAddSong,
  removeSongFromPlaylist as dbRemoveSong,
} from '@/utils/db'
import { useMusicStore } from './useMusicStore'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const usePlaylistStore = defineStore('playlist', () => {
  const playlists = ref<Playlist[]>([])
  const playlistSongMap = ref<Map<string, string[]>>(new Map())

  const likedPlaylist = computed(() =>
    playlists.value.find(p => p.name === '我喜欢')
  )

  async function loadPlaylists() {
    playlists.value = await getAllPlaylists()

    if (!playlists.value.find(p => p.name === '我喜欢')) {
      await createPlaylist('我喜欢')
    }

    for (const p of playlists.value) {
      const entries = await dbGetSongs(p.id)
      playlistSongMap.value.set(p.id, entries.map(e => e.songId))
    }
  }

  async function createPlaylist(name: string): Promise<Playlist> {
    const playlist: Playlist = {
      id: generateId(),
      name,
      coverUrl: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await dbCreate(playlist)
    playlists.value.push(playlist)
    playlistSongMap.value.set(playlist.id, [])
    return playlist
  }

  async function updatePlaylistData(playlist: Playlist) {
    playlist.updatedAt = Date.now()
    await dbUpdate(playlist)
    const idx = playlists.value.findIndex(p => p.id === playlist.id)
    if (idx >= 0) playlists.value[idx] = playlist
  }

  async function deletePlaylistById(id: string) {
    if (playlists.value.find(p => p.id === id)?.name === '我喜欢') return
    await dbDelete(id)
    playlists.value = playlists.value.filter(p => p.id !== id)
    playlistSongMap.value.delete(id)
  }

  async function addSong(playlistId: string, songId: string) {
    const songIds = playlistSongMap.value.get(playlistId) || []
    if (songIds.includes(songId)) return

    const order = songIds.length
    await dbAddSong(playlistId, songId, order)
    songIds.push(songId)
    playlistSongMap.value.set(playlistId, songIds)
    await updatePlaylistCover(playlistId)
  }

  async function removeSong(playlistId: string, songId: string) {
    await dbRemoveSong(playlistId, songId)
    const songIds = (playlistSongMap.value.get(playlistId) || []).filter(id => id !== songId)
    playlistSongMap.value.set(playlistId, songIds)
    await updatePlaylistCover(playlistId)
  }

  async function updatePlaylistCover(playlistId: string) {
    const musicStore = useMusicStore()
    const songIds = playlistSongMap.value.get(playlistId) || []
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (!playlist) return

    const covers = songIds.slice(0, 4)
      .map(id => musicStore.getSongById(id)?.coverUrl)
      .filter(Boolean) as string[]

    playlist.coverUrl = covers.length > 0 ? covers[0] : ''
    playlist.updatedAt = Date.now()
    await dbUpdate(playlist)
  }

  function getPlaylistSongIds(playlistId: string): string[] {
    return playlistSongMap.value.get(playlistId) || []
  }

  function getPlaylistSongs(playlistId: string): Song[] {
    const musicStore = useMusicStore()
    const ids = playlistSongMap.value.get(playlistId) || []
    return ids.map(id => musicStore.getSongById(id)).filter(Boolean) as Song[]
  }

  async function exportM3u(playlistId: string): Promise<string> {
    const songs = getPlaylistSongs(playlistId)
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (!playlist) return ''

    let m3u = '#EXTM3U\n'
    for (const song of songs) {
      m3u += `#EXTINF:${Math.round(song.duration)},${song.artist} - ${song.title}\n`
      m3u += song.filePath || song.fileUrl || `${song.id}\n`
    }
    return m3u
  }

  return {
    playlists,
    playlistSongMap,
    likedPlaylist,
    loadPlaylists,
    createPlaylist,
    updatePlaylistData,
    deletePlaylistById,
    addSong,
    removeSong,
    getPlaylistSongIds,
    getPlaylistSongs,
    exportM3u,
  }
})
