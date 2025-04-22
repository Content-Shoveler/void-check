import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guard for setting page titles
router.beforeEach((to, from, next) => {
  // Set page title based on route meta
  document.title = to.meta.title as string || 'VoidCheck';
  
  // Check if user is online for offline route
  if (to.name !== 'offline' && !navigator.onLine) {
    next({ name: 'offline' });
  } else {
    next();
  }
});

export default router;
