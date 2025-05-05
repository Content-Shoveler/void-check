<template>
  <div id="app" class="cyber-app">
    <!-- Skip link for accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <!-- App Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main id="main-content" class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSettingsStore } from './store/modules/settings'
import AppHeader from './components/layout/AppHeader.vue'

export default defineComponent({
  name: 'App',
  
  components: {
    AppHeader
  },
  
  setup() {
    // Initialize the settings store (used for theme settings)
    const _settingsStore = useSettingsStore()
    
    // Get current year for footer
    const currentYear = computed(() => new Date().getFullYear())
    
    return {
      currentYear
    }
  }
})
</script>

<style lang="scss">
// Import main styles
@use './styles/main.scss';

// App-specific styling
.cyber-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding: var(--space-4) 0;
}

.app-footer {
  padding: var(--space-4) 0;
  background-color: var(--color-background-elevated);
  border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

</style>
