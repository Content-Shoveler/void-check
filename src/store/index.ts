import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Create the root store
const pinia = createPinia();

// Apply the persisted state plugin
pinia.use(piniaPluginPersistedstate);

export default pinia;
