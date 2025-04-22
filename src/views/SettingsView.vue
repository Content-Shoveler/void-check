<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>Settings</h1>
      <p class="settings-description">Customize your VoidCheck experience</p>
    </div>
    
    <div class="settings-container">
      <div class="settings-section">
        <h2 class="section-title">Appearance</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Theme</h3>
            <p>Choose between dark and light mode</p>
          </div>
          <div class="setting-control">
            <div class="theme-toggle">
              <button 
                class="theme-option" 
                :class="{ active: isDarkMode }"
                @click="setTheme(Theme.DARK)"
              >
                <span class="theme-icon">🌙</span>
                <span>Dark</span>
              </button>
              <button 
                class="theme-option" 
                :class="{ active: !isDarkMode }"
                @click="setTheme(Theme.LIGHT)"
              >
                <span class="theme-icon">☀️</span>
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Grid Lines</h3>
            <p>Show grid lines on time visualization</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input 
                type="checkbox"
                :checked="timeScaleStore.showGridLines"
                @change="timeScaleStore.toggleGridLines"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Labels</h3>
            <p>Show time labels on visualization</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input 
                type="checkbox"
                :checked="timeScaleStore.showLabels"
                @change="timeScaleStore.toggleLabels"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h2 class="section-title">Notifications</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Enable Notifications</h3>
            <p>Receive notifications for task reminders</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input 
                type="checkbox"
                :checked="settingsStore.notificationsEnabled"
                @change="settingsStore.toggleNotifications"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Sound Effects</h3>
            <p>Play sound on notifications and actions</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input 
                type="checkbox"
                :checked="settingsStore.soundEnabled"
                @change="settingsStore.toggleSound"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h2 class="section-title">Language & Region</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Language</h3>
            <p>Set your preferred language</p>
          </div>
          <div class="setting-control">
            <select 
              class="language-select"
              :value="settingsStore.language"
              @change="handleLanguageChange"
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
        <h2 class="section-title">Time Scale</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Default Scale</h3>
            <p>Set the default time scale for visualization</p>
          </div>
          <div class="setting-control">
            <select 
              class="scale-select"
              :value="timeScaleStore.currentScale.id"
              @change="handleTimeScaleChange"
            >
              <option 
                v-for="scale in timeScaleStore.availableScales" 
                :key="scale.id" 
                :value="scale.id"
              >
                {{ scale.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h2 class="section-title">About VoidCheck</h2>
        <p class="about-text">
          VoidCheck is a space-themed visual task management PWA designed to help you visualize
          your tasks in a unique way. Tasks appear as circles that move closer to the center as their
          deadlines approach, giving you an intuitive understanding of time.
        </p>
        <p class="version-info">Version 0.1.0</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useSettingsStore, Theme } from '@/store/settings';
import { useTimeScaleStore } from '@/store/timeScale';

export default defineComponent({
  name: 'SettingsView',
  
  setup() {
    const settingsStore = useSettingsStore();
    const timeScaleStore = useTimeScaleStore();
    
    // Dark mode status
    const isDarkMode = computed(() => settingsStore.isDarkMode);
    
    // Set theme
    const setTheme = (theme: Theme) => {
      settingsStore.setTheme(theme);
    };
    
    // Handle language change
    const handleLanguageChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      settingsStore.setLanguage(target.value);
    };
    
    // Handle time scale change
    const handleTimeScaleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      timeScaleStore.setTimeScale(target.value);
    };
    
    return {
      settingsStore,
      timeScaleStore,
      isDarkMode,
      setTheme,
      Theme,
      handleLanguageChange,
      handleTimeScaleChange
    };
  }
});
</script>

<style lang="scss">
.settings-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  
  .settings-header {
    margin-bottom: 2rem;
    
    h1 {
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(156, 39, 176, 0.3);
      margin-bottom: 0.5rem;
    }
    
    .settings-description {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
    }
  }
  
  .settings-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .settings-section {
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    
    .section-title {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--color-divider);
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      
      &:not(:last-child) {
        border-bottom: 1px solid var(--color-divider);
      }
      
      .setting-info {
        flex: 1;
        
        h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        
        p {
          margin: 0.25rem 0 0;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
      }
      
      .setting-control {
        margin-left: 1rem;
        
        // Toggle switch
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 56px;
          height: 28px;
          
          input {
            opacity: 0;
            width: 0;
            height: 0;
            
            &:checked + .toggle-slider {
              background-color: var(--color-primary);
              
              &:before {
                transform: translateX(28px);
              }
            }
          }
          
          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--color-divider);
            transition: 0.3s;
            border-radius: 34px;
            
            &:before {
              position: absolute;
              content: "";
              height: 20px;
              width: 20px;
              left: 4px;
              bottom: 4px;
              background-color: white;
              transition: 0.3s;
              border-radius: 50%;
            }
          }
        }
        
        // Theme toggle
        .theme-toggle {
          display: flex;
          gap: 0.5rem;
          
          .theme-option {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: var(--radius-md);
            background-color: var(--color-surface-hover);
            border: 1px solid var(--color-divider);
            cursor: pointer;
            transition: all 0.2s ease;
            
            &.active {
              background-color: var(--color-primary);
              color: white;
              border-color: var(--color-primary);
            }
            
            .theme-icon {
              font-size: 1.25rem;
            }
          }
        }
        
        // Selects
        .language-select,
        .scale-select {
          padding: 0.5rem;
          border-radius: var(--radius-md);
          background-color: var(--color-surface-hover);
          border: 1px solid var(--color-divider);
          color: var(--color-text);
          min-width: 150px;
          
          option {
            background-color: var(--color-surface);
            color: var(--color-text);
          }
        }
      }
    }
    
    .about-text {
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    
    .version-info {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-top: 1.5rem;
    }
  }
}

@media (max-width: 600px) {
  .settings-view {
    .setting-item {
      flex-direction: column;
      align-items: flex-start;
      
      .setting-control {
        margin-left: 0;
        margin-top: 0.75rem;
        width: 100%;
        
        .theme-toggle {
          width: 100%;
          
          .theme-option {
            flex: 1;
            justify-content: center;
          }
        }
        
        .language-select,
        .scale-select {
          width: 100%;
        }
      }
    }
  }
}
</style>
