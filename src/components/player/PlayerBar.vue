<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Music } from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { getAudioContext, getAnalyser, connectSource } from '@/audio/audio-context'
import { crossfade } from '@/audio/crossfade'
import { createEQ, connectEQ } from '@/audio/eq'
import { setupMediaSession, updateMediaSessionPosition } from '@/audio/media-session'
import CdCover from './CdCover.vue'
import ProgressBar from './ProgressBar.vue'
import VolumeControl from './VolumeControl.vue'
import PlaybackControls from './PlaybackControls.vue'

const store = usePlayerStore()

const audioRef = ref<HTMLAudioElement | null>(null)
const prevAudioRef = ref<HTMLAudioElement | null>(null)
const sourceNode = ref<MediaElementAudioSourceNode | null>(null)
const eqInitialized = ref(false)

function createAudio(): HTMLAudioElement {
  const el = new Audio()
  el.preload = 'auto'
  el.volume = store.muted ? 0 : store.volume
  el.playbackRate = store.speed
  return el
}

function connectAudioGraph(el: HTMLAudioElement) {
  const ctx = getAudioContext()
  const analyser = getAnalyser()
  const node = ctx.createMediaElementSource(el)
  sourceNode.value = node

  if (!eqInitialized.value) {
    createEQ()
    connectEQ(node, analyser)
    analyser.connect(ctx.destination)
    eqInitialized.value = true
  } else {
    connectEQ(node, analyser)
  }
}

async function extractAccentColor(url: string) {
  try {
    const ColorThief = (await import('color-thief-browser')).default
    const thief = new ColorThief()
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = url
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
    })
    const [r, g, b] = thief.getColor(img)
    store.setAccentColor(`rgb(${r},${g},${b})`)
  } catch {
    store.setAccentColor('#8b5cf6')
  }
}

function onTimeUpdate() {
  if (!audioRef.value) return
  store.updateTime(audioRef.value.currentTime)
  updateMediaSessionPosition(audioRef.value)
}

function onLoadedMetadata() {
  if (!audioRef.value) return
  store.setDuration(audioRef.value.duration)
  store.play()
}

function onEnded() {
  store.next()
}

async function loadSong() {
  const song = store.currentSong
  if (!song) return

  const newAudio = createAudio()
  newAudio.src = song.fileUrl

  if (audioRef.value && !audioRef.value.paused) {
    prevAudioRef.value = audioRef.value
    connectAudioGraph(newAudio)
    newAudio.play().catch(() => {})
    await crossfade(prevAudioRef.value, newAudio, 500)
    prevAudioRef.value = null
  } else {
    connectAudioGraph(newAudio)
    newAudio.play().catch(() => {})
  }

  audioRef.value = newAudio

  if (song.coverUrl) {
    extractAccentColor(song.coverUrl)
  }

  setupMediaSession(
    newAudio,
    song,
    () => store.play(),
    () => store.pause(),
    () => store.prev(),
    () => store.next(),
  )
}

watch(() => store.currentSong, (newSong) => {
  if (newSong) {
    loadSong()
  }
})

watch(() => store.state, (newState) => {
  if (!audioRef.value) return
  if (newState === 'playing') {
    getAudioContext().resume()
    audioRef.value.play().catch(() => {})
  } else if (newState === 'paused') {
    audioRef.value.pause()
  }
})

watch(() => store.volume, (v) => {
  if (audioRef.value) {
    audioRef.value.volume = store.muted ? 0 : v
  }
})

watch(() => store.muted, (m) => {
  if (audioRef.value) {
    audioRef.value.volume = m ? 0 : store.volume
  }
})

watch(() => store.speed, (s) => {
  if (audioRef.value) {
    audioRef.value.playbackRate = s
  }
})

function handleSeek(time: number) {
  if (audioRef.value) {
    audioRef.value.currentTime = time
    store.updateTime(time)
  }
}

function handleVolumeUpdate(v: number) {
  store.setVolume(v)
}

function handleMutedUpdate(m: boolean) {
  if (m) {
    store.muted = true
  } else {
    store.muted = false
  }
}

onMounted(() => {
  if (store.currentSong) {
    loadSong()
  }
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
  if (prevAudioRef.value) {
    prevAudioRef.value.pause()
  }
})
</script>

<template>
  <div
    v-if="store.currentSong"
    class="fixed bottom-0 inset-x-0 h-[72px] z-50 flex items-center px-4 gap-4 border-t border-white/5"
    style="backdrop-filter: blur(20px) saturate(180%); background: rgba(9, 9, 11, 0.8);"
  >
    <div class="flex items-center gap-3 w-64 shrink-0">
      <CdCover
        :cover-url="store.currentSong.coverUrl"
        :is-playing="store.isPlaying"
        :size="48"
      />
      <div class="min-w-0">
        <p class="text-sm text-zinc-100 truncate">{{ store.currentSong.title }}</p>
        <p class="text-xs text-zinc-400 truncate">{{ store.currentSong.artist }}</p>
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center gap-1 max-w-2xl">
      <PlaybackControls
        :is-playing="store.isPlaying"
        :play-mode="store.playMode"
        :speed="store.speed"
        :accent-color="store.accentColor"
        @toggle-play="store.togglePlay()"
        @next="store.next()"
        @prev="store.prev()"
        @cycle-mode="store.cyclePlayMode()"
        @change-speed="store.setSpeed($event)"
      />
      <ProgressBar
        :current-time="store.currentTime"
        :duration="store.duration"
        :accent-color="store.accentColor"
        @seek="handleSeek"
      />
    </div>

    <div class="flex items-center gap-3 w-64 shrink-0 justify-end">
      <VolumeControl
        :volume="store.volume"
        :muted="store.muted"
        :accent-color="store.accentColor"
        @update:volume="handleVolumeUpdate"
        @update:muted="handleMutedUpdate"
      />
    </div>
  </div>

  <div
    v-else
    class="fixed bottom-0 inset-x-0 h-[72px] z-50 flex items-center justify-center border-t border-white/5"
    style="backdrop-filter: blur(20px) saturate(180%); background: rgba(9, 9, 11, 0.8);"
  >
    <div class="flex items-center gap-2 text-zinc-500">
      <Music :size="16" />
      <span class="text-sm">No song playing</span>
    </div>
  </div>
</template>
