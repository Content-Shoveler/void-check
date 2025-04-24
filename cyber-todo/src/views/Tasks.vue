<template>
  <div class="tasks-view">
    <h1 class="cyber-text-glow">Tasks</h1>
    <p>Tasks management page (to be implemented)</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TasksView',
  components: {}
})
</script>

<style lang="scss" scoped>
.tasks-view {
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
