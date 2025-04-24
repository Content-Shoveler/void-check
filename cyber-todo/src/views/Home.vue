<template>
  <div class="home-view">
    <h1 class="cyber-text-glow">Cyberpunk Space Todo</h1>
    <p>Home page with timeline visualization (to be implemented)</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
  components: {}
})
</script>

<style lang="scss" scoped>
.home-view {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  
  h1 {
    margin-bottom: var(--space-5);
  }
}
</style>
