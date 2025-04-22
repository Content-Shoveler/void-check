import { defineStore } from 'pinia';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  gridLinesVisible: boolean;
  animationsEnabled: boolean;
  sidebarExpanded: boolean;
  language: string;
  isLoading: boolean;
  error: string | null;
}

export const useSettingsStore = defineStore({
  id: 'settings',
  
  state: (): SettingsState => ({
    theme: 'dark',
    notificationsEnabled: true,
    gridLinesVisible: true,
    animationsEnabled: true,
    sidebarExpanded: true,
    language: 'en',
    isLoading: false,
    error: null
  }),
  
  getters: {
    isDarkTheme: (state) => {
      if (state.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return state.theme === 'dark';
    },
    
    isLightTheme: (state) => {
      if (state.theme === 'system') {
        return !window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return state.theme === 'light';
    },
    
    currentTheme: (state) => state.theme,
    
    areNotificationsEnabled: (state) => state.notificationsEnabled,
    
    areGridLinesVisible: (state) => state.gridLinesVisible,
    
    areAnimationsEnabled: (state) => state.animationsEnabled,
    
    isSidebarExpanded: (state) => state.sidebarExpanded,
    
    currentLanguage: (state) => state.language
  },
  
  actions: {
    setTheme(theme: 'light' | 'dark' | 'system') {
      this.theme = theme;
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', 
        theme === 'system' 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
          : theme
      );
    },
    
    toggleTheme() {
      if (this.theme === 'light') {
        this.setTheme('dark');
      } else if (this.theme === 'dark') {
        this.setTheme('system');
      } else {
        this.setTheme('light');
      }
    },
    
    setNotificationsEnabled(enabled: boolean) {
      this.notificationsEnabled = enabled;
    },
    
    setGridLinesVisible(visible: boolean) {
      this.gridLinesVisible = visible;
    },
    
    setAnimationsEnabled(enabled: boolean) {
      this.animationsEnabled = enabled;
    },
    
    toggleSidebar() {
      this.sidebarExpanded = !this.sidebarExpanded;
    },
    
    setLanguage(language: string) {
      this.language = language;
    },
    
    resetToDefaults() {
      this.theme = 'dark';
      this.notificationsEnabled = true;
      this.gridLinesVisible = true;
      this.animationsEnabled = true;
      this.sidebarExpanded = true;
      this.language = 'en';
      
      // Apply default theme
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  },
  
  persist: {
    storage: localStorage,
    key: 'void-check-settings'
  }
});
