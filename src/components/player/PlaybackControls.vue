<script setup lang="ts">
import { computed } from 'vue'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ArrowRight,
} from 'lucide-vue-next'
import type { PlayMode } from '@/types/player'

const props = defineProps<{
  isPlaying: boolean
  playMode: PlayMode
  speed: number
  accentColor: string
}>()

const emit = defineEmits<{
  'toggle-play': []
  next: []
  prev: []
  'cycle-mode': []
  'change-speed': [speed: number]
}>()

const modeIcon = computed(() => {
  switch (props.playMode) {
    case 'single-loop':
      return Repeat1
    case 'random':
      return Shuffle
    default:
      return Repeat
  }
})

const modeLabel = computed(() => {
  switch (props.playMode) {
    case 'list-loop':
      return 'List Loop'
    case 'single-loop':
      return 'Single Loop'
    case 'random':
      return 'Shuffle'
    case 'sequential':
      return 'Sequential'
  }
})

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

function cycleSpeed() {
  const idx = speedOptions.indexOf(props.speed)
  const next = idx >= 0 ? speedOptions[(idx + 1) % speedOptions.length] : 1
  emit('change-speed', next)
}
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div class="flex items-center gap-4">
      <button
        class="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
        :title="modeLabel"
        @click="emit('cycle-mode')"
      >
        <component :is="modeIcon" :size="16" />
      </button>

      <button
        class="p-1.5 text-zinc-300 hover:text-zinc-100 transition-colors"
        @click="emit('prev')"
      >
        <SkipBack :size="20" fill="currentColor" />
      </button>

      <button
        class="flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all hover:scale-105"
        :style="{ borderColor: accentColor }"
        @click="emit('toggle-play')"
      >
        <component
          :is="isPlaying ? Pause : Play"
          :size="20"
          class="text-zinc-100"
          :class="{ 'ml-0.5': !isPlaying }"
        />
      </button>

      <button
        class="p-1.5 text-zinc-300 hover:text-zinc-100 transition-colors"
        @click="emit('next')"
      >
        <SkipForward :size="20" fill="currentColor" />
      </button>

      <button
        class="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
        @click="cycleSpeed"
      >
        <span class="text-xs font-medium tabular-nums">{{ speed }}x</span>
      </button>
    </div>

    <div class="flex items-center gap-3 text-[10px] text-zinc-500">
      <span>{{ modeLabel }}</span>
      <span v-if="playMode === 'sequential'" class="flex items-center gap-0.5">
        <ArrowRight :size="10" />
      </span>
    </div>
  </div>
</template>
