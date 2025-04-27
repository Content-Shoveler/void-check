<template>
  <div class="not-found-view">
    <h1 class="cyber-text-glitch" data-text="404">404</h1>
    <p class="error-message">This reality doesn't exist in the cybernet</p>
    <router-link to="/" class="cyber-link">
      Return to homebase
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFoundView'
})
</script>

<style lang="scss" scoped>
.not-found-view {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 80vh;
  
  h1 {
    font-size: 8rem;
    margin-bottom: var(--space-6);
    color: var(--color-primary);
  }
  
  .error-message {
    font-size: var(--text-xl);
    margin-bottom: var(--space-6);
    color: var(--color-secondary);
  }
  
  .cyber-link {
    @include cyber-button('primary');
    margin-top: var(--space-4);
  }
}
</style>
