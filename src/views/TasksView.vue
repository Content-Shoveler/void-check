<template>
  <div class="tasks-view">
    <div class="tasks-header">
      <h1>All Tasks</h1>
      <v-button 
        variant="primary" 
        @click="openNewTaskModal"
      >
        Add Task
      </v-button>
    </div>
    
    <div class="tasks-content">
      <task-list 
        :tasks="taskStore.tasks"
        @task-click="openTaskModal"
      />
    </div>
    
    <!-- Task Modal -->
    <task-modal
      v-if="isModalOpen"
      :task-id="activeTaskId"
      @close="closeModal"
      @update="onTaskUpdate"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useTaskStore } from '@/store/task';
import { Task } from '@/data/models/Task';
import TaskList from '@/components/tasks/TaskList.vue';
import TaskModal from '@/components/tasks/TaskModal.vue';
import VButton from '@/components/ui/base/VButton.vue';

export default defineComponent({
  name: 'TasksView',
  
  components: {
    TaskList,
    TaskModal,
    VButton
  },
  
  setup() {
    const taskStore = useTaskStore();
    const isModalOpen = ref(false);
    const activeTaskId = ref<string | null>(null);
    
    // Load tasks when component mounts
    onMounted(async () => {
      await taskStore.loadTasks();
    });
    
    // Open task modal with existing task
    const openTaskModal = (taskId: string) => {
      activeTaskId.value = taskId;
      isModalOpen.value = true;
    };
    
    // Open task modal for new task
    const openNewTaskModal = () => {
      activeTaskId.value = null;
      isModalOpen.value = true;
    };
    
    // Close modal
    const closeModal = () => {
      isModalOpen.value = false;
      setTimeout(() => {
        activeTaskId.value = null;
      }, 200); // Delay to allow animation
    };
    
    // Handle task update
    const onTaskUpdate = (updatedTask: Task) => {
      // Modal stays open, no need to do anything here
      // Task is already updated in the store
    };
    
    return {
      taskStore,
      isModalOpen,
      activeTaskId,
      openTaskModal,
      openNewTaskModal,
      closeModal,
      onTaskUpdate
    };
  }
});
</script>

<style lang="scss" scoped>
.tasks-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    h1 {
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(156, 39, 176, 0.3);
    }
  }
  
  .tasks-content {
    margin-bottom: 2rem;
  }
}
</style>
