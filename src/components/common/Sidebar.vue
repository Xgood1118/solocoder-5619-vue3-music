<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Library as LibraryIcon,
  ListMusic,
  Search as SearchIcon,
  Settings as SettingsIcon,
  BarChart3,
  Heart,
  Plus,
  Music2,
} from 'lucide-vue-next'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import type { Playlist as PlaylistType } from '@/types/playlist'

const router = useRouter()
const route = useRoute()
const playlistStore = usePlaylistStore()

const navItems = [
  { path: '/library', label: '音乐库', icon: LibraryIcon },
  { path: '/playlist', label: '歌单', icon: ListMusic },
  { path: '/search', label: '搜索', icon: SearchIcon },
  { path: '/stats', label: '统计', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: SettingsIcon },
]

const isActive = (path: string) => route.path.startsWith(path)

async function createNewPlaylist() {
  const name = prompt('输入歌单名称', '新建歌单')
  if (!name) return
  const pl = await playlistStore.createPlaylist(name)
  router.push(`/playlist/${pl.id}`)
}

function openPlaylist(pl: PlaylistType) {
  router.push(`/playlist/${pl.id}`)
}

const userPlaylists = computed(() =>
  playlistStore.playlists.filter(p => p.name !== '我喜欢')
)

onMounted(async () => {
  if (playlistStore.playlists.length === 0) {
    await playlistStore.loadPlaylists()
  }
})
</script>

<template>
  <aside
    class="w-64 shrink-0 h-full border-r border-white/5 flex flex-col"
    style="background: rgba(9, 9, 11, 0.6);"
  >
    <div class="px-5 py-5 border-b border-white/5">
      <div class="flex items-center gap-2.5">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center"
          style="background: linear-gradient(135deg, #8b5cf6, #3b82f6);"
        >
          <Music2 :size="18" class="text-white" />
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">SoundWave</h1>
          <p class="text-[10px] text-zinc-500">Music Player</p>
        </div>
      </div>
    </div>

    <nav class="p-3 space-y-1">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group"
        :class="isActive(item.path)
          ? 'text-white bg-white/5'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'"
        @click="router.push(item.path)"
      >
        <component
          :is="item.icon"
          :size="18"
          :class="isActive(item.path) ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'"
        />
        {{ item.label }}
      </button>
    </nav>

    <div class="px-3 mt-4 flex-1 min-h-0 flex flex-col">
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">歌单</span>
        <button
          class="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-all"
          @click="createNewPlaylist"
        >
          <Plus :size="14" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-0.5 pb-3 pr-1 scrollbar-thin">
        <button
          v-if="playlistStore.likedPlaylist"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group"
          :class="isActive('/playlist/' + playlistStore.likedPlaylist.id)
            ? 'text-white bg-white/5'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'"
          @click="openPlaylist(playlistStore.likedPlaylist!)"
        >
          <div class="w-6 h-6 rounded-md flex items-center justify-center bg-rose-500/20">
            <Heart :size="12" class="text-rose-400" fill="currentColor" />
          </div>
          <span class="truncate">我喜欢</span>
        </button>

        <button
          v-for="pl in userPlaylists"
          :key="pl.id"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group"
          :class="isActive('/playlist/' + pl.id)
            ? 'text-white bg-white/5'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'"
          @click="openPlaylist(pl)"
        >
          <div
            class="w-6 h-6 rounded-md overflow-hidden shrink-0 bg-zinc-800"
          >
            <img
              v-if="pl.coverUrl"
              :src="pl.coverUrl"
              class="w-full h-full object-cover"
            />
          </div>
          <span class="truncate">{{ pl.name }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.05);
  border-radius: 2px;
}
</style>
