<template>
  <div class="task-visual-view">
    <div class="visualization-container">
      <space-visualization />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useTasksStore } from '../store/modules/tasks';
import SpaceVisualization from '../components/visualization/SpaceVisualization.vue';

export default defineComponent({
  name: 'TaskVisual',
  
  components: {
    SpaceVisualization
  },
  
  setup() {
    const tasksStore = useTasksStore();
    
    onMounted(async () => {
      // Initialize tasks if not already done
      if (!tasksStore.isInitialized) {
        await tasksStore.initializeTasks();
      }
    });
    
    return {};
  }
});
</script>

<style lang="scss" scoped>
.task-visual-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  .visualization-container {
    flex: 1;
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
}
</style>
