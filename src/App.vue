<template>
  <div class="app-container" :class="{ 'dark-theme': isDarkTheme, 'light-theme': !isDarkTheme }">
    <AppHeader />
    
    <main class="main-content">
      <Navigation v-if="!isOffline" />
      
      <div class="view-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/store/settings';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import Navigation from '@/components/layout/Navigation.vue';

// Get settings from store
const settingsStore = useSettingsStore();
const router = useRouter();

// Computed properties
const isDarkTheme = computed(() => settingsStore.isDarkTheme);
const isOffline = computed(() => !navigator.onLine);

// Watch for online/offline status changes
const handleOnlineStatusChange = () => {
  if (!navigator.onLine && router.currentRoute.value.name !== 'offline') {
    router.push({ name: 'offline' });
  } else if (navigator.onLine && router.currentRoute.value.name === 'offline') {
    router.push({ name: 'home' });
  }
};

// Setup online/offline event listeners
onMounted(() => {
  window.addEventListener('online', handleOnlineStatusChange);
  window.addEventListener('offline', handleOnlineStatusChange);
  
  // Apply initial theme
  settingsStore.setTheme(settingsStore.currentTheme);
  
  // Check initial online status
  if (!navigator.onLine) {
    router.push({ name: 'offline' });
  }
});

// Watch for theme changes
watch(isDarkTheme, (newValue) => {
  document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light');
});
</script>

<style lang="scss">
@import '@/styles/global.scss';

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  transition: background-color var(--transition-normal);
  position: relative;
  
  // Optional: Add a subtle space-themed background
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(1px 1px at 20px 30px, var(--color-accent) 50%, transparent 100%),
      radial-gradient(1px 1px at 40px 70px, var(--color-primary) 50%, transparent 100%),
      radial-gradient(1px 1px at 90px 40px, var(--color-warning) 50%, transparent 100%),
      radial-gradient(1px 1px at 130px 80px, var(--color-accent) 50%, transparent 100%),
      radial-gradient(1px 1px at 160px 120px, var(--color-primary) 50%, transparent 100%);
    background-repeat: repeat;
    background-size: 200px 200px;
    opacity: 0.05;
    z-index: -1;
    pointer-events: none;
  }
}

.main-content {
  display: flex;
  flex: 1;
  position: relative;
}

.view-container {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
  max-height: calc(100vh - 120px); // Adjust based on header/footer height
}

// Transition animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
