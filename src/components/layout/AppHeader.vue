<template>
  <header class="app-header">
    <div class="app-header__container">
      <div class="app-header__logo">
        <router-link to="/" class="app-header__logo-link">
          <span class="app-header__logo-text">Cyber</span>
          <span class="app-header__logo-highlight">Todo</span>
        </router-link>
      </div>
      
      <nav class="app-header__nav">
        <ul class="app-header__nav-list">
          <li 
            v-for="item in navItems" 
            :key="item.path" 
            class="app-header__nav-item"
          >
            <router-link 
              :to="item.path" 
              class="app-header__nav-link"
              active-class="app-header__nav-link--active"
            >
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="app-header__actions">
        <button 
          class="app-header__theme-toggle" 
          @click="toggleTheme" 
          :title="`Switch to ${nextTheme} theme`"
          aria-label="Toggle theme"
        >
          <svg 
            v-if="currentTheme === 'dark'" 
            class="app-header__theme-icon" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z" 
              fill="currentColor"
            />
          </svg>
          <svg 
            v-else 
            class="app-header__theme-icon" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" 
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useSettingsStore } from '../../store/modules/settings';

interface NavItem {
  path: string;
  label: string;
}

export default defineComponent({
  name: 'AppHeader',
  
  setup() {
    const settingsStore = useSettingsStore();
    
    // Navigation items
    const navItems: NavItem[] = [
      { path: '/', label: 'Home' },
      { path: '/tasks', label: 'Tasks' },
      { path: '/tasks/visual', label: 'Visualize' },
      { path: '/integrations', label: 'Integrations' },
      { path: '/settings', label: 'Settings' }
    ];
    
    // Current theme
    const currentTheme = computed(() => settingsStore.settings.theme);
    
    // Next theme (for toggle)
    const nextTheme = computed(() => currentTheme.value === 'dark' ? 'light' : 'dark');
    
    // Toggle theme
    const toggleTheme = () => {
      settingsStore.setTheme(nextTheme.value);
    };
    
    return {
      navItems,
      currentTheme,
      nextTheme,
      toggleTheme
    };
  }
});
</script>

<style lang="scss">
.app-header {
  background-color: rgba(var(--color-background-elevated-rgb), 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    @media (max-width: 768px) {
      padding: var(--space-2) var(--space-3);
    }
  }
  
  &__logo {
    flex-shrink: 0;
  }
  
  &__logo-link {
    display: flex;
    align-items: center;
    font-family: var(--font-primary);
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    text-decoration: none;
    color: var(--color-text-primary);
    letter-spacing: 1px;
    
    @media (max-width: 768px) {
      font-size: var(--text-lg);
    }
  }
  
  &__logo-text {
    position: relative;
    z-index: 1;
    color: var(--color-text-primary);
  }
  
  &__logo-highlight {
    position: relative;
    z-index: 1;
    color: var(--color-primary);
    margin-left: 4px;
    
    // Glow effect
    text-shadow: 0 0 5px var(--color-primary), 0 0 10px rgba(var(--color-primary-rgb), 0.5);
  }
  
  &__nav {
    margin: 0 var(--space-5);
    flex: 1;
    
    @media (max-width: 768px) {
      margin: 0 var(--space-3);
    }
  }
  
  &__nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: var(--space-5);
    
    @media (max-width: 768px) {
      gap: var(--space-3);
    }
  }
  
  &__nav-item {
    position: relative;
  }
  
  &__nav-link {
    font-family: var(--font-secondary);
    font-size: var(--text-base);
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: var(--transition-base);
    padding: var(--space-1) 0;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--color-primary);
      transition: width 0.3s ease;
    }
    
    &:hover, &:focus-visible {
      color: var(--color-primary);
      
      &::after {
        width: 100%;
      }
    }
    
    &--active {
      color: var(--color-primary);
      font-weight: var(--font-medium);
      
      &::after {
        width: 100%;
      }
    }
  }
  
  &__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  &__theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    transition: var(--transition-base);
    
    &:hover, &:focus-visible {
      background-color: rgba(var(--color-primary-rgb), 0.1);
      color: var(--color-primary);
      outline: none;
    }
    
    &:focus-visible {
      box-shadow: 0 0 0 2px var(--color-primary);
    }
  }
  
  &__theme-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
