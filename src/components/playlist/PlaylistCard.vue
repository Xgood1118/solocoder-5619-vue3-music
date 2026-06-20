<script setup lang="ts">
import { computed } from 'vue'
import { MoreHorizontal, Music2 } from 'lucide-vue-next'
import type { Playlist } from '@/types/playlist'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

const props = defineProps<{
  playlist: Playlist
  accentColor?: string
}>()

const emit = defineEmits<{
  'open': [playlist: Playlist]
  'delete': [playlist: Playlist]
}>()

const playlistStore = usePlaylistStore()
const playerStore = usePlayerStore()

const songCount = computed(() => {
  return playlistStore.getPlaylistSongIds(props.playlist.id).length
})

const songs = computed(() => playlistStore.getPlaylistSongs(props.playlist.id))

function playPlaylist() {
  if (songs.value.length === 0) return
  playerStore.setQueue(songs.value, 0)
}
</script>

<template>
  <div
    class="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
    style="background: rgba(255, 255, 255, 0.03);"
    @click="emit('open', playlist)"
  >
    <div class="aspect-square relative overflow-hidden">
      <template v-if="playlist.coverUrl">
        <img
          :src="playlist.coverUrl"
          :alt="playlist.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </template>
      <template v-else>
        <div class="w-full h-full flex items-center justify-center" style="background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3));">
          <Music2 :size="48" class="text-white/40" />
        </div>
      </template>

      <button
        class="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10"
        :style="accentColor ? { backgroundColor: accentColor } : { backgroundColor: '#8b5cf6' }"
        @click.stop="playPlaylist"
      >
        <svg class="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <button
        class="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all bg-black/40 hover:bg-black/60 text-white/80 z-10"
        @click.stop="emit('delete', playlist)"
      >
        <MoreHorizontal :size="16" />
      </button>
    </div>

    <div class="p-3">
      <h3 class="text-sm font-semibold text-zinc-100 truncate">{{ playlist.name }}</h3>
      <p class="text-xs text-zinc-500 mt-0.5">{{ songCount }} 首歌曲</p>
    </div>
  </div>
</template>
