<template>
  <header class="app-header">
    <div class="container flex-between">
      <h1 class="app-title cyber-text-glow">VoidCheck</h1>
      <nav class="app-nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/tasks" class="nav-link">Tasks</router-link>
        <router-link to="/integrations" class="nav-link">Integrations</router-link>
        <router-link to="/settings" class="nav-link">Settings</router-link>
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppHeader'
})
</script>

<style lang="scss" scoped>
@use '../../styles/_mixins' as *;

.app-header {
  padding: var(--space-4) 0;
  background-color: var(--color-background-elevated);
  border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);

  & > div {
    display: flex;
    align-items: center;
    gap: var(--space-6);
  }
  
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
