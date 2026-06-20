<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Sun, Moon, Volume2, Gauge, Languages as LanguagesIcon, Palette, Info, Download, Upload, Database, Trash2, Check } from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useMusicStore } from '@/stores/useMusicStore'
import { db } from '@/utils/db'
import { EQ_FREQUENCIES, EQ_PRESETS } from '@/types/equalizer'
import { updateEQBand, applyEQPreset } from '@/audio/eq'

const playerStore = usePlayerStore()
const musicStore = useMusicStore()

const accentColor = computed(() => playerStore.accentColor)
const bands = ref([...EQ_PRESETS[0].bands])
const activePreset = ref('flat')
const autoCrossfade = ref(true)
const crossfadeDuration = ref(500)
const defaultVolume = ref(0.8)
const defaultPlayMode = ref<'list-loop' | 'single-loop' | 'random' | 'sequential'>('list-loop')
const enableMediaSession = ref(true)
const showDesktopLyricsByDefault = ref(false)
const theme = ref<'dark' | 'auto'>('dark')

function applyPreset(id: string) {
  const preset = EQ_PRESETS.find(p => p.id === id)
  if (!preset) return
  bands.value = [...preset.bands]
  applyEQPreset(preset.bands)
  activePreset.value = id
}

function updateBand(i: number, v: number) {
  bands.value[i] = v
  updateEQBand(i, v)
  activePreset.value = 'custom'
}

