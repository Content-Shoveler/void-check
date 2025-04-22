<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-title">404</h1>
      <div class="not-found-icon">🌑</div>
      <p class="not-found-message">
        Lost in the void! The page you're looking for doesn't exist in this dimension.
      </p>
      <p class="not-found-submessage">
        Let's navigate back to a known star system.
      </p>
      
      <div class="not-found-action">
        <button class="home-button" @click="goHome">
          Return to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// Navigate back to home
const goHome = () => {
  router.push({ name: 'home' });
};
</script>

<style lang="scss" scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px); // Account for header and footer
  padding: var(--space-md);
}

.not-found-content {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-xl);
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  text-align: center;
  animation: fade-in var(--transition-normal);
}

.not-found-title {
  font-family: var(--font-family-mono);
  font-size: 6rem;
  color: var(--color-accent);
  margin-bottom: var(--space-md);
  text-shadow: 0 0 15px var(--color-accent);
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  animation: pulse 3s infinite;
}

.not-found-message {
  font-size: 1.1rem;
  margin-bottom: var(--space-md);
  line-height: 1.6;
}

.not-found-submessage {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.not-found-action {
  margin-top: var(--space-lg);
}

.home-button {
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

// Animation for pulsing
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
