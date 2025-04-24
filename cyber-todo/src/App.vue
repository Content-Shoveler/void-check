<template>
  <div id="app" class="cyber-app">
    <!-- Skip link for accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <!-- App Header -->
    <header class="app-header">
      <div class="container flex-between">
        <h1 class="app-title cyber-text-glow">CyberTodo</h1>
        <nav class="app-nav">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/tasks" class="nav-link">Tasks</router-link>
          <router-link to="/settings" class="nav-link">Settings</router-link>
        </nav>
      </div>
    </header>
    
    <!-- Main Content -->
    <main id="main-content" class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- App Footer -->
    <footer class="app-footer">
      <div class="container">
        <p>&copy; {{ currentYear }} Cyberpunk Space Todo</p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSettingsStore } from './store/modules/settings'

export default defineComponent({
  name: 'App',
  
  setup() {
    // Initialize the settings store
    const settingsStore = useSettingsStore()
    
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
@import './styles/main.scss';

// App-specific styling
.cyber-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  padding: var(--space-4) 0;
  background-color: var(--color-background-elevated);
  border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  
  .app-title {
    font-size: var(--text-xl);
    margin: 0;
    font-family: var(--font-primary);
    letter-spacing: 0.05em;
  }
  
  .app-nav {
    display: flex;
    gap: var(--space-4);
    
    .nav-link {
      position: relative;
      color: var(--color-text-secondary);
      text-decoration: none;
      font-family: var(--font-primary);
      padding: var(--space-2);
      transition: var(--transition-color);
      
      &:hover {
        color: var(--color-primary);
      }
      
      &.router-link-active {
        color: var(--color-primary);
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-primary);
          box-shadow: var(--effect-glow-primary);
        }
      }
    }
  }
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

// Media queries for responsive design
@include responsive("mobile") {
  .app-header {
    .container {
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }
    
    .app-nav {
      gap: var(--space-2);
    }
  }
}
</style>
