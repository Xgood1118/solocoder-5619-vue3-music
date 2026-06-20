<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useMusicStore } from '@/stores/useMusicStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import Sidebar from '@/components/common/Sidebar.vue'
import PlayerBar from '@/components/player/PlayerBar.vue'
import PlayerFull from '@/components/player/PlayerFull.vue'
import Equalizer from '@/components/equalizer/Equalizer.vue'
import Visualizer from '@/components/visualizer/Visualizer.vue'
import { Maximize2, Minimize2, Menu, X } from 'lucide-vue-next'

const playerStore = usePlayerStore()
const musicStore = useMusicStore()
const playlistStore = usePlaylistStore()

const showFullPlayer = ref(false)
const showSidebar = ref(true)
const showRightPanel = ref(false)
const rightPanelTab = ref<'visualizer' | 'equalizer'>('visualizer')

const accentColor = playerStore.accentColor

watch(
  () => playerStore.accentColor,
  (c) => {
    document.documentElement.style.setProperty('--accent', c)
    const rgbMatch = c.match(/\d+/g)
    if (rgbMatch && rgbMatch.length >= 3) {
      document.documentElement.style.setProperty(
        '--accent-rgb',
        `${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]}`,
      )
    }
  },
  { immediate: true },
)

function handleSeek(e: Event) {
  const time = (e as CustomEvent).detail as number
  if (time >= 0) {
    const evt = new CustomEvent('audio-seek', { detail: time })
    window.dispatchEvent(evt)
  }
}

onMounted(async () => {
  window.addEventListener('player-seek', handleSeek)
  await musicStore.loadSongs()
  await playlistStore.loadPlaylists()

  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('player-seek', handleSeek)
  window.removeEventListener('keydown', onKeyDown)
})

function onKeyDown(e: KeyboardEvent) {
  if ((e.target as HTMLElement).tagName === 'INPUT') return
  if ((e.target as HTMLElement).tagName === 'TEXTAREA') return

  if (e.code === 'Space') {
    e.preventDefault()
    playerStore.togglePlay()
  } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
    playerStore.next()
  } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
    playerStore.prev()
  } else if (e.code === 'KeyM') {
    playerStore.toggleMute()
  } else if (e.code === 'KeyF') {
    showFullPlayer.value = !showFullPlayer.value
  }
}

function toggleVisualizerPanel() {
  rightPanelTab.value = 'visualizer'
  showRightPanel.value = !showRightPanel.value || rightPanelTab.value !== 'visualizer'
}
</script>

<template>
  <div class="h-full w-full flex flex-col relative overflow-hidden">
    <div class="flex flex-1 min-h-0">
      <Transition name="slide-left">
        <Sidebar v-show="showSidebar" class="shrink-0 h-full" />
      </Transition>

      <main class="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <header class="flex items-center justify-between px-6 py-3 shrink-0 border-b border-white/5">
          <div class="flex items-center gap-3">
            <button
              class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all lg:hidden"
              @click="showSidebar = !showSidebar"
            >
              <component :is="showSidebar ? X : Menu" :size="18" />
            </button>
          </div>
          <div class="flex items-center gap-1.5">
            <button
              class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
              :class="rightPanelTab === 'visualizer' && showRightPanel ? 'text-white bg-white/10' : ''"
              @click="toggleVisualizerPanel"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12h2M6 8v8M10 4v16M14 8v8M18 10v4M22 12h-2" stroke-linecap="round" />
              </svg>
            </button>
            <Equalizer :accent-color="accentColor" />
            <button
              v-if="playerStore.currentSong"
              class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
              title="全屏播放器 (F)"
              @click="showFullPlayer = true"
            >
              <Maximize2 :size="16" />
            </button>
          </div>
        </header>

        <div class="flex flex-1 min-h-0">
          <div class="flex-1 min-w-0 min-h-0 overflow-hidden">
            <div class="h-full overflow-y-auto scrollbar-thin px-6 py-6">
              <router-view v-slot="{ Component }">
                <Transition name="fade-slide" mode="out-in">
                  <component :is="Component" />
                </Transition>
              </router-view>
            </div>
          </div>

          <Transition name="slide-right">
            <aside
              v-show="showRightPanel"
              class="w-80 shrink-0 border-l border-white/5 flex flex-col h-full hidden lg:flex"
            >
              <Visualizer v-if="rightPanelTab === 'visualizer'" :accent-color="accentColor" />
            </aside>
          </Transition>
        </div>
      </main>
    </div>

    <div
      class="shrink-0"
      :class="playerStore.currentSong ? 'h-[72px]' : 'h-[72px]'"
    >
      <PlayerBar />
    </div>

    <Transition name="scale-fade">
      <PlayerFull v-if="showFullPlayer" @close="showFullPlayer = false" />
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
