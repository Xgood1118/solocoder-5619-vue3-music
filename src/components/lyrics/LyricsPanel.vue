<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
      <button
        class="p-1.5 rounded-md transition-colors"
        :class="karaokeMode ? 'bg-zinc-700' : 'hover:bg-zinc-800'"
        :style="karaokeMode ? { color: accentColor } : {}"
        @click="$emit('toggle-karaoke')"
      >
        <MicVocal class="w-4 h-4" />
      </button>
      <button
        class="p-1.5 rounded-md transition-colors hover:bg-zinc-800 text-zinc-400"
        @click="$emit('toggle-translate')"
      >
        <Languages class="w-4 h-4" />
      </button>
      <button
        class="p-1.5 rounded-md transition-colors hover:bg-zinc-800 text-zinc-400"
        @click="$emit('toggle-desktop-lyrics')"
      >
        <Monitor class="w-4 h-4" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide">
      <div class="flex flex-col items-center gap-6">
        <div
          v-for="(line, index) in parsedLines"
          :key="index"
          :ref="(el) => { if (el) lineEls[index] = el as HTMLElement }"
        >
          <LyricsLine
            :text="line.text"
            :translation="line.translation"
            :time="line.time"
            :is-active="index === currentLineIndex"
            :karaoke-progress="getKaraokeProgress(index)"
            :accent-color="accentColor"
            @click="$emit('seek', line.time)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { MicVocal, Languages, Monitor } from 'lucide-vue-next'
import { parseLrc, parseEnhancedLrc, findCurrentLine } from '@/utils/lrc-parser'
import type { LrcLine } from '@/utils/lrc-parser'
import LyricsLine from './LyricsLine.vue'

const props = defineProps<{
  lyrics: string
  currentTime: number
  accentColor: string
  karaokeMode: boolean
}>()

defineEmits<{
  seek: [time: number]
  'toggle-karaoke': []
  'toggle-translate': []
  'toggle-desktop-lyrics': []
}>()

const lineEls = ref<Record<number, HTMLElement>>({})

const parsedLines = computed<LrcLine[]>(() => {
  if (!props.lyrics) return []
  if (props.karaokeMode) {
    const enhanced = parseEnhancedLrc(props.lyrics)
    if (enhanced.some(l => l.syllables && l.syllables.length > 0)) return enhanced
  }
  return parseLrc(props.lyrics)
})

const currentLineIndex = computed(() => {
  return findCurrentLine(parsedLines.value, props.currentTime)
})

function getKaraokeProgress(index: number): number {
  if (!props.karaokeMode || index !== currentLineIndex.value) return 0
  const line = parsedLines.value[index]
  if (!line?.syllables?.length) return 0

  let elapsedTextLen = 0
  let totalTextLen = 0

  for (const s of line.syllables) {
    totalTextLen += s.text.length
    if (props.currentTime >= s.time + s.duration) {
      elapsedTextLen += s.text.length
    } else if (props.currentTime >= s.time) {
      const progress = Math.min(1, (props.currentTime - s.time) / Math.max(s.duration, 0.01))
      elapsedTextLen += s.text.length * progress
    }
  }

  return totalTextLen > 0 ? elapsedTextLen / totalTextLen : 0
}

watch(currentLineIndex, async (idx) => {
  if (idx < 0) return
  await nextTick()
  const el = lineEls.value[idx]
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
})

watch(() => props.lyrics, () => {
  lineEls.value = {}
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
