import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Route definitions
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'Home - Cyberpunk Space Todo'
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
    meta: {
      title: 'Tasks - Cyberpunk Space Todo'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: 'Settings - Cyberpunk Space Todo'
    }
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: () => import('../views/Integrations.vue'),
    meta: {
      title: 'Calendar Integrations - Cyberpunk Space Todo'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '404 - Cyberpunk Space Todo'
    }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Update document title based on route meta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'Cyberpunk Space Todo'
  next()
})

export default router
