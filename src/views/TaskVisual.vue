<template>
  <div class="task-visual-view">
    <div class="visualization-container">
      <space-visualization @open-task-details="openTaskDetails" />
    </div>

    <TaskModal
      :is-open="isTaskModalOpen"
      :task="currentTask"
      :is-saving="isSaving"
      @save="saveTask"
      @cancel="closeTaskModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useTasksStore } from '../store/modules/tasks';
import SpaceVisualization from '../components/visualization/SpaceVisualization.vue';
import TaskModal from '../components/task/TaskModal.vue';
import type { Task } from '../types';

export default defineComponent({
  name: 'TaskVisual',
  
  components: {
    SpaceVisualization,
    TaskModal
  },
  
  setup() {
    const tasksStore = useTasksStore();
    
    // Task modal state
    const isTaskModalOpen = ref(false);
    const currentTask = ref<Task | null>(null);
    const isSaving = ref(false);
    
    onMounted(async () => {
      // Initialize tasks if not already done
      if (!tasksStore.isInitialized) {
        await tasksStore.initializeTasks();
      }
    });
    
    // Task modal methods
    const openTaskDetails = (taskId: string) => {
      const task = tasksStore.getTaskById(taskId);
      if (task) {
        currentTask.value = task;
        isTaskModalOpen.value = true;
      }
    };
    
    const closeTaskModal = () => {
      isTaskModalOpen.value = false;
      currentTask.value = null;
    };
    
    const saveTask = async (taskData: Partial<Task>) => {
      isSaving.value = true;
      
      try {
        if (currentTask.value) {
          // Update existing task
          await tasksStore.updateTask(currentTask.value.id, taskData);
        } else {
          // Create new task
          await tasksStore.addTask(taskData);
        }
        
        closeTaskModal();
      } catch (error) {
        console.error('Failed to save task:', error);
      } finally {
        isSaving.value = false;
      }
    };
    
    return {
      // Task modal state
      isTaskModalOpen,
      currentTask,
      isSaving,
      
      // Methods
      openTaskDetails,
      closeTaskModal,
      saveTask
    };
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
