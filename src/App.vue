<template>
  <div id="app" :class="{ 'app-dark': isDarkMode }">
    <div class="space-background">
      <div class="stars"></div>
      <div class="grid-lines"></div>
    </div>
    
    <div class="app-container">
      <header class="app-header">
        <div class="app-brand">
          <h1>VoidCheck</h1>
          <span class="app-tagline">Check the void</span>
        </div>
        <div class="app-navigation">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/settings" class="nav-link">Settings</router-link>
        </div>
      </header>
      
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <footer class="app-footer">
        <p>&copy; {{ currentYear }} VoidCheck | Space-themed Task Management</p>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useSettingsStore } from '@/store/settings';
import { Theme } from '@/store/settings';

export default defineComponent({
  name: 'App',
  
  setup() {
    const settingsStore = useSettingsStore();
    
    // Set dark mode
    const isDarkMode = computed(() => settingsStore.isDarkMode);
    
    // Current year for footer
    const currentYear = new Date().getFullYear();
    
    onMounted(() => {
      // Initialize theme
      settingsStore.initializeTheme();
    });
    
    return {
      isDarkMode,
      currentYear
    };
  }
});
</script>

<style lang="scss">
@import '@/styles/global.scss';

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  
  .app-brand {
    display: flex;
    flex-direction: column;
    
    h1 {
      font-family: 'Audiowide', sans-serif;
      color: var(--color-primary);
      margin: 0;
      font-size: 2.5rem;
      letter-spacing: 0.05em;
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(156, 39, 176, 0.5);
    }
    
    .app-tagline {
      font-family: 'JetBrains Mono', monospace;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin-top: -0.25rem;
      letter-spacing: 0.1em;
    }
  }
  
  .app-navigation {
    display: flex;
    gap: 1.5rem;
    
    .nav-link {
      color: var(--color-text);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      &:hover {
        color: var(--color-primary);
        
        &::before {
          transform: translateX(0);
        }
      }
      
      &.router-link-active {
        color: var(--color-primary);
        font-weight: 600;
        
        &::before {
          transform: translateX(0);
        }
      }
    }
  }
}

.app-content {
  flex: 1;
  padding: 2rem 0;
}

.app-footer {
  padding: 1.5rem 0;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  border-top: 1px solid var(--color-divider);
  font-family: 'JetBrains Mono', monospace;
}

// Page transitions
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.19, 1, 0.22, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

// Responsive styles
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
    
    .app-brand {
      align-items: center;
    }
    
    .app-navigation {
      gap: 1rem;
    }
  }
}
</style>
