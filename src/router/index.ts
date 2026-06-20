import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Library from '@/views/Library.vue'
import Playlist from '@/views/Playlist.vue'
import Search from '@/views/Search.vue'
import Settings from '@/views/Settings.vue'
import Stats from '@/views/Stats.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { path: '/library' },
  },
  {
    path: '/library',
    name: 'library',
    component: Library,
  },
  {
    path: '/playlist/:id?',
    name: 'playlist',
    component: Playlist,
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
  },
  {
    path: '/stats',
    name: 'stats',
    component: Stats,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
