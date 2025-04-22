<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="copyright">
        &copy; {{ currentYear }} VoidCheck | <a href="#" @click.prevent="goToSettings">Settings</a>
      </div>
      
      <div class="footer-nav">
        <router-link to="/" class="footer-link">Home</router-link>
        <router-link to="/tasks" class="footer-link">Tasks</router-link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Computed property to get current year for copyright
const currentYear = computed(() => new Date().getFullYear());

// Method to navigate to settings
const goToSettings = () => {
  router.push({ name: 'settings' });
};
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: var(--color-bg-secondary);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--space-sm) var(--space-lg);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  height: 40px;
  display: flex;
  align-items: center;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  a {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
    
    &:hover, &:focus {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }
}

.footer-nav {
  display: flex;
  gap: var(--space-md);
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
  
  &:hover, &:focus, &.router-link-active {
    color: var(--color-accent);
    text-decoration: none;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
  }
  
  .footer-nav {
    gap: var(--space-sm);
  }
}
</style>
