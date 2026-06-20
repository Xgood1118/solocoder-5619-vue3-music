<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Shuffle, Grid3X3, List, SlidersHorizontal, ChevronLeft, ChevronRight, Music2 } from 'lucide-vue-next'
import { useMusicStore } from '@/stores/useMusicStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import ImportZone from '@/components/library/ImportZone.vue'
import SongList from '@/components/library/SongList.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import { mockSearch } from '@/utils/mock-api'
import type { Song } from '@/types/song'

const musicStore = useMusicStore()
const playerStore = usePlayerStore()

const viewMode = ref<'grid' | 'list'>('list')
const sortBy = ref<'added' | 'title' | 'artist' | 'album'>('added')
const source = ref<'all' | 'local' | 'online'>('all')
const page = ref(0)
const pageSize = 50

const accentColor = computed(() => playerStore.accentColor)

const filteredSongs = computed(() => {
  let result = [...musicStore.songs]

  if (source.value !== 'all') {
    result = result.filter(s => s.source === source.value)
  }

  switch (sortBy.value) {
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'artist':
      result.sort((a, b) => a.artist.localeCompare(b.artist))
      break
    case 'album':
      result.sort((a, b) => a.album.localeCompare(b.album))
      break
    default:
      result.sort((a, b) => b.addedAt - a.addedAt)
  }
  return result
})

const pagedSongs = computed(() => {
  return filteredSongs.value.slice(0, (page.value + 1) * pageSize)
})

const totalPages = computed(() => Math.ceil(filteredSongs.value.length / pageSize))

const stats = computed(() => {
  const local = musicStore.songs.filter(s => s.source === 'local').length
  const total = musicStore.songs.length
  const duration = musicStore.songs.reduce((sum, s) => sum + s.duration, 0)
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  return { local, total, hours, minutes }
})

function handleSearch(kw: string) {
  // handled via router in SearchBar
}

function shuffleAll() {
  if (filteredSongs.value.length === 0) return
  const shuffled = [...filteredSongs.value].sort(() => Math.random() - 0.5)
  playerStore.setQueue(shuffled, 0)
}

onMounted(async () => {
  await musicStore.loadSongs()
  // Add mock online songs for demo
  const resp = await mockSearch('周杰伦')
  for (const s of resp.results) {
    if (!musicStore.songs.find(sg => sg.id === s.id)) {
      musicStore.songs.push(s)
    }
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 h-full min-h-0">
    <div class="flex items-start justify-between gap-8 shrink-0">
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-white tracking-tight">音乐库</h1>
        <p class="text-sm text-zinc-500 mt-1.5">
          {{ stats.total }} 首歌曲 · {{ stats.local }} 首本地 · 总时长 {{ stats.hours }}小时{{ stats.minutes }}分钟
        </p>
      </div>
      <div class="w-80 shrink-0">
        <SearchBar @search="handleSearch" />
      </div>
    </div>

    <ImportZone v-if="stats.local === 0" />

    <div v-else class="flex flex-col gap-4 flex-1 min-h-0">
      <div class="flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02]"
            :style="{ background: accentColor }"
            @click="shuffleAll"
          >
            <Shuffle :size="15" />
            随机播放全部
          </button>
          <div class="flex items-center rounded-xl p-0.5" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);">
            <button
              v-for="s in (['all', 'local', 'online'] as const)"
              :key="s"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="source === s
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'"
              @click="source = s; page = 0"
            >
              {{ s === 'all' ? '全部' : s === 'local' ? '本地' : '在线' }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 rounded-xl p-0.5" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);">
            <select
              v-model="sortBy"
              class="bg-transparent text-xs font-medium text-zinc-300 px-2 py-1.5 rounded-lg outline-none cursor-pointer appearance-none pr-7"
              style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2371717a%27 stroke-width=%272%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 6px center; background-size: 14px;"
            >
              <option value="added" class="bg-zinc-900">最近添加</option>
              <option value="title" class="bg-zinc-900">标题</option>
              <option value="artist" class="bg-zinc-900">歌手</option>
              <option value="album" class="bg-zinc-900">专辑</option>
            </select>
          </div>
          <div class="flex items-center rounded-xl p-0.5" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);">
            <button
              class="p-1.5 rounded-lg transition-all"
              :class="viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'"
              @click="viewMode = 'list'"
            >
              <List :size="15" />
            </button>
            <button
              class="p-1.5 rounded-lg transition-all"
              :class="viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'"
              @click="viewMode = 'grid'"
            >
              <Grid3X3 :size="15" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5" style="background: rgba(255,255,255,0.02);">
        <div class="h-full overflow-y-auto p-4 scrollbar-thin">
          <template v-if="viewMode === 'list'">
            <SongList
              :songs="pagedSongs"
              :accent-color="accentColor"
            />
          </template>
          <template v-else>
            <div
              v-if="pagedSongs.length === 0"
              class="flex flex-col items-center justify-center py-20"
            >
              <Music2 :size="48" class="text-zinc-700 mb-4" />
              <p class="text-zinc-500">暂无歌曲</p>
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <div
                v-for="song in pagedSongs"
                :key="song.id"
                class="group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 bg-zinc-900/30 border border-white/5 p-3"
                @click="playerStore.setQueue([...filteredSongs], filteredSongs.findIndex(s => s.id === song.id))"
              >
                <div class="aspect-square rounded-lg overflow-hidden bg-zinc-800/50 mb-3 relative">
                  <img
                    v-if="song.coverUrl"
                    :src="song.coverUrl"
                    :alt="song.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div
                      class="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center justify-center"
                      :style="{ backgroundColor: accentColor }"
                    >
                      <svg class="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-zinc-100 font-medium truncate">{{ song.title }}</p>
                <p class="text-xs text-zinc-500 truncate mt-0.5">{{ song.artist }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-if="filteredSongs.length > pageSize" class="flex items-center justify-center gap-3 shrink-0">
        <button
          class="p-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          :disabled="page === 0"
          @click="page--"
        >
          <ChevronLeft :size="16" />
        </button>
        <span class="text-xs text-zinc-500 tabular-nums">{{ page + 1 }} / {{ totalPages }}</span>
        <button
          class="p-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          :disabled="page + 1 >= totalPages"
          @click="page++"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.1);
}
</style>
