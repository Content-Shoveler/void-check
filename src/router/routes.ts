import type { RouteRecordRaw } from 'vue-router';

/**
 * Application routes configuration
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'VoidCheck - Visual Timeline',
      requiresAuth: false
    }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/TaskListView.vue'),
    meta: {
      title: 'VoidCheck - Tasks',
      requiresAuth: false
    }
  },
  {
    path: '/task/:id',
    name: 'task-detail',
    component: () => import('@/views/TaskDetailView.vue'),
    props: true,
    meta: {
      title: 'VoidCheck - Task Details',
      requiresAuth: false
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: 'VoidCheck - Settings',
      requiresAuth: false
    }
  },
  {
    path: '/offline',
    name: 'offline',
    component: () => import('@/views/OfflineView.vue'),
    meta: {
      title: 'VoidCheck - Offline',
      requiresAuth: false
    }
  },
  {
    // Catch-all fallback route
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'VoidCheck - Page Not Found',
      requiresAuth: false
    }
  }
];

export default routes;
