<template>
  <div
    class="relative cursor-pointer transition-all duration-500 ease-out select-none"
    :class="cn(
      isActive ? 'text-lg font-semibold scale-105' : 'text-sm text-zinc-500',
    )"
    :style="{ color: isActive ? accentColor : undefined }"
    @click="$emit('click')"
  >
    <span class="relative inline-block overflow-hidden">
      <span>{{ text }}</span>
      <span
        v-if="karaokeProgress > 0"
        class="absolute inset-0 overflow-hidden"
        :style="{ width: `${karaokeProgress * 100}%` }"
      >
        <span
          class="inline-block"
          :style="{
            color: accentColor,
            opacity: 0.7,
            width: `${1 / Math.max(karaokeProgress, 0.01) * 100}%`,
          }"
        >{{ text }}</span>
      </span>
    </span>
    <div
      v-if="translation"
      class="mt-0.5 transition-all duration-500"
      :class="isActive ? 'text-xs opacity-70' : 'text-xs opacity-40'"
      :style="{ color: isActive ? accentColor : undefined }"
    >
      {{ translation }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  text: string
  translation?: string
  time: number
  isActive: boolean
  karaokeProgress: number
  accentColor: string
}>()

defineEmits<{
  click: []
}>()
</script>
