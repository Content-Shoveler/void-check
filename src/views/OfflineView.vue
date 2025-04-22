<template>
  <div class="offline-container">
    <div class="offline-content">
      <h1 class="offline-title">You're Offline</h1>
      <div class="offline-icon">🛰️</div>
      <p class="offline-message">
        Houston, we have a problem! It looks like you're currently offline.
        VoidCheck functions fully offline, so you can still continue using the app.
      </p>
      <p class="offline-submessage">
        Your changes will be synchronized when you reconnect.
      </p>
      
      <div class="offline-action">
        <button class="retry-button" @click="checkConnection">
          Retry Connection
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const checkingConnection = ref(false);

// Function to check if connection is restored
const checkConnection = () => {
  if (checkingConnection.value) return;
  
  checkingConnection.value = true;
  
  // This is a simple check - in a real app you might want to ping a server
  if (navigator.onLine) {
    router.push({ name: 'home' });
  } else {
    setTimeout(() => {
      checkingConnection.value = false;
      alert('Still offline. Please check your connection and try again.');
    }, 1000);
  }
};

// Function to handle when connection is restored
const handleOnline = () => {
  router.push({ name: 'home' });
};

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('online', handleOnline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
});
</script>

<style lang="scss" scoped>
.offline-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px); // Account for header and footer
  padding: var(--space-md);
}

.offline-content {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-xl);
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  text-align: center;
  animation: fade-in var(--transition-normal);
}

.offline-title {
  font-family: var(--font-family-mono);
  color: var(--color-accent);
  margin-bottom: var(--space-lg);
}

.offline-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  animation: float 6s ease-in-out infinite;
}

.offline-message {
  font-size: 1.1rem;
  margin-bottom: var(--space-md);
  line-height: 1.6;
}

.offline-submessage {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.offline-action {
  margin-top: var(--space-lg);
}

.retry-button {
  font-family: var(--font-family-mono);
  font-weight: bold;
  padding: var(--space-sm) var(--space-lg);
  background-color: var(--color-accent);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  
  &:hover, &:focus {
    background-color: var(--color-primary);
    transform: translateY(-2px);
  }
}

// Animation for floating icon
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
}
</style>
