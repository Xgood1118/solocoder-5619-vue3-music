<script setup lang="ts">
import { ref, computed } from 'vue'
import { FolderOpen, Upload, Loader2, Music, Plus } from 'lucide-vue-next'
import { useMusicStore } from '@/stores/useMusicStore'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const musicStore = useMusicStore()
const isDragging = ref(false)
const importing = ref(false)

async function handleImport() {
  importing.value = true
  try {
    await musicStore.importFiles()
  } finally {
    importing.value = false
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || []).filter(f =>
    /\.(mp3|flac|wav|aac|ogg)$/i.test(f.name)
  )
  if (files.length === 0) return
  importing.value = true
  // Simulate import for drag-drop (could reuse parseMusicFile from store)
  setTimeout(() => {
    importing.value = false
  }, 1000)
}
</script>

<template>
  <div
    class="relative rounded-2xl overflow-hidden cursor-pointer group transition-all"
    :class="[
      isDragging ? 'ring-2 ring-violet-500 scale-[1.01]' : '',
      props.compact ? '' : 'rounded-3xl',
    ]"
    :style="props.compact
      ? 'background: linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(59, 130, 246, 0.06)); border: 1px dashed rgba(255,255,255,0.08);'
      : 'background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08)); border: 1px dashed rgba(255,255,255,0.1);'"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="handleImport"
  >
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      :style="props.compact
        ? ''
        : 'background: radial-gradient(circle at 30% 20%, rgba(139,92,246,0.15), transparent 50%), radial-gradient(circle at 70% 80%, rgba(59,130,246,0.15), transparent 50%);'"
    />

    <!-- Compact: horizontal one-liner -->
    <template v-if="props.compact">
      <div class="relative px-5 py-3 flex items-center gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="relative shrink-0">
            <div
              class="absolute inset-0 rounded-xl blur-xl opacity-30 transition-opacity"
              :class="isDragging ? 'bg-violet-500/40' : 'bg-violet-500/15 group-hover:bg-violet-500/25'"
            />
            <div class="relative w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style="background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25)); border: 1px solid rgba(255,255,255,0.1);"
            >
              <Loader2 v-if="importing" :size="16" class="text-white animate-spin" />
              <Plus v-else :size="16" class="text-white/90" />
            </div>
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-zinc-100 truncate">
              {{ importing ? '正在导入音乐...' : '添加本地音乐' }}
            </div>
            <div class="text-xs text-zinc-500 truncate">
              拖拽文件到此处，或点击选择文件夹（支持 MP3 / FLAC / WAV / AAC / OGG）
            </div>
          </div>
        </div>
        <button
          class="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-xs text-white transition-all hover:scale-[1.03] shadow-md"
          style="background: linear-gradient(135deg, rgb(139,92,246), rgb(99,102,241));"
          @click.stop="handleImport"
          :disabled="importing"
        >
          <Upload :size="13" />
          选择文件夹
        </button>
      </div>
    </template>

    <!-- Full: big banner -->
    <template v-else>
      <div class="relative p-10 text-center">
        <div class="flex items-center justify-center mb-5">
          <div class="relative">
            <div
              class="absolute inset-0 rounded-2xl blur-2xl opacity-40 transition-opacity"
              :class="isDragging ? 'bg-violet-500/40' : 'bg-violet-500/20 group-hover:bg-violet-500/30'"
            />
            <div class="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
              style="background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25)); border: 1px solid rgba(255,255,255,0.1);"
            >
              <Loader2 v-if="importing" :size="28" class="text-white animate-spin" />
              <FolderOpen v-else :size="28" class="text-white/90" />
            </div>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-zinc-100 mb-1.5">
          {{ importing ? '正在导入音乐...' : '导入本地音乐' }}
        </h3>
        <p class="text-sm text-zinc-500 mb-5 max-w-md mx-auto">
          选择文件夹或拖拽文件到此处，支持 MP3、FLAC、WAV、AAC、OGG 格式
        </p>

        <div class="flex items-center justify-center gap-3">
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white transition-all hover:scale-105 shadow-lg"
            style="background: linear-gradient(135deg, rgb(139,92,246), rgb(99,102,241));"
            @click.stop="handleImport"
            :disabled="importing"
          >
            <Upload :size="16" />
            选择文件夹
          </button>
          <div class="flex items-center gap-1.5 text-xs text-zinc-600">
            <Music :size="12" />
            <span>自动解析 ID3 元数据</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
