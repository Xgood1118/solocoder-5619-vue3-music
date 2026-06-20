<script setup lang="ts">
import { computed } from 'vue'
import { Volume2, Volume1, VolumeX } from 'lucide-vue-next'

const props = defineProps<{
  volume: number
  muted: boolean
  accentColor: string
}>()

const emit = defineEmits<{
  'update:volume': [v: number]
  'update:muted': [v: boolean]
}>()

const effectiveVolume = computed(() => props.muted ? 0 : props.volume)

const VolumeIcon = computed(() => {
  if (effectiveVolume.value === 0) return VolumeX
  if (effectiveVolume.value < 0.5) return Volume1
  return Volume2
})

function onSliderInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  emit('update:volume', val)
  if (val > 0 && props.muted) {
    emit('update:muted', false)
  }
}

function toggleMute() {
  emit('update:muted', !props.muted)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      class="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
      @click="toggleMute"
    >
      <VolumeIcon :size="18" />
    </button>

    <div class="volume-slider-wrapper group flex items-center w-20">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="effectiveVolume"
        class="volume-slider"
        :style="{ '--accent': accentColor }"
        @input="onSliderInput"
      />
    </div>
  </div>
</template>

<style scoped>
.volume-slider-wrapper {
  position: relative;
  height: 20px;
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #3f3f46;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.group:hover .volume-slider::-webkit-slider-thumb {
  opacity: 1;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: none;
  opacity: 0;
  transition: opacity 0.15s;
}

.group:hover .volume-slider::-moz-range-thumb {
  opacity: 1;
}
</style>
