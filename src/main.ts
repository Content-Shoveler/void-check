import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './store';
import { initDatabase } from './data/db/dexie/db';
import { createI18n } from 'vue-i18n';
import { registerSW } from 'virtual:pwa-register';

// Import global styles
import './styles/global.scss';

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      // Default messages will be added here
      app: {
        name: 'VoidCheck',
        tagline: 'Check the void'
      }
    }
  }
});

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Logic to prompt user to refresh for new content
    console.log('New content available, please refresh');
  },
  onOfflineReady() {
    // Logic to notify user the app is ready for offline use
    console.log('App ready for offline use');
  }
});

// Initialize the database
initDatabase().then(() => {
  // Create and mount the Vue app
  const app = createApp(App);
  
  app.use(pinia);
  app.use(router);
  app.use(i18n);
  
  app.mount('#app');
  
  // Console message to confirm app initialization
  console.log('VoidCheck initialized. Check the void!');
}).catch(error => {
  console.error('Failed to initialize the application:', error);
});
