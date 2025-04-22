<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1 class="title">Settings</h1>
    </div>
    
    <div class="settings-content">
      <div class="settings-card">
        <div class="settings-section">
          <h2 class="section-title">Appearance</h2>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Theme</span>
              <span class="setting-description">Choose your preferred color theme</span>
            </div>
            <div class="setting-control">
              <div class="theme-selector">
                <button 
                  class="theme-btn" 
                  :class="{ active: settings.theme === 'light' }"
                  @click="settings.setTheme('light')"
                >
                  Light
                </button>
                <button 
                  class="theme-btn" 
                  :class="{ active: settings.theme === 'dark' }"
                  @click="settings.setTheme('dark')"
                >
                  Dark
                </button>
                <button 
                  class="theme-btn" 
                  :class="{ active: settings.theme === 'system' }"
                  @click="settings.setTheme('system')"
                >
                  System
                </button>
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Grid Lines</span>
              <span class="setting-description">Show grid lines in timeline view</span>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="gridLinesVisible" 
                  @change="updateGridLines"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Animations</span>
              <span class="setting-description">Enable animations throughout the app</span>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="animationsEnabled" 
                  @change="updateAnimations"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2 class="section-title">Navigation</h2>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Sidebar Expanded</span>
              <span class="setting-description">Default sidebar state when app opens</span>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="sidebarExpanded" 
                  @change="updateSidebar"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2 class="section-title">Localization</h2>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Language</span>
              <span class="setting-description">Select your preferred language</span>
            </div>
            <div class="setting-control">
              <select 
                class="language-select" 
                v-model="language" 
                @change="updateLanguage"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2 class="section-title">Data</h2>
          
          <div class="setting-item data-actions">
            <button class="reset-btn" @click="confirmReset">
              Reset Settings to Default
            </button>
          </div>
        </div>
        
        <div class="app-info">
          <div class="app-name">
            <span class="void">Void</span><span class="check">Check</span>
          </div>
          <div class="app-version">v1.0.0</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '@/store/settings';

// Store access
const settings = useSettingsStore();

// Local reactive state (to avoid reactivity issues with checkboxes)
const gridLinesVisible = ref(false);
const animationsEnabled = ref(false);
const sidebarExpanded = ref(false);
const language = ref('en');

// Initialize local state from store
onMounted(() => {
  gridLinesVisible.value = settings.areGridLinesVisible;
  animationsEnabled.value = settings.areAnimationsEnabled;
  sidebarExpanded.value = settings.isSidebarExpanded;
  language.value = settings.currentLanguage;
});

// Methods to update settings
const updateGridLines = () => {
  settings.setGridLinesVisible(gridLinesVisible.value);
};

const updateAnimations = () => {
  settings.setAnimationsEnabled(animationsEnabled.value);
};

const updateSidebar = () => {
  settings.toggleSidebar();
};

const updateLanguage = () => {
  settings.setLanguage(language.value);
};

const confirmReset = () => {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    settings.resetToDefaults();
    
    // Update local state to match reset settings
    gridLinesVisible.value = settings.areGridLinesVisible;
    animationsEnabled.value = settings.areAnimationsEnabled;
    sidebarExpanded.value = settings.isSidebarExpanded;
    language.value = settings.currentLanguage;
  }
};
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-md);
}

.settings-header {
  margin-bottom: var(--space-lg);
  
  .title {
    font-family: var(--font-family-mono);
    color: var(--color-text-primary);
    margin: 0;
  }
}

.settings-content {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.settings-section {
  margin-bottom: var(--space-xl);
  
  .section-title {
    font-family: var(--font-family-mono);
    font-size: 1.25rem;
    color: var(--color-accent);
    margin-top: 0;
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid var(--color-bg-tertiary);
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  
  &.data-actions {
    justify-content: flex-start;
  }
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  
  .setting-name {
    font-weight: bold;
    color: var(--color-text-primary);
  }
  
  .setting-description {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
}

.setting-control {
  min-width: 120px;
  display: flex;
  justify-content: flex-end;
}

.theme-selector {
  display: flex;
  gap: 1px;
  
  .theme-btn {
    background-color: var(--color-bg-tertiary);
    border: none;
    color: var(--color-text-secondary);
    padding: var(--space-xs) var(--space-sm);
    cursor: pointer;
    font-family: var(--font-family-mono);
    
    &:first-child {
      border-top-left-radius: var(--border-radius-md);
      border-bottom-left-radius: var(--border-radius-md);
    }
    
    &:last-child {
      border-top-right-radius: var(--border-radius-md);
      border-bottom-right-radius: var(--border-radius-md);
    }
    
    &.active {
      background-color: var(--color-accent);
      color: var(--color-text-primary);
    }
  }
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + .toggle-slider {
      background-color: var(--color-accent);
    }
    
    &:checked + .toggle-slider:before {
      transform: translateX(24px);
    }
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-bg-tertiary);
    transition: var(--transition-fast);
    border-radius: var(--border-radius-full);
    
    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: var(--color-text-primary);
      transition: var(--transition-fast);
      border-radius: 50%;
    }
  }
}

.language-select {
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-tertiary);
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
}

.reset-btn {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  border-radius: var(--border-radius-md);
  padding: var(--space-xs) var(--space-md);
  font-family: var(--font-family-mono);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-warning);
    color: var(--color-text-primary);
  }
}

.app-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-bg-tertiary);
  margin-top: var(--space-xl);
  
  .app-name {
    font-family: var(--font-family-mono);
    font-size: 1.5rem;
    font-weight: 700;
    
    .void {
      color: var(--color-neon-teal);
    }
    
    .check {
      color: var(--color-text-primary);
    }
  }
  
  .app-version {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    margin-top: var(--space-xs);
  }
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .setting-control {
    width: 100%;
  }
  
  .theme-selector {
    width: 100%;
    
    .theme-btn {
      flex: 1;
      text-align: center;
    }
  }
}
</style>
