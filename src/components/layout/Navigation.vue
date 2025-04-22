<template>
  <nav class="sidebar-nav" :class="{ collapsed: !isSidebarExpanded }">
    <div class="nav-toggle" @click="toggleSidebar" :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'">
      <span v-if="isSidebarExpanded" class="toggle-icon">◀</span>
      <span v-else class="toggle-icon">▶</span>
    </div>
    
    <div class="nav-links">
      <router-link to="/" class="nav-link" :class="{ active: isActive('home') }" title="Visual Timeline">
        <span class="nav-icon">🌌</span>
        <span class="nav-text" v-if="isSidebarExpanded">Timeline</span>
      </router-link>
      
      <router-link to="/tasks" class="nav-link" :class="{ active: isActive('tasks') }" title="Tasks">
        <span class="nav-icon">📋</span>
        <span class="nav-text" v-if="isSidebarExpanded">Tasks</span>
      </router-link>
      
      <router-link to="/settings" class="nav-link" :class="{ active: isActive('settings') }" title="Settings">
        <span class="nav-icon">⚙️</span>
        <span class="nav-text" v-if="isSidebarExpanded">Settings</span>
      </router-link>
    </div>
    
    <div class="nav-footer" v-if="isSidebarExpanded">
      <div class="time-scale-controls">
        <h4 class="scale-title">Time Scale</h4>
        <div class="scale-controls">
          <button class="scale-btn" @click="zoomIn" title="Zoom in (shorter timeframe)">
            <span class="icon">➖</span>
          </button>
          <div class="scale-name">{{ currentScaleName }}</div>
          <button class="scale-btn" @click="zoomOut" title="Zoom out (longer timeframe)">
            <span class="icon">➕</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/store/settings';
import { useTimeScaleStore } from '@/store/timeScale';

const route = useRoute();
const settingsStore = useSettingsStore();
const timeScaleStore = useTimeScaleStore();

// Computed properties
const isSidebarExpanded = computed(() => settingsStore.isSidebarExpanded);
const currentScaleName = computed(() => timeScaleStore.currentScale.name);

// Methods
const toggleSidebar = () => {
  settingsStore.toggleSidebar();
};

const zoomIn = () => {
  timeScaleStore.zoomIn();
};

const zoomOut = () => {
  timeScaleStore.zoomOut();
};

const isActive = (name: string) => {
  return route.name === name;
};
</script>

<style lang="scss" scoped>
.sidebar-nav {
  background-color: var(--color-bg-secondary);
  box-shadow: var(--shadow-md);
  width: 200px;
  height: 100%;
  transition: width var(--transition-normal);
  position: relative;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  
  &.collapsed {
    width: 60px;
  }
}

.nav-toggle {
  position: absolute;
  top: var(--space-md);
  right: var(--space-xs);
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius-full);
  background-color: var(--color-bg-tertiary);
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-accent);
    color: var(--color-text-primary);
  }
}

.nav-links {
  margin-top: var(--space-xl);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: 
    background-color var(--transition-fast),
    color var(--transition-fast);
  border-left: 3px solid transparent;
  
  &:hover, &:focus {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }
  
  &.active {
    color: var(--color-accent);
    border-left-color: var(--color-accent);
    background-color: rgba(57, 208, 208, 0.1);
  }
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-family: var(--font-family-mono);
  font-weight: 600;
}

.nav-footer {
  padding: var(--space-md);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.time-scale-controls {
  .scale-title {
    font-size: 0.875rem;
    margin-bottom: var(--space-xs);
    color: var(--color-text-secondary);
  }
  
  .scale-controls {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }
  
  .scale-name {
    flex-grow: 1;
    text-align: center;
    font-family: var(--font-family-mono);
    color: var(--color-accent);
    font-size: 0.875rem;
  }
  
  .scale-btn {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    width: 28px;
    height: 28px;
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 
      background-color var(--transition-fast),
      color var(--transition-fast);
    
    &:hover, &:focus {
      background-color: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }
  }
}

@media (max-width: 768px) {
  .sidebar-nav {
    position: fixed;
    left: 0;
    top: 60px; // Match header height
    z-index: var(--z-index-above);
    height: calc(100vh - 100px); // Account for header and footer
  }
}
</style>
