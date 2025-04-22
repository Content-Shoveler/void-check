/**
 * VoidCheck - Visual Timer Todo App
 * Main application entry point
 */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './store';
import { registerServiceWorker } from './registerServiceWorker';

// Import styles
import './styles/global.scss';

// Create Vue app instance
const app = createApp(App);

// Use plugins
app.use(pinia);
app.use(router);

// Register service worker
registerServiceWorker();

// Mount application
app.mount('#app');

console.log('VoidCheck application initialized.');
