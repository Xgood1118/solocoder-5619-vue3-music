<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BarChart3, Music2, Users, Disc3, Clock, TrendingUp, Calendar, Play as PlayIcon } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { getPlayHistory, getPlayStats } from '@/utils/db'
import { useMusicStore } from '@/stores/useMusicStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { Song } from '@/types/song'

const musicStore = useMusicStore()
const playerStore = usePlayerStore()

const range = ref<'day' | 'week' | 'month'>('week')
const history = ref<any[]>([])
const accentColor = computed(() => playerStore.accentColor)

const rangeLabel = computed(() => {
  const map = { day: '今日', week: '本周', month: '本月' }
  return map[range.value]
})

const stats = computed(() => {
  const days = range.value === 'day' ? 1 : range.value === 'week' ? 7 : 30
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const periodHistory = history.value.filter(h => h.playedAt >= since)

  const songCount = new Set(periodHistory.map(h => h.songId)).size
  const totalSeconds = periodHistory.reduce((sum, h) => sum + h.duration, 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const artistCount: Record<string, number> = {}
  const songPlays: Record<string, number> = {}
  const hourPlays: Record<number, number> = {}

  for (const h of periodHistory) {
    const song = musicStore.getSongById(h.songId)
    if (song) {
      artistCount[song.artist] = (artistCount[song.artist] || 0) + 1
      songPlays[song.id] = (songPlays[song.id] || 0) + 1
    }
    const hour = dayjs(h.playedAt).hour()
    hourPlays[hour] = (hourPlays[hour] || 0) + 1
  }

  const topSongId = Object.entries(songPlays).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topSong = topSongId ? musicStore.getSongById(topSongId) : null
  const topSongPlays = songPlays[topSongId || ''] || 0

  const topArtistEntry = Object.entries(artistCount).sort((a, b) => b[1] - a[1])[0]
  const topArtist = topArtistEntry?.[0] || '暂无数据'
  const topArtistPlays = topArtistEntry?.[1] || 0

  const topHourEntry = Object.entries(hourPlays).sort((a, b) => b[1] - a[1])[0]
  const topHour = topHourEntry ? `${Number(topHourEntry[0]).toString().padStart(2, '0')}:00` : '—'

  const byDay = computeByDayStats(since)

  return {
    hours,
    minutes,
    songCount,
    playCount: periodHistory.length,
    topSong,
    topSongPlays,
    topArtist,
    topArtistPlays,
    topHour,
    hourPlays,
    byDay,
  }
})

function computeByDayStats(since: number) {
  const days = range.value === 'day' ? 1 : range.value === 'week' ? 7 : 30
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = dayjs().startOf('day').subtract(i, 'day').valueOf()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    const plays = history.value.filter(h => h.playedAt >= dayStart && h.playedAt < dayEnd)
    const durationMin = Math.round(plays.reduce((s, h) => s + h.duration, 0) / 60)
    result.push({
      label: i === 0 ? '今天' : dayjs(dayStart).format(range.value === 'month' ? 'DD' : 'dd'),
      plays: plays.length,
      minutes: durationMin,
    })
  }
  return result
}

function computeHourStats() {
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push({
      label: `${i.toString().padStart(2, '0')}`,
      value: stats.value.hourPlays[i] || 0,
    })
  }
  return hours
}

function playSong(song: Song) {
  playerStore.setQueue([song], 0)
}

