<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Trash2, Download, Upload, Pencil, Music, Heart, Play, Shuffle } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useMusicStore } from '@/stores/useMusicStore'
import PlaylistCard from '@/components/playlist/PlaylistCard.vue'
import SongList from '@/components/library/SongList.vue'
import type { Playlist } from '@/types/playlist'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()
const playerStore = usePlayerStore()
const musicStore = useMusicStore()

const showDeleteConfirm = ref(false)
const playlistToDelete = ref<Playlist | null>(null)

const accentColor = computed(() => playerStore.accentColor)

const currentPlaylistId = computed<string | null>(() => {
  const id = route.params.id as string | undefined
  return id || null
})

const currentPlaylist = computed(() =>
  currentPlaylistId.value
    ? playlistStore.playlists.find(p => p.id === currentPlaylistId.value)
    : null
)

const playlistSongs = computed(() =>
  currentPlaylistId.value
    ? playlistStore.getPlaylistSongs(currentPlaylistId.value)
    : []
)

const playlists = computed(() => playlistStore.playlists)

async function openPlaylist(pl: Playlist) {
  router.push(`/playlist/${pl.id}`)
}

async function createPlaylist() {
  const name = prompt('输入歌单名称', '新建歌单')
  if (!name) return
  const pl = await playlistStore.createPlaylist(name)
  router.push(`/playlist/${pl.id}`)
}

async function askDeletePlaylist(pl: Playlist) {
  if (pl.name === '我喜欢') return
  playlistToDelete.value = pl
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!playlistToDelete.value) return
  await playlistStore.deletePlaylistById(playlistToDelete.value.id)
  router.push('/playlist')
  showDeleteConfirm.value = false
  playlistToDelete.value = null
}

function playAll() {
  if (playlistSongs.value.length === 0) return
  playerStore.setQueue([...playlistSongs.value], 0)
}

function shufflePlay() {
  if (playlistSongs.value.length === 0) return
  const shuffled = [...playlistSongs.value].sort(() => Math.random() - 0.5)
  playerStore.setQueue(shuffled, 0)
}

async function exportM3u() {
  if (!currentPlaylist.value) return
  const m3u = await playlistStore.exportM3u(currentPlaylist.value.id)
  const blob = new Blob([m3u], { type: 'audio/x-mpegurl' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentPlaylist.value.name}.m3u`
  a.click()
  URL.revokeObjectURL(url)
}

function formatDate(ts: number) {
  return dayjs(ts).format('YYYY-MM-DD')
}

onMounted(async () => {
  if (playlistStore.playlists.length === 0) {
    await playlistStore.loadPlaylists()
  }
  if (musicStore.songs.length === 0) {
    await musicStore.loadSongs()
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 h-full min-h-0">
    <template v-if="!currentPlaylist">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">歌单</h1>
          <p class="text-sm text-zinc-500 mt-1.5">共 {{ playlists.length }} 个歌单</p>
        </div>
        <button
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02]"
          :style="{ background: accentColor }"
          @click="createPlaylist"
        >
          <Plus :size="16" />
          新建歌单
        </button>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div v-if="playlists.length === 0" class="flex flex-col items-center justify-center py-20">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style="background: rgba(139,92,246,0.1);">
            <Music :size="36" class="text-violet-400" />
          </div>
          <h3 class="text-lg font-semibold text-zinc-200 mb-2">还没有歌单</h3>
          <p class="text-sm text-zinc-500 mb-5">创建一个专属歌单，收藏喜欢的歌曲</p>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02]"
            :style="{ background: accentColor }"
            @click="createPlaylist"
          >
            <Plus :size="15" />
            创建歌单
          </button>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 p-1">
          <PlaylistCard
            v-for="pl in playlists"
            :key="pl.id"
            :playlist="pl"
            :accent-color="accentColor"
            @open="openPlaylist"
            @delete="askDeletePlaylist"
          />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center gap-4 shrink-0">
        <button
          class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
          @click="router.push('/playlist')"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-white truncate">{{ currentPlaylist.name }}</h1>
          <p class="text-sm text-zinc-500 mt-1">
            {{ playlistSongs.length }} 首歌曲 · 创建于 {{ formatDate(currentPlaylist.createdAt) }}
            <span v-if="currentPlaylist.name === ' 我喜欢'">· 自动维护</span>
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02]"
          :style="{ background: accentColor }"
          :disabled="playlistSongs.length === 0"
          @click="playAll"
        >
          <Play :size="15" class="ml-0.5" fill="currentColor" />
          播放全部
        </button>
        <button
          class="p-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
          :disabled="playlistSongs.length === 0"
          title="随机播放"
          @click="shufflePlay"
        >
          <Shuffle :size="16" />
        </button>
        <button
          class="p-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
          title="导出 m3u"
          @click="exportM3u"
        >
          <Download :size="16" />
        </button>
      </div>

      <div class="flex gap-8 shrink-0 items-end">
        <div
          class="w-48 h-48 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10"
          style="background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2));"
        >
          <img
            v-if="currentPlaylist.coverUrl"
            :src="currentPlaylist.coverUrl"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Music v-if="currentPlaylist.name !== '我喜欢'" :size="56" class="text-white/30" />
            <Heart v-else :size="56" class="text-rose-400/50" fill="currentColor" />
          </div>
        </div>
        <div class="flex-1" />
      </div>

      <div class="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5" style="background: rgba(255,255,255,0.02);">
        <div class="h-full overflow-y-auto p-4 scrollbar-thin">
          <SongList
            :songs="playlistSongs"
            :accent-color="accentColor"
            :empty-title="`歌单 '${currentPlaylist.name}' 是空的`"
            empty-subtitle="去音乐库添加你喜欢的歌曲吧"
          />
        </div>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);"
          @click.self="showDeleteConfirm = false"
        >
          <div class="w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl" style="background: #0f0f12;">
            <h3 class="text-lg font-semibold text-white mb-2">删除歌单？</h3>
            <p class="text-sm text-zinc-400 mb-6">确定要删除歌单「{{ playlistToDelete?.name }}」吗？此操作无法撤销。</p>
            <div class="flex items-center gap-3 justify-end">
              <button
                class="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                @click="showDeleteConfirm = false"
              >
                取消
              </button>
              <button
                class="px-4 py-2 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600 transition-all"
                @click="confirmDelete"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
