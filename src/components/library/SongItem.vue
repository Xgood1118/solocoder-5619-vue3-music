<script setup lang="ts">
import { computed } from 'vue'
import { Play, Pause, Heart, HeartOff, MoreHorizontal, Clock } from 'lucide-vue-next'
import type { Song } from '@/types/song'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useMusicStore } from '@/stores/useMusicStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'

const props = defineProps<{
  song: Song
  index: number
  accentColor: string
  isInQueue?: boolean
}>()

const emit = defineEmits<{
  play: [song: Song]
}>()

const playerStore = usePlayerStore()
const musicStore = useMusicStore()
const playlistStore = usePlaylistStore()

const isCurrent = computed(() => playerStore.currentSong?.id === props.song.id)
const isPlaying = computed(() => isCurrent.value && playerStore.isPlaying)
const isFavorite = computed(() => musicStore.favorites.has(props.song.id))

function formatDuration(sec: number) {
  if (!sec) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function playSong() {
  if (isCurrent.value) {
    playerStore.togglePlay()
  } else {
    emit('play', props.song)
  }
}

async function toggleFav(e: Event) {
  e.stopPropagation()
  await musicStore.toggleFavorite(props.song.id)
  if (isFavorite.value && playlistStore.likedPlaylist) {
    await playlistStore.addSong(playlistStore.likedPlaylist.id, props.song.id)
  }
}
</script>

<template>
  <div
    class="group flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-transparent"
    :class="isCurrent
      ? 'bg-white/5 border-white/5'
      : 'hover:bg-white/[0.03]'"
    @click="playSong"
  >
    <div class="w-8 text-center shrink-0">
      <span
        v-if="!isPlaying"
        class="text-xs text-zinc-600 group-hover:hidden tabular-nums"
      >
        {{ String(index + 1).padStart(2, '0') }}
      </span>
      <button
        class="w-8 h-8 hidden group-hover:flex items-center justify-center rounded-lg transition-all"
        :class="isPlaying ? 'flex' : ''"
        :style="isCurrent ? { color: accentColor } : {}"
        @click.stop="playSong"
      >
        <component :is="isPlaying ? Pause : Play" :size="14" fill="currentColor" />
      </button>
    </div>

    <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800/50">
      <img
        v-if="song.coverUrl"
        :src="song.coverUrl"
        :alt="song.title"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="flex-1 min-w-0">
      <p
        class="text-sm truncate"
        :class="isCurrent ? 'text-[color:var(--accent)] font-medium' : 'text-zinc-100'"
        :style="isCurrent ? { color: accentColor } : {}"
      >
        {{ song.title }}
      </p>
      <p class="text-xs text-zinc-500 truncate">{{ song.artist }}</p>
    </div>

    <div class="w-32 shrink-0 hidden md:block">
      <p class="text-sm text-zinc-400 truncate">{{ song.album }}</p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <span
        class="px-1.5 py-0.5 rounded text-[10px] font-medium"
        :class="song.source === 'local'
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-sky-500/10 text-sky-400'"
      >
        {{ song.source === 'local' ? '本地' : '在线' }}
      </span>
    </div>

    <button
      class="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0"
      :class="isFavorite ? 'opacity-100' : 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10'"
      :style="isFavorite ? { color: '#fb7185' } : {}"
      @click="toggleFav"
    >
      <component :is="isFavorite ? Heart : HeartOff" :size="16" :fill="isFavorite ? 'currentColor' : 'none'" />
    </button>

    <div class="w-14 shrink-0 flex items-center justify-end gap-2">
      <Clock :size="12" class="text-zinc-600" />
      <span class="text-xs text-zinc-500 tabular-nums">{{ formatDuration(song.duration) }}</span>
    </div>

    <button
      class="p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all shrink-0"
      @click.stop
    >
      <MoreHorizontal :size="16" />
    </button>
  </div>
</template>