const topSongs = computed(() => {
  const days = range.value === 'day' ? 1 : range.value === 'week' ? 7 : 30
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const plays: Record<string, number> = {}
  for (const h of history.value) {
    if (h.playedAt < since) continue
    plays[h.songId] = (plays[h.songId] || 0) + 1
  }
  return Object.entries(plays)
    .map(([id, count]) => ({ song: musicStore.getSongById(id), count }))
    .filter(x => x.song)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

const maxDayValue = computed(() => Math.max(1, ...stats.value.byDay.map(d => Math.max(d.plays, 1))))

onMounted(async () => {
  if (musicStore.songs.length === 0) {
    await musicStore.loadSongs()
  }
  history.value = await getPlayHistory(500)
})
</script>

<template>
  <div class="flex flex-col gap-6 h-full min-h-0 overflow-y-auto scrollbar-thin pr-2">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">收听统计</h1>
        <p class="text-sm text-zinc-500 mt-1.5">记录你的音乐之旅</p>
      </div>
      <div class="flex items-center gap-1.5 rounded-xl p-0.5" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);">
        <button
          v-for="r in (['day', 'week', 'month'] as const)"
          :key="r"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="range === r ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'"
          @click="range = r"
        >
          {{ r === 'day' ? '今日' : r === 'week' ? '本周' : '本月' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
      <div class="rounded-2xl p-5 border border-white/5" style="background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02));">
        <div class="flex items-center gap-2 text-violet-400 text-xs font-medium mb-3">
          <Clock :size="13" />
          收听时长
        </div>
        <p class="text-3xl font-bold text-white">
          {{ stats.hours }}<span class="text-sm text-zinc-500 font-normal ml-1">时</span>
          <span class="ml-1">{{ stats.minutes }}</span><span class="text-sm text-zinc-500 font-normal ml-1">分</span>
        </p>
        <p class="text-xs text-zinc-500 mt-1">{{ rangeLabel }}共 {{ stats.playCount }} 次播放</p>
      </div>
      <div class="rounded-2xl p-5 border border-white/5" style="background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02));">
        <div class="flex items-center gap-2 text-sky-400 text-xs font-medium mb-3">
          <Music2 :size="13" />
          播放歌曲
        </div>
        <p class="text-3xl font-bold text-white">{{ stats.songCount }}</p>
        <p class="text-xs text-zinc-500 mt-1">{{ rangeLabel }}听到的不同歌曲</p>
      </div>
      <div class="rounded-2xl p-5 border border-white/5" style="background: linear-gradient(135deg, rgba(244,63,94,0.1), rgba(244,63,94,0.02));">
        <div class="flex items-center gap-2 text-rose-400 text-xs font-medium mb-3">
          <Users :size="13" />
          最常听歌手
        </div>
        <p class="text-xl font-bold text-white truncate">{{ stats.topArtist }}</p>
        <p class="text-xs text-zinc-500 mt-1">{{ stats.topArtistPlays }} 次播放</p>
      </div>
      <div class="rounded-2xl p-5 border border-white/5" style="background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02));">
        <div class="flex items-center gap-2 text-amber-400 text-xs font-medium mb-3">
          <Calendar :size="13" />
          活跃时段
        </div>
        <p class="text-3xl font-bold text-white">{{ stats.topHour }}</p>
        <p class="text-xs text-zinc-500 mt-1">{{ rangeLabel }}最高频的播放时间</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 rounded-2xl p-6 border border-white/5 shrink-0" style="background: rgba(255,255,255,0.02);">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <TrendingUp :size="16" class="text-zinc-400" />
            <h3 class="text-sm font-semibold text-white">收听趋势</h3>
          </div>
          <span class="text-xs text-zinc-500">{{ rangeLabel }}</span>
        </div>
        <div class="flex items-end justify-between h-32 gap-2">
          <div
            v-for="(d, i) in stats.byDay"
            :key="i"
            class="flex-1 flex flex-col items-center gap-2 group"
          >
            <div class="w-full flex flex-col items-center justify-end flex-1 relative">
              <span class="text-[10px] text-zinc-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {{ d.minutes }} 分
              </span>
              <div
                class="w-full rounded-t-md transition-all hover:opacity-100"
                :class="'opacity-80'"
                :style="{
                  height: `${Math.max(4, (d.plays / maxDayValue) * 100)}%`,
                  background: `linear-gradient(180deg, ${accentColor}, ${accentColor}55)`,
                }"
              />
            </div>
            <span class="text-[10px] text-zinc-500">{{ d.label }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl p-6 border border-white/5 shrink-0" style="background: rgba(255,255,255,0.02);">
        <div class="flex items-center gap-2 mb-6">
          <Disc3 :size="16" class="text-zinc-400" />
          <h3 class="text-sm font-semibold text-white">收听时段分布</h3>
        </div>
        <div class="grid grid-cols-12 gap-1 h-28">
          <div
            v-for="h in computeHourStats()"
            :key="h.label"
            class="flex-1 flex flex-col items-end gap-1 group relative"
          >
            <div
              class="w-full rounded-t-sm transition-all hover:opacity-100"
              style="opacity: 0.7;"
              :style="{
                height: `${Math.max(2, h.value / Math.max(1, ...computeHourStats().map(x => x.value)) * 100)}%`,
                backgroundColor: h.value > 0 ? accentColor + (0.4 + (h.value / Math.max(1, ...computeHourStats().map(x => x.value))) * 0.6) : 'rgba(255,255,255,0.05)',
              }"
            />
          </div>
        </div>
        <div class="flex justify-between text-[10px] text-zinc-600 mt-2">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-white/5 overflow-hidden shrink-0" style="background: rgba(255,255,255,0.02);">
      <div class="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div class="flex items-center gap-2">
          <Music2 :size="16" class="text-zinc-400" />
          <h3 class="text-sm font-semibold text-white">{{ rangeLabel }} Top 10 歌曲</h3>
        </div>
      </div>
      <div v-if="topSongs.length === 0" class="flex flex-col items-center py-16">
        <BarChart3 :size="40" class="text-zinc-700 mb-3" />
        <p class="text-sm text-zinc-500">暂无收听数据，快去听几首歌吧！</p>
      </div>
      <div v-else class="divide-y divide-white/5">
        <div
          v-for="(entry, i) in topSongs"
          :key="entry.song!.id"
          class="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
          @click="playSong(entry.song!)"
        >
          <span
            class="w-7 text-center text-sm font-bold tabular-nums"
            :class="i < 3 ? 'text-amber-400' : 'text-zinc-600'"
          >
            {{ i + 1 }}
          </span>
          <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800/50 relative group">
            <img
              v-if="entry.song!.coverUrl"
              :src="entry.song!.coverUrl"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlayIcon :size="14" class="text-white" fill="currentColor" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-zinc-100 truncate font-medium">{{ entry.song!.title }}</p>
            <p class="text-xs text-zinc-500 truncate">{{ entry.song!.artist }}</p>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <p class="text-xs text-zinc-500">{{ entry.song!.album }}</p>
            <div
              class="px-2 py-0.5 rounded-md text-[11px] font-semibold"
              style="background: rgba(255,255,255,0.04); color: #a1a1aa;"
            >
              {{ entry.count }} 次
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="h-4" />
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
