<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  currentTime: number
  duration: number
  accentColor: string
}>()

const emit = defineEmits<{
  seek: [time: number]
}>()

const isDragging = ref(false)
const trackRef = ref<HTMLElement | null>(null)

const progress = computed(() =>
  props.duration > 0 ? props.currentTime / props.duration : 0
)

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getTimeFromEvent(e: MouseEvent): number {
  if (!trackRef.value) return 0
  const rect = trackRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  return (x / rect.width) * props.duration
}

function onTrackClick(e: MouseEvent) {
  const time = getTimeFromEvent(e)
  emit('seek', time)
}

function onThumbMouseDown(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true

  const onMouseMove = (ev: MouseEvent) => {
    const time = getTimeFromEvent(ev)
    emit('seek', time)
  }

  const onMouseUp = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="flex items-center gap-3 w-full select-none">
    <span class="text-xs text-zinc-400 w-10 text-right tabular-nums shrink-0">
      {{ formatTime(currentTime) }}
    </span>

    <div
      ref="trackRef"
      class="progress-track group relative flex-1 h-5 flex items-center cursor-pointer"
      @click="onTrackClick"
    >
      <div class="absolute inset-x-0 h-1 rounded-full bg-zinc-700 transition-all group-hover:h-1.5" />

      <div
        class="absolute left-0 h-1 rounded-full transition-all group-hover:h-1.5"
        :style="{
          width: `${progress * 100}%`,
          backgroundColor: accentColor,
        }"
      />

      <div
        class="absolute thumb-wrapper transition-all"
        :style="{
          left: `${progress * 100}%`,
          transform: 'translateX(-50%)',
        }"
        @mousedown="onThumbMouseDown"
      >
        <div
          class="w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          :class="{ 'opacity-100': isDragging }"
          :style="{ backgroundColor: accentColor }"
        />
      </div>
    </div>

    <span class="text-xs text-zinc-400 w-10 tabular-nums shrink-0">
      {{ formatTime(duration) }}
    </span>
  </div>
</template>
