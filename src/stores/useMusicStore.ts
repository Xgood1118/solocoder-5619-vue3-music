import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Song } from '@/types/song'
import { getAllSongs, addSongs, removeSong, searchSongs as dbSearch, addFavorite, removeFavorite, isFavorite as dbIsFavorite } from '@/utils/db'
import { parseMusicFile, createFileInput } from '@/utils/id3-parser'
import { mockSearch } from '@/utils/mock-api'

export const useMusicStore = defineStore('music', () => {
  const songs = ref<Song[]>([])
  const loading = ref(false)
  const favorites = ref<Set<string>>(new Set())

  const songMap = computed(() => {
    const map = new Map<string, Song>()
    songs.value.forEach(s => map.set(s.id, s))
    return map
  })

  async function loadSongs() {
    loading.value = true
    try {
      songs.value = await getAllSongs()
    } finally {
      loading.value = false
    }
  }

  async function importFiles() {
    loading.value = true
    try {
      const files = await createFileInput()
      if (files.length === 0) return

      const parsed: Song[] = []
      for (const file of files) {
        try {
          const song = await parseMusicFile(file)
          parsed.push(song)
        } catch (e) {
          console.warn('Failed to parse file:', file.name, e)
        }
      }

      if (parsed.length > 0) {
        await addSongs(parsed)
        songs.value.push(...parsed)
      }
    } finally {
      loading.value = false
    }
  }

  async function deleteSong(id: string) {
    await removeSong(id)
    songs.value = songs.value.filter(s => s.id !== id)
  }

  async function search(keyword: string): Promise<Song[]> {
    const localResults = await dbSearch(keyword)
    const onlineResp = await mockSearch(keyword)
    const onlineResults = onlineResp.results

    const seen = new Set(localResults.map(s => s.id))
    const combined = [...localResults]
    for (const s of onlineResults) {
      if (!seen.has(s.id)) {
        combined.push(s)
      }
    }
    return combined
  }

  async function toggleFavorite(songId: string) {
    if (favorites.value.has(songId)) {
      await removeFavorite(songId, 'song')
      favorites.value.delete(songId)
    } else {
      await addFavorite(songId, 'song')
      favorites.value.add(songId)
    }
  }

  async function checkFavorite(songId: string): Promise<boolean> {
    const fav = await dbIsFavorite(songId, 'song')
    if (fav) favorites.value.add(songId)
    return fav
  }

  function getSongById(id: string): Song | undefined {
    return songMap.value.get(id)
  }

  return {
    songs,
    loading,
    favorites,
    songMap,
    loadSongs,
    importFiles,
    deleteSong,
    search,
    toggleFavorite,
    checkFavorite,
    getSongById,
  }
})
