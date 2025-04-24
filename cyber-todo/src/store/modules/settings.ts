import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { UserSettings } from '../../types'

// Default settings
const defaultSettings: UserSettings = {
  theme: 'dark', // Default to dark theme
  defaultTimeScale: 86400000, // 1 day in milliseconds
  interfaceScale: 1, // Default scale factor
  
  // New UI customization fields
  accentColor: 'cyan',
  interfaceDensity: 'normal',
  fontSize: 1,
  
  // Performance settings
  performanceMode: false,
  webglQuality: 'medium',
  particleDensity: 50,
  animationIntensity: 50,
  
  // Original nested fields
  visualEffects: {
    particleDensity: 0.7, // 70% particle density
    animationIntensity: 0.8, // 80% animation intensity
    backgroundComplexity: 0.6, // 60% background complexity
    performanceMode: false, // Performance mode off by default
  },
  notifications: {
    enabled: true, // Notifications enabled by default
    sound: true, // Sound enabled by default
    defaultLeadTime: 30, // Default 30 minutes before due date
  },
  audio: {
    ambientSounds: false, // Ambient sounds off by default
    effectsVolume: 0.5, // 50% volume for sound effects
  },
  taskDefaults: {
    color: '#00F5FF', // Cyan from our theme
    effectType: 'glow', // Default effect type
    priority: 'medium', // Default priority
  },
}

// Local storage key
const STORAGE_KEY = 'cybertodo_settings'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<UserSettings>(loadSettings())
  
  // Getters
  const isPerformanceMode = computed(() => settings.value.visualEffects.performanceMode)
  const isDarkTheme = computed(() => settings.value.theme === 'dark')
  const isLightTheme = computed(() => settings.value.theme === 'light')
  const isSystemTheme = computed(() => settings.value.theme === 'system')
  
  // Actions
  function setTheme(theme: 'dark' | 'light' | 'system') {
    settings.value.theme = theme
    applyTheme(theme)
  }
  
  function toggleTheme() {
    const newTheme = settings.value.theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }
  
  function updateSettings(newSettings: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...newSettings }
  }
  
  function resetSettings() {
    settings.value = { ...defaultSettings }
  }
  
  // Helper functions
  function loadSettings(): UserSettings {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        return {
          ...defaultSettings,
          ...JSON.parse(savedSettings)
        }
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
    }
    
    return { ...defaultSettings }
  }
  
  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }
  
  function applyTheme(theme: 'dark' | 'light' | 'system') {
    const root = document.documentElement
    
    // First determine the actual theme based on system preference if needed
    let actualTheme = theme
    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    
    // Add transition class
    root.classList.add('theme-transition')
    
    // Set the theme attribute
    root.setAttribute('data-theme', actualTheme)
    
    // Remove transition class after animation completes
    setTimeout(() => {
      root.classList.remove('theme-transition')
    }, 500)
  }
  
  // Watch for changes and save to localStorage
  watch(settings, () => {
    saveSettings()
  }, { deep: true })
  
  // Initialize theme on startup
  applyTheme(settings.value.theme)
  
  // Add listener for system theme changes if using system theme
  if (settings.value.theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (settings.value.theme === 'system') {
        applyTheme('system')
      }
    })
  }
  
  // Add import/export functions
  function importSettings(importedSettings: Partial<UserSettings>) {
    // Merge imported settings with current defaults to ensure schema compatibility
    settings.value = {
      ...defaultSettings,
      ...importedSettings
    }
    
    // Apply settings to DOM
    applyTheme(settings.value.theme)
    
    // If interface density is set, apply it
    if (settings.value.interfaceDensity) {
      document.documentElement.setAttribute('data-density', settings.value.interfaceDensity);
    }
    
    // If font size is set, apply it
    if (settings.value.fontSize) {
      document.documentElement.style.setProperty('--base-font-size', `${settings.value.fontSize}rem`);
    }
  }

  return {
    settings,
    isPerformanceMode,
    isDarkTheme,
    isLightTheme,
    isSystemTheme,
    setTheme,
    toggleTheme,
    updateSettings,
    resetSettings,
    importSettings
  }
})
