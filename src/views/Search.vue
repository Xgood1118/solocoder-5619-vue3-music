<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search as SearchIcon, Clock, Sparkles, X } from 'lucide-vue-next'
import { useMusicStore } from '@/stores/useMusicStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import SearchBar from '@/components/search/SearchBar.vue'
import SongList from '@/components/library/SongList.vue'
import { mockSearch } from '@/utils/mock-api'
import type { Song } from '@/types/song'

const route = useRoute()
const musicStore = useMusicStore()
const playerStore = usePlayerStore()

const keyword = ref('')
const results = ref<Song[]>([])
const searching = ref(false)
const searchHistory = ref<string[]>([])
const category = ref<'all' | 'local' | 'online'>('all')

const accentColor = computed(() => playerStore.accentColor)

const categorized = computed(() => {
  if (category.value === 'all') return results.value
  return results.value.filter(r => r.source === category.value)
})

const categories = computed(() => {
  const local = results.value.filter(r => r.source === 'local').length
  const online = results.value.filter(r => r.source === 'online').length
  return { total: results.value.length, local, online }
})

async function doSearch(kw: string) {
  keyword.value = kw
  searching.value = true
  try {
    results.value = await musicStore.search(kw)
    if (!searchHistory.value.includes(kw)) {
      searchHistory.value.unshift(kw)
      if (searchHistory.value.length > 10) searchHistory.value.pop()
      try { localStorage.setItem('search-history', JSON.stringify(searchHistory.value)) } catch {}
    }
  } finally {
    searching.value = false
  }
}

function clearHistory() {
  searchHistory.value = []
  try { localStorage.removeItem('search-history') } catch {}
}

const hotKeywords = ['周杰伦', '晴天', '孤勇者', '华语', '古典', '起风了', '流行', '光年之外']

watch(() => route.query.q, (q) => {
  if (typeof q === 'string' && q.trim()) {
    doSearch(q.trim())
  }
}, { immediate: true })

onMounted(() => {
  try {
    const saved = localStorage.getItem('search-history')
    if (saved) searchHistory.value = JSON.parse(saved)
  } catch {}
})
</script>

<template>
  <div class="flex flex-col gap-6 h-full min-h-0">
    <div class="flex flex-col gap-4 shrink-0">
      <h1 class="text-3xl font-bold text-white tracking-tight">搜索</h1>
      <div class="max-w-2xl">
        <SearchBar @search="doSearch" />
      </div>
    </div>

    <template v-if="!keyword">
      <div class="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-8">
        <div v-if="searchHistory.length > 0">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Clock :size="16" class="text-zinc-500" />
              <span class="text-sm font-medium text-zinc-400">搜索历史</span>
            </div>
            <button
              class="text-xs text-zinc-600 hover:text-zinc-400 transition-all"
              @click="clearHistory"
            >
              清除
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="kw in searchHistory"
              :key="kw"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); color: #a1a1aa;"
              :class="['hover:text-white hover:border-white/20']"
              @click="doSearch(kw)"
            >
              {{ kw }}
              <X :size="10" class="text-zinc-600" />
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2 mb-4">
            <Sparkles :size="16" class="text-violet-400" />
            <span class="text-sm font-medium text-zinc-400">热门搜索</span>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="kw in hotKeywords"
              :key="kw"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all group"
              style="background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(139,92,246,0.2);"
              :class="['text-zinc-300 hover:text-white hover:border-violet-500/40']"
              @click="doSearch(kw)"
            >
              <SearchIcon :size="12" class="text-violet-400/80 group-hover:text-violet-400" />
              {{ kw }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-sm text-zinc-500">
          {{ searching ? '搜索中...' : `找到 ${results.length} 个结果` }}
        </span>
        <template v-if="results.length > 0">
          <div class="flex items-center gap-1.5 ml-4 rounded-xl p-0.5" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);">
            <button
              v-for="(cat, label) in ( { all: '全部', local: '本地', online: '在线' } as Record<string, string> )"
              :key="cat"
              class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              :class="category === cat ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'"
              @click="category = cat as any"
            >
              {{ label }}
              <span class="ml-1 opacity-50 tabular-nums">
                ({{ cat === 'all' ? categories.total : categories[cat] }})
              </span>
            </button>
          </div>
        </template>
      </div>

      <div class="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5" style="background: rgba(255,255,255,0.02);">
        <div class="h-full overflow-y-auto p-4 scrollbar-thin">
          <div v-if="searching" class="flex items-center justify-center py-20">
            <svg class="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none" :style="{ color: accentColor }">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
          <div v-else-if="results.length === 0" class="flex flex-col items-center justify-center py-20">
            <SearchIcon :size="48" class="text-zinc-700 mb-4" />
            <p class="text-zinc-400 text-base font-medium">未找到与「{{ keyword }}」相关的结果</p>
            <p class="text-sm text-zinc-600 mt-2">换个关键词试试？</p>
          </div>
          <SongList v-else :songs="categorized" :accent-color="accentColor" />
        </div>
      </div>
    </template>
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
</style>
