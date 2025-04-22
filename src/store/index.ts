import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Create the pinia instance
const pinia = createPinia();

// Add the persistedstate plugin
pinia.use(piniaPluginPersistedstate);

export default pinia;
