<script setup lang="ts">
import { ref } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  search: [keyword: string]
}>()

const input = ref('')
const router = useRouter()

function submit() {
  const kw = input.value.trim()
  if (!kw) return
  emit('search', kw)
  if (router.currentRoute.value.path !== '/search') {
    router.push({ path: '/search', query: { q: kw } })
  }
}

function clear() {
  input.value = ''
}
</script>

<template>
  <form
    class="relative group"
    @submit.prevent="submit"
  >
    <Search
      :size="16"
      class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors"
    />
    <input
      v-model="input"
      type="text"
      placeholder="搜索歌曲、歌手、专辑或歌词..."
      class="w-full h-10 pl-11 pr-10 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all border"
      style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06);"
      :class="input.length > 0
        ? 'border-violet-500/50'
        : 'focus:border-violet-500/40 focus:bg-white/[0.04]'"
    />
    <button
      v-if="input.length > 0"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-all"
      @click="clear"
    >
      <X :size="14" />
    </button>
  </form>
</template>
