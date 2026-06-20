<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, X, MicVocal, Languages, Monitor, Maximize2 } from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useMusicStore } from '@/stores/useMusicStore'
import CdCover from '@/components/player/CdCover.vue'
import ProgressBar from '@/components/player/ProgressBar.vue'
import PlaybackControls from '@/components/player/PlaybackControls.vue'
import VolumeControl from '@/components/player/VolumeControl.vue'
import LyricsPanel from '@/components/lyrics/LyricsPanel.vue'
import DesktopLyrics from '@/components/lyrics/DesktopLyrics.vue'
import Visualizer from '@/components/visualizer/Visualizer.vue'
import Equalizer from '@/components/equalizer/Equalizer.vue'
import EqualizerPanel from '@/components/equalizer/Equalizer.vue'

const emit = defineEmits<{
  close: []
}>()

const playerStore = usePlayerStore()
const musicStore = useMusicStore()
const router = useRouter()

const desktopLyricsRef = ref<InstanceType<typeof DesktopLyrics> | null>(null)
const karaokeMode = ref(false)
const showTranslate = ref(false)
const activeTab = ref<'lyrics' | 'visualizer'>('lyrics')

const song = computed(() => playerStore.currentSong)
const accentColor = computed(() => playerStore.accentColor)
const isFavorite = computed(() =>
  song.value ? musicStore.favorites.has(song.value.id) : false
)

function handleSeek(t: number) {
  const event = new CustomEvent('player-seek', { detail: t })
  window.dispatchEvent(event)
}

function toggleDesktopLyrics() {
  if (desktopLyricsRef.value) {
    desktopLyricsRef.value.openDesktopLyrics()
  }
}

function handleVolumeUpdate(v: number) {
  playerStore.setVolume(v)
}

function handleMutedUpdate(m: boolean) {
  playerStore.muted = m
}
</script>

<template>
  <div
    class="fixed inset-0 z-[60] flex flex-col overflow-hidden"
    :style="{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor}15, transparent 60%), #0a0a0f` }"
  >
    <div class="flex items-center justify-between px-6 py-4">
      <button
        class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
        @click="emit('close')"
      >
        <ChevronDown :size="20" />
      </button>

      <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
        <button
          class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
          :class="activeTab === 'lyrics'
            ? 'bg-white/10 text-white'
            : 'text-zinc-500 hover:text-zinc-300'"
          @click="activeTab = 'lyrics'"
        >
          歌词
        </button>
        <button
          class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
          :class="activeTab === 'visualizer'
            ? 'bg-white/10 text-white'
            : 'text-zinc-500 hover:text-zinc-300'"
          @click="activeTab = 'visualizer'"
        >
          可视化
        </button>
      </div>

      <div class="flex items-center gap-2">
        <Equalizer :accent-color="accentColor" />
        <button
          class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>
    </div>

    <div class="flex-1 flex gap-8 px-8 pb-8 min-h-0">
      <div class="w-[420px] shrink-0 flex flex-col items-center justify-center gap-8">
        <div class="relative">
          <div
            class="absolute -inset-8 rounded-full blur-3xl opacity-30 pointer-events-none"
            :style="{ backgroundColor: accentColor }"
          />
          <CdCover
            :cover-url="song?.coverUrl || ''"
            :is-playing="playerStore.isPlaying"
            :size="320"
          />
        </div>

        <div class="w-full text-center space-y-3">
          <div>
            <h2 class="text-2xl font-bold text-white truncate">{{ song?.title || '未播放' }}</h2>
            <p class="text-sm text-zinc-400 mt-1">{{ song?.artist || '—' }}</p>
          </div>

          <ProgressBar
            :current-time="playerStore.currentTime"
            :duration="playerStore.duration"
            :accent-color="accentColor"
            @seek="handleSeek"
          />

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
                :class="isFavorite ? 'text-rose-400' : ''"
              >
                <svg :size="18" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>

            <PlaybackControls
              :is-playing="playerStore.isPlaying"
              :play-mode="playerStore.playMode"
              :speed="playerStore.speed"
              :accent-color="accentColor"
              @toggle-play="playerStore.togglePlay()"
              @next="playerStore.next()"
              @prev="playerStore.prev()"
              @cycle-mode="playerStore.cyclePlayMode()"
              @change-speed="playerStore.setSpeed($event)"
            />

            <div class="w-40">
              <VolumeControl
                :volume="playerStore.volume"
                :muted="playerStore.muted"
                :accent-color="accentColor"
                @update:volume="handleVolumeUpdate"
                @update:muted="handleMutedUpdate"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 rounded-3xl overflow-hidden border border-white/5" style="background: rgba(255,255,255,0.02);">
        <LyricsPanel
          v-if="activeTab === 'lyrics' && song"
          :lyrics="song.lyricsLrc || defaultLrc"
          :current-time="playerStore.currentTime"
          :accent-color="accentColor"
          :karaoke-mode="karaokeMode"
          @seek="handleSeek"
          @toggle-karaoke="karaokeMode = !karaokeMode"
          @toggle-translate="showTranslate = !showTranslate"
          @toggle-desktop-lyrics="toggleDesktopLyrics"
        />
        <Visualizer
          v-else-if="activeTab === 'visualizer'"
          :accent-color="accentColor"
        />
      </div>
    </div>

    <DesktopLyrics
      ref="desktopLyricsRef"
      :lyrics="song?.lyricsLrc || ''"
      :current-time="playerStore.currentTime"
      :accent-color="accentColor"
    />
  </div>
</template>

<script lang="ts">
const defaultLrc = `[00:00.00]暂无歌词
[00:05.00]此歌曲尚未附带歌词
[00:10.00]请欣赏美妙的音乐🎵`
</script>
