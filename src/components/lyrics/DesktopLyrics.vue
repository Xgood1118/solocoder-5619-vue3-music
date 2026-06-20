<template>
  <Teleport to="body">
    <div v-if="false" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { parseLrc, findCurrentLine } from '@/utils/lrc-parser'
import type { LrcLine } from '@/utils/lrc-parser'

const props = defineProps<{
  lyrics: string
  currentTime: number
  accentColor: string
}>()

const DESKTOP_LYRICS_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
  body {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 32px 48px;
    background: rgba(24, 24, 27, 0.75);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-radius: 16px;
  }
  .current { font-size: 28px; font-weight: 600; text-align: center; margin-bottom: 12px; transition: color 0.3s; line-height: 1.4; }
  .next { font-size: 18px; text-align: center; opacity: 0.4; transition: color 0.3s; line-height: 1.4; }
  .close-btn {
    position: absolute; top: 8px; right: 12px; background: none; border: none;
    color: rgba(255,255,255,0.5); font-size: 20px; cursor: pointer; line-height: 1;
  }
  .close-btn:hover { color: rgba(255,255,255,0.8); }
</style>
</head>
<body>
  <button class="close-btn" onclick="window.close()">&times;</button>
  <div class="current" id="current"></div>
  <div class="next" id="next"></div>
  <script>
    const bc = new BroadcastChannel('desktop-lyrics');
    bc.onmessage = (e) => {
      const d = e.data;
      if (d.type === 'update') {
        document.getElementById('current').textContent = d.current || '';
        document.getElementById('next').textContent = d.next || '';
        if (d.accentColor) {
          document.getElementById('current').style.color = d.accentColor;
          document.getElementById('next').style.color = d.accentColor;
        }
      } else if (d.type === 'close') {
        window.close();
      }
    };
  <\/script>
</body>
</html>`

let popupWindow: Window | null = null
let channel: BroadcastChannel | null = null

const parsedLines = ref<LrcLine[]>([])

watch(() => props.lyrics, (val) => {
  parsedLines.value = parseLrc(val)
}, { immediate: true })

function openDesktopLyrics() {
  if (popupWindow && !popupWindow.closed) return

  const blob = new Blob([DESKTOP_LYRICS_HTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  popupWindow = window.open(url, 'desktop-lyrics', 'width=600,height=160,alwaysOnTop=yes,frame=false,transparent=yes')

  URL.revokeObjectURL(url)

  channel = new BroadcastChannel('desktop-lyrics')
}

function closeDesktopLyrics() {
  if (channel) {
    channel.postMessage({ type: 'close' })
    channel.close()
    channel = null
  }
  if (popupWindow && !popupWindow.closed) {
    popupWindow.close()
  }
  popupWindow = null
}

watch([() => props.currentTime, parsedLines], () => {
  if (!channel || !popupWindow || popupWindow.closed) return
  const lines = parsedLines.value
  const idx = findCurrentLine(lines, props.currentTime)
  const current = idx >= 0 ? lines[idx].text : ''
  const next = idx >= 0 && idx < lines.length - 1 ? lines[idx + 1].text : ''
  channel.postMessage({
    type: 'update',
    current,
    next,
    accentColor: props.accentColor,
  })
}, { immediate: true })

onUnmounted(() => {
  closeDesktopLyrics()
})

defineExpose({ openDesktopLyrics, closeDesktopLyrics })
</script>