async function exportData() {
  const songs = await db.songs.toArray()
  const playlists = await db.playlists.toArray()
  const playlistSongs = await db.playlistSongs.toArray()
  const favorites = await db.favorites.toArray()
  const history = await db.playHistory.toArray()

  const data = { songs, playlists, playlistSongs, favorites, history, exportedAt: Date.now() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `soundwave-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function clearAllData() {
  if (!confirm('确定要清除所有数据吗？此操作无法撤销！')) return
  await db.delete()
  location.reload()
}

const freqLabels = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K']

const dbStats = computed(async () => {
  const songCount = musicStore.songs.length
  const localCount = musicStore.songs.filter(s => s.source === 'local').length
  return { songCount, localCount }
})

onMounted(() => {
  // sync default settings
})
</script>

<template>
  <div class="flex flex-col gap-8 h-full min-h-0 overflow-y-auto scrollbar-thin pr-2">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">设置</h1>
      <p class="text-sm text-zinc-500 mt-1.5">自定义你的音乐体验</p>
    </div>

    <section class="space-y-4">
      <div class="flex items-center gap-2">
        <Gauge :size="18" class="text-violet-400" />
        <h2 class="text-base font-semibold text-white">播放设置</h2>
      </div>

      <div class="rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5" style="background: rgba(255,255,255,0.02);">
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">淡入淡出</p>
            <p class="text-xs text-zinc-500 mt-0.5">切换歌曲时平滑过渡</p>
          </div>
          <button
            class="w-11 h-6 rounded-full p-0.5 transition-all relative"
            :style="autoCrossfade ? { backgroundColor: accentColor } : { backgroundColor: 'rgba(255,255,255,0.08)' }"
            @click="autoCrossfade = !autoCrossfade"
          >
            <div
              class="w-5 h-5 rounded-full bg-white shadow-md transition-transform"
              :style="{ transform: autoCrossfade ? 'translateX(20px)' : 'translateX(0)' }"
            />
          </button>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">过渡时长</p>
            <p class="text-xs text-zinc-500 mt-0.5">{{ crossfadeDuration }} 毫秒</p>
          </div>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            v-model.number="crossfadeDuration"
            :disabled="!autoCrossfade"
            class="w-40 accent-violet-500"
          />
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">默认音量</p>
            <p class="text-xs text-zinc-500 mt-0.5">{{ Math.round(defaultVolume * 100) }}%</p>
          </div>
          <div class="flex items-center gap-3 w-40">
            <Volume2 :size="14" class="text-zinc-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="defaultVolume"
              class="flex-1 accent-violet-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">默认播放模式</p>
          </div>
          <select
            v-model="defaultPlayMode"
            class="bg-zinc-800/60 text-sm text-zinc-200 px-3 py-1.5 rounded-lg outline-none border border-white/10"
          >
            <option value="list-loop">列表循环</option>
            <option value="single-loop">单曲循环</option>
            <option value="random">随机播放</option>
            <option value="sequential">顺序播放</option>
          </select>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">Media Session</p>
            <p class="text-xs text-zinc-500 mt-0.5">允许浏览器媒体控件（锁屏/任务栏）控制播放</p>
          </div>
          <button
            class="w-11 h-6 rounded-full p-0.5 transition-all relative"
            :style="enableMediaSession ? { backgroundColor: accentColor } : { backgroundColor: 'rgba(255,255,255,0.08)' }"
            @click="enableMediaSession = !enableMediaSession"
          >
            <div
              class="w-5 h-5 rounded-full bg-white shadow-md transition-transform"
              :style="{ transform: enableMediaSession ? 'translateX(20px)' : 'translateX(0)' }"
            />
          </button>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">默认开启桌面歌词</p>
            <p class="text-xs text-zinc-500 mt-0.5">打开播放器时显示浮窗歌词</p>
          </div>
          <button
            class="w-11 h-6 rounded-full p-0.5 transition-all relative"
            :style="showDesktopLyricsByDefault ? { backgroundColor: accentColor } : { backgroundColor: 'rgba(255,255,255,0.08)' }"
            @click="showDesktopLyricsByDefault = !showDesktopLyricsByDefault"
          >
            <div
              class="w-5 h-5 rounded-full bg-white shadow-md transition-transform"
              :style="{ transform: showDesktopLyricsByDefault ? 'translateX(20px)' : 'translateX(0)' }"
            />
          </button>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center gap-2">
        <SlidersEquivalentIcon />
        <h2 class="text-base font-semibold text-white">均衡器</h2>
      </div>

      <div class="rounded-2xl border border-white/5 overflow-hidden p-6" style="background: rgba(255,255,255,0.02);">
        <div class="flex justify-between gap-3 h-44 mb-6 px-2">
          <div
            v-for="(band, i) in bands"
            :key="i"
            class="flex flex-col items-center gap-2 flex-1"
          >
            <span class="text-[10px] text-zinc-400 tabular-nums">{{ band >= 0 ? '+' : '' }}{{ band.toFixed(1) }}</span>
            <div class="relative flex-1 w-full flex justify-center">
              <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-zinc-800 rounded-full" />
              <div
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 rounded-full transition-all"
                :style="{
                  height: `${Math.abs(band) / 12 * 50}%`,
                  backgroundColor: band > 0 ? accentColor : accentColor + '88',
                  opacity: band === 0 ? 0 : 1,
                }"
              />
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                :value="band"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                @input="updateBand(i, Number(($event.target as HTMLInputElement).value))"
              />
              <div
                class="absolute w-3 h-3 rounded-full pointer-events-none transition-all"
                :style="{
                  bottom: `${(band + 12) / 24 * 100}%`,
                  left: '50%',
                  transform: 'translate(-50%, 50%)',
                  backgroundColor: accentColor,
                  boxShadow: `0 0 8px ${accentColor}88`,
                }"
              />
            </div>
            <span class="text-[10px] text-zinc-500 font-medium">{{ freqLabels[i] }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in EQ_PRESETS"
            :key="preset.id"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activePreset === preset.id
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-100 bg-white/[0.03] hover:bg-white/[0.06]'"
            :style="activePreset === preset.id ? { backgroundColor: accentColor } : {}"
            @click="applyPreset(preset.id)"
          >
            {{ preset.displayName }}
          </button>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center gap-2">
        <Palette :size="18" class="text-violet-400" />
        <h2 class="text-base font-semibold text-white">外观</h2>
      </div>

      <div class="rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5" style="background: rgba(255,255,255,0.02);">
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            <Moon :size="18" class="text-zinc-400" />
            <div>
              <p class="text-sm font-medium text-zinc-200">深色模式</p>
              <p class="text-xs text-zinc-500 mt-0.5">沉浸式音乐体验</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 rounded-xl p-0.5" style="background: rgba(255,255,255,0.04);">
            <button
              class="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 text-white"
            >
              <Moon :size="12" class="inline mr-1" /> 深色
            </button>
            <button
              class="px-3 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300"
            >
              <Sun :size="12" class="inline mr-1" /> 浅色
            </button>
            <button
              class="px-3 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300"
            >
              跟随系统
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">动态强调色</p>
            <p class="text-xs text-zinc-500 mt-0.5">从当前播放封面提取主色调</p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full shadow-lg"
              :style="{ backgroundColor: accentColor, boxShadow: `0 0 20px ${accentColor}66` }"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center gap-2">
        <Database :size="18" class="text-violet-400" />
        <h2 class="text-base font-semibold text-white">数据管理</h2>
      </div>

      <div class="rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5" style="background: rgba(255,255,255,0.02);">
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">导出数据</p>
            <p class="text-xs text-zinc-500 mt-0.5">导出歌曲、歌单、收藏、播放历史到 JSON 文件</p>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            @click="exportData"
          >
            <Download :size="14" />
            导出
          </button>
        </div>
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-200">清除所有数据</p>
            <p class="text-xs text-zinc-500 mt-0.5">删除所有本地音乐、歌单和历史记录</p>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 transition-all"
            @click="clearAllData"
          >
            <Trash2 :size="14" />
            清除
          </button>
        </div>
      </div>
    </section>

    <section class="flex items-center justify-center gap-2 text-xs text-zinc-600 pt-4 pb-8">
      <Info :size="12" />
      <span>SoundWave v1.0.0 · Made with Vue 3</span>
    </section>
  </div>
</template>

<script lang="ts">
import { Sliders as SlidersEquivalentIcon } from 'lucide-vue-next'
export { SlidersEquivalentIcon }
</script>

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
