<template>
  <header class="app-header">
    <div class="logo-container">
      <router-link to="/" class="logo-link">
        <h1 class="app-title">
          <span class="void">Void</span><span class="check">Check</span>
        </h1>
      </router-link>
      <p class="app-tagline">Check the void</p>
    </div>
    
    <div class="header-actions">
      <button 
        class="theme-toggle"
        @click="toggleTheme"
        :title="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'"
      >
        <span v-if="isDarkTheme" class="icon">☀️</span>
        <span v-else class="icon">🌙</span>
      </button>
      
      <button 
        class="create-task-btn"
        @click="openCreateTaskModal"
        title="Create new task"
      >
        <span class="icon">+</span>
        <span class="btn-text">New Task</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/store/settings';
import { useTaskStore } from '@/store/task';

const router = useRouter();
const settingsStore = useSettingsStore();
const taskStore = useTaskStore();

// Computed properties
const isDarkTheme = computed(() => settingsStore.isDarkTheme);

// Method to toggle theme
const toggleTheme = () => {
  settingsStore.toggleTheme();
};

// Method to open the create task modal
// This would typically show a modal component, but for now just navigate to tasks page
const openCreateTaskModal = () => {
  taskStore.setActiveTask(null); // Reset active task
  router.push({ name: 'tasks' });
};
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  background-color: var(--color-bg-secondary);
  box-shadow: var(--shadow-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  height: 60px;
  z-index: var(--z-index-above);
}

.logo-container {
  display: flex;
  flex-direction: column;
}

.logo-link {
  text-decoration: none;
  
  &:hover, &:focus {
    text-decoration: none;
  }
}

.app-title {
  font-family: var(--font-family-mono);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  
  .void {
    color: var(--color-neon-teal);
  }
  
  .check {
    color: var(--color-text-primary);
  }
}

.app-tagline {
  font-family: var(--font-family-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
  
  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.create-task-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  background-color: var(--color-accent);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-mono);
  font-weight: bold;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  
  .icon {
    font-size: 1.25rem;
  }
  
  &:hover, &:focus {
    background-color: var(--color-primary);
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  .app-title {
    font-size: 1.25rem;
  }
  
  .app-tagline {
    display: none;
  }
  
  .btn-text {
    display: none;
  }
  
  .create-task-btn {
    padding: var(--space-xs);
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--border-radius-full);
    justify-content: center;
  }
}
</style>
