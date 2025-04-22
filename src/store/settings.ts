import { defineStore } from 'pinia';

/**
 * Available UI themes
 */
export enum Theme {
  DARK = 'dark',
  LIGHT = 'light'
}

/**
 * Color scheme options
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
}

/**
 * Dark theme colors (deep space theme)
 */
export const DARK_THEME: ColorScheme = {
  primary: '#9C27B0',     // Deep purple
  secondary: '#00BCD4',   // Cyan
  background: '#13111C',  // Deep space black
  surface: '#211E2E',     // Slightly lighter black
  text: '#F5F5F7',        // Off-white
  textSecondary: '#BCBAC4', // Light gray
  accent: '#FF4081',      // Neon pink
  error: '#F44336',       // Red
  warning: '#FF9800',     // Orange
  success: '#4CAF50'      // Green
};

/**
 * Light theme colors (retro NASA inspired)
 */
export const LIGHT_THEME: ColorScheme = {
  primary: '#0B3D91',     // NASA blue
  secondary: '#FC3D21',   // NASA red
  background: '#F5F5F7',  // Light gray
  surface: '#FFFFFF',     // White
  text: '#212121',        // Almost black
  textSecondary: '#757575', // Medium gray
  accent: '#FF4081',      // Neon pink
  error: '#F44336',       // Red
  warning: '#FF9800',     // Orange
  success: '#4CAF50'      // Green
};

/**
 * Available app languages
 */
export enum Language {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  JAPANESE = 'ja'
}

/**
 * Interface for settings store state
 */
interface SettingsState {
  theme: Theme;
  language: Language;
  colorScheme: ColorScheme;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoStartTasks: boolean;
  taskCompletionSound: boolean;
}

/**
 * Settings store using Pinia
 */
export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: Theme.DARK,
    language: Language.ENGLISH,
    colorScheme: DARK_THEME,
    soundEnabled: true,
    notificationsEnabled: true,
    autoStartTasks: false,
    taskCompletionSound: true
  }),
  
  /**
   * Getters for derived state
   */
  getters: {
    /**
     * Returns whether dark mode is active
     */
    isDarkMode: (state) => state.theme === Theme.DARK,
    
    /**
     * Gets the current color scheme
     */
    colors: (state) => state.colorScheme
  },
  
  /**
   * Actions for modifying state
   */
  actions: {
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
      if (this.theme === Theme.DARK) {
        this.theme = Theme.LIGHT;
        this.colorScheme = LIGHT_THEME;
      } else {
        this.theme = Theme.DARK;
        this.colorScheme = DARK_THEME;
      }
      
      // Apply theme to document
      document.documentElement.className = this.theme;
    },
    
    /**
     * Set a specific theme
     */
    setTheme(theme: Theme) {
      this.theme = theme;
      this.colorScheme = theme === Theme.DARK ? DARK_THEME : LIGHT_THEME;
      
      // Apply theme to document
      document.documentElement.className = this.theme;
    },
    
    /**
     * Set the app language
     */
    setLanguage(language: Language) {
      this.language = language;
    },
    
    /**
     * Toggle sound effects
     */
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
    },
    
    /**
     * Toggle notifications
     */
    toggleNotifications() {
      this.notificationsEnabled = !this.notificationsEnabled;
    },
    
    /**
     * Toggle auto-start tasks feature
     */
    toggleAutoStartTasks() {
      this.autoStartTasks = !this.autoStartTasks;
    },
    
    /**
     * Toggle task completion sound
     */
    toggleTaskCompletionSound() {
      this.taskCompletionSound = !this.taskCompletionSound;
    },
    
    /**
     * Apply initial theme to document
     */
    initializeTheme() {
      document.documentElement.className = this.theme;
    }
  },
  
  /**
   * Configure persistence
   */
  persist: {
    storage: localStorage
  }
});
