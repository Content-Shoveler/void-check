import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { isOffline } from '@/registerServiceWorker';

/**
 * Vue Router instance
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Smooth scrolling behavior for navigation
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

/**
 * Navigation guards
 */
router.beforeEach((to, from, next) => {
  // Set document title based on route meta
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // Offline mode handling
  const requiresOnline = to.meta.requiresOnline !== false;
  
  if (requiresOnline && isOffline()) {
    // Redirect to offline page if trying to access an online-only route
    next({ name: 'offline', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
