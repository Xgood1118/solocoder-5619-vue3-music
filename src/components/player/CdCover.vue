<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  coverUrl: string
  isPlaying: boolean
  size?: number
}>(), {
  size: 280,
})

const cdSize = computed(() => `${props.size}px`)
const coverSize = computed(() => `${props.size * 0.62}px`)
const centerHole = computed(() => `${props.size * 0.14}px`)
</script>

<template>
  <div
    class="cd-wrapper"
    :class="{ spinning: isPlaying }"
    :style="{ width: cdSize, height: cdSize }"
  >
    <div class="cd-disc">
      <div
        class="cd-cover"
        :style="{
          backgroundImage: `url(${coverUrl})`,
          width: coverSize,
          height: coverSize,
        }"
      />
      <div class="cd-grooves">
        <span v-for="i in 8" :key="i" class="groove" :style="{ width: `${50 + i * 5}%`, height: `${50 + i * 5}%` }" />
      </div>
      <div
        class="cd-center"
        :style="{ width: centerHole, height: centerHole }"
      />
    </div>
  </div>
</template>

<style scoped>
.cd-wrapper {
  perspective: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cd-disc {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #1a1a2e 0%,
    #16213e 20%,
    #0f0f23 40%,
    #1a1a2e 60%,
    #16213e 80%,
    #0f0f23 100%
  );
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 0 60px rgba(0, 0, 0, 0.3);
  transform-style: preserve-3d;
  animation: spin 8s linear infinite;
  animation-play-state: paused;
  overflow: hidden;
}

.spinning .cd-disc {
  animation-play-state: running;
  transform: rotateY(0deg);
}

.cd-cover {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.cd-grooves {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1;
}

.groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.cd-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, #0a0a0a 40%, #1a1a1a 70%, #0a0a0a 100%);
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.8),
    0 0 8px rgba(0, 0, 0, 0.4);
  z-index: 3;
}

@keyframes spin {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}
</style>
