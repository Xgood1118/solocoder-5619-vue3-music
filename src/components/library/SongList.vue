<script setup lang="ts">
import { computed } from 'vue'
import type { Song } from '@/types/song'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useMusicStore } from '@/stores/useMusicStore'
import SongItem from './SongItem.vue'

const props = defineProps<{
  songs: Song[]
  accentColor: string
  emptyTitle?: string
  emptySubtitle?: string
}>()

const playerStore = usePlayerStore()
const musicStore = useMusicStore()

function playSong(song: Song, startIndex: number) {
  playerStore.setQueue(props.songs, startIndex)
}

const queueIds = computed(() => new Set(playerStore.queue.map(s => s.id)))
</script>

<template>
  <div>
    <div v-if="songs.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style="background: rgba(139,92,246,0.1);"
      >
        <svg class="w-7 h-7 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <h3 class="text-base font-semibold text-zinc-300">{{ emptyTitle || '暂无歌曲' }}</h3>
      <p class="text-sm text-zinc-500 mt-1">{{ emptySubtitle || '导入本地音乐开始播放' }}</p>
    </div>

    <div v-else class="flex flex-col gap-1">
      <div class="flex items-center gap-4 px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-white/5">
        <div class="w-8 shrink-0 text-center">#</div>
        <div class="w-10 shrink-0"></div>
        <div class="flex-1 min-w-0">标题</div>
        <div class="w-32 shrink-0 hidden md:block">专辑</div>
        <div class="w-[60px] shrink-0 text-center">来源</div>
        <div class="w-10 shrink-0"></div>
        <div class="w-14 shrink-0 text-right">时长</div>
        <div class="w-10 shrink-0"></div>
      </div>

      <div class="mt-2 flex flex-col gap-0.5">
        <SongItem
          v-for="(song, i) in songs"
          :key="song.id"
          :song="song"
          :index="i"
          :accent-color="accentColor"
          :is-in-queue="queueIds.has(song.id)"
          @play="playSong(song, i)"
        />
      </div>
    </div>
  </div>
</template>
