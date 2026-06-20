<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sliders, Save, Trash2 } from 'lucide-vue-next'
import { EQ_FREQUENCIES, EQ_PRESETS } from '@/types/equalizer'
import { updateEQBand, applyEQPreset } from '@/audio/eq'

const props = defineProps<{
  accentColor: string
}>()

const bands = ref<number[]>([...EQ_PRESETS[0].bands])
const activePreset = ref('flat')
const customName = ref('')
const showPanel = ref(false)

function updateBand(index: number, value: number) {
  bands.value[index] = value
  updateEQBand(index, value)
  activePreset.value = 'custom'
}

function applyPreset(id: string) {
  const preset = EQ_PRESETS.find(p => p.id === id)
  if (!preset) return
  bands.value = [...preset.bands]
  applyEQPreset(preset.bands)
  activePreset.value = id
}

const freqLabels = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K']
</script>

<template>
  <div class="relative">
    <button
      class="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
      :style="showPanel ? { color: accentColor, background: 'rgba(255,255,255,0.05)' } : {}"
      @click="showPanel = !showPanel"
    >
      <Sliders :size="18" />
    </button>

    <Transition name="fade">
      <div
        v-if="showPanel"
        class="absolute bottom-full right-0 mb-3 w-[520px] p-5 rounded-2xl border border-zinc-800 shadow-2xl"
        style="background: rgba(12, 12, 14, 0.95); backdrop-filter: blur(20px);"
      >
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-sm font-semibold text-zinc-100">均衡器</h3>
          <button
            class="text-xs text-zinc-500 hover:text-zinc-300"
            @click="showPanel = false"
          >
            关闭
          </button>
        </div>

        <div class="flex justify-between gap-3 mb-5 h-44 px-2">
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
                class="absolute w-3 h-3 rounded-full transition-all pointer-events-none"
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
              : 'text-zinc-400 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-800'"
            :style="activePreset === preset.id ? { backgroundColor: accentColor } : {}"
            @click="applyPreset(preset.id)"
          >
            {{ preset.displayName }}
          </button>
          <div class="flex items-center gap-1 ml-auto">
            <input
              v-model="customName"
              type="text"
              placeholder="自定义名称"
              class="px-2 py-1 text-xs rounded-md bg-zinc-800/50 text-zinc-200 border border-zinc-700 focus:outline-none w-20"
            />
            <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
              <Save :size="12" />
            </button>
            <button class="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 :size="12" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
