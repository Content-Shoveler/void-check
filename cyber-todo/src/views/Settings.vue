<template>
  <div class="settings-view">
    <h1 class="cyber-text-glow">Settings</h1>
    <p>App settings and preferences (to be implemented)</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SettingsView',
  components: {}
})
</script>

<style lang="scss" scoped>
.settings-view {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 80vh;
  
  h1 {
    margin-bottom: var(--space-5);
  }
}
</style>
