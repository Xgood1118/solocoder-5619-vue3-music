<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { BarChart3, Circle, Waves } from 'lucide-vue-next'
import { getAnalyser } from '@/audio/audio-context'
import { drawBars, drawCircular, drawWave } from '@/utils/visualizer-render'
import type { VisualizerMode } from '@/utils/visualizer-render'

const props = defineProps<{
  accentColor: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mode = ref<VisualizerMode>('bars')
let rafId = 0

const modes: { id: VisualizerMode; icon: any; label: string }[] = [
  { id: 'bars', icon: BarChart3, label: '条形' },
  { id: 'circular', icon: Circle, label: '环形' },
  { id: 'wave', icon: Waves, label: '波浪' },
]

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const analyser = getAnalyser()

  switch (mode.value) {
    case 'bars':
      drawBars(ctx, analyser, rect.width, rect.height, props.accentColor)
      break
    case 'circular':
      drawCircular(ctx, analyser, rect.width, rect.height, props.accentColor)
      break
    case 'wave':
      drawWave(ctx, analyser, rect.width, rect.height, props.accentColor)
      break
  }

  rafId = requestAnimationFrame(render)
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  render()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-1 px-4 py-2 border-b border-zinc-800">
      <button
        v-for="m in modes"
        :key="m.id"
        class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5"
        :class="mode === m.id
          ? 'text-zinc-100 bg-zinc-800/70'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'"
        @click="mode = m.id"
      >
        <component :is="m.icon" :size="14" :style="mode === m.id ? { color: accentColor } : {}" />
        {{ m.label }}
      </button>
    </div>
    <div class="flex-1 p-3">
      <canvas
        ref="canvasRef"
        class="w-full h-full rounded-xl"
        style="background: rgba(0, 0, 0, 0.3);"
      />
    </div>
  </div>
</template>
