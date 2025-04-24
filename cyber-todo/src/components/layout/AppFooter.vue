<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <div class="app-footer__copyright">
        © {{ currentYear }} <span class="app-footer__name">CyberTodo</span>
      </div>
      
      <div class="app-footer__links">
        <a 
          v-for="link in links" 
          :key="link.label" 
          :href="link.url" 
          target="_blank" 
          rel="noopener noreferrer"
          class="app-footer__link"
        >
          {{ link.label }}
        </a>
      </div>
      
      <div class="app-footer__version">
        <span>v{{ version }}</span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

interface FooterLink {
  label: string;
  url: string;
}

export default defineComponent({
  name: 'AppFooter',
  
  setup() {
    // Current year for copyright
    const currentYear = computed(() => new Date().getFullYear());
    
    // Version number
    const version = '1.0.0';
    
    // Footer links
    const links: FooterLink[] = [
      { label: 'Privacy', url: '#' },
      { label: 'Terms', url: '#' },
      { label: 'Help', url: '#' }
    ];
    
    return {
      currentYear,
      version,
      links
    };
  }
});
</script>

<style lang="scss">
.app-footer {
  background-color: rgba(var(--color-background-elevated-rgb), 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  padding: var(--space-4) 0;
  margin-top: auto; // Push to bottom when in flex container
  
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--space-3);
      text-align: center;
    }
  }
  
  &__copyright {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }
  
  &__name {
    color: var(--color-primary);
    font-weight: var(--font-medium);
  }
  
  &__links {
    display: flex;
    gap: var(--space-4);
    
    @media (max-width: 768px) {
      gap: var(--space-3);
    }
  }
  
  &__link {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: var(--transition-color);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background-color: var(--color-primary);
      transition: width 0.3s ease;
    }
    
    &:hover, &:focus-visible {
      color: var(--color-primary);
      
      &::after {
        width: 100%;
      }
    }
    
    &:focus-visible {
      outline: none;
    }
  }
  
  &__version {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    opacity: 0.7;
  }
}
</style>
