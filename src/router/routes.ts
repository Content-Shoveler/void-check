import { RouteRecordRaw } from 'vue-router';

/**
 * Application route definitions
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'VoidCheck - Visual Task Management',
      requiresOnline: false
    }
  },
  {
    path: '/task/:id',
    name: 'task-detail',
    component: () => import('@/views/TaskDetailView.vue'),
    props: true,
    meta: {
      title: 'Task Details',
      requiresOnline: false
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: 'Settings',
      requiresOnline: false
    }
  },
  {
    path: '/offline',
    name: 'offline',
    component: () => import('@/views/OfflineView.vue'),
    meta: {
      title: 'Offline Mode',
      requiresOnline: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: { name: 'home' }
  }
];

export default routes;
