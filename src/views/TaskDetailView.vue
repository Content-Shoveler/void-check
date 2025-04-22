<template>
  <div class="task-detail-container">
    <div class="task-detail-header">
      <h1 class="title">{{ isNewTask ? 'Create New Task' : 'Task Details' }}</h1>
      
      <div class="actions" v-if="!isNewTask">
        <button 
          class="delete-btn" 
          @click="confirmDeleteTask"
          title="Delete task"
        >
          Delete Task
        </button>
      </div>
    </div>
    
    <div class="task-content">
      <div v-if="isLoading" class="loading-indicator">
        Loading task data...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="goToTasksList" class="btn-secondary">Back to Tasks</button>
      </div>
      
      <div v-else>
        <TaskForm 
          :task="currentTask || undefined"
          :mode="formMode"
          @submit="handleSubmit"
          @cancel="handleCancel"
          @edit="formMode = 'edit'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskStore } from '@/store/task';
import { useTimeScaleStore } from '@/store/timeScale';
import TaskForm from '@/components/tasks/TaskForm.vue';
import { createNewTask } from '@/data/models/Task';
import type { Task } from '@/data/models/Task';

// Route and router
const route = useRoute();
const router = useRouter();

// Store access
const taskStore = useTaskStore();
const timeScaleStore = useTimeScaleStore();

// State
const isLoading = ref(false);
const error = ref<string | null>(null);
const formMode = ref<'create' | 'edit' | 'view'>('view');

// Computed
const taskId = computed(() => route.params.id as string);
const isNewTask = computed(() => taskId.value === 'new' || !taskId.value);
const currentTask = computed(() => {
  if (isNewTask.value) {
    return createNewTask();
  }
  
  return taskStore.activeTask || null;
});

// Set form mode based on whether it's a new task
watch(isNewTask, (newValue) => {
  formMode.value = newValue ? 'create' : 'view';
}, { immediate: true });

// Methods
const loadTaskData = async () => {
  if (isNewTask.value) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    await taskStore.fetchTaskById(taskId.value);
    
    if (!taskStore.activeTask) {
      error.value = 'Task not found';
    }
  } catch (err) {
    error.value = 'Failed to load task data';
    console.error('Error loading task:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async (taskData: Partial<Task>) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    if (isNewTask.value) {
      // Create new task
      const id = await taskStore.createTask(taskData as Omit<Task, 'id'>);
      
      if (id) {
        // Navigate to the task list view after successful creation
        router.push({ name: 'tasks' });
      } else {
        error.value = 'Failed to create task';
      }
    } else {
      // Update existing task
      const success = await taskStore.updateTask(taskId.value, taskData);
      
      if (success) {
        // Switch back to view mode after successful update
        formMode.value = 'view';
      } else {
        error.value = 'Failed to update task';
      }
    }
  } catch (err) {
    error.value = 'An error occurred while saving the task';
    console.error('Error saving task:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  if (isNewTask.value) {
    // Go back to task list for new tasks
    router.push({ name: 'tasks' });
  } else {
    // Switch back to view mode for existing tasks
    formMode.value = 'view';
  }
};

const confirmDeleteTask = async () => {
  if (confirm('Are you sure you want to delete this task?')) {
    isLoading.value = true;
    
    try {
      const success = await taskStore.deleteTask(taskId.value);
      
      if (success) {
        router.push({ name: 'tasks' });
      } else {
        error.value = 'Failed to delete task';
      }
    } catch (err) {
      error.value = 'An error occurred while deleting the task';
      console.error('Error deleting task:', err);
    } finally {
      isLoading.value = false;
    }
  }
};

const goToTasksList = () => {
  router.push({ name: 'tasks' });
};

// Load task data on component mount
onMounted(async () => {
  await loadTaskData();
});

// Watch for task ID changes and reload data
watch(taskId, async (newId, oldId) => {
  if (newId !== oldId) {
    await loadTaskData();
  }
});
</script>

<style lang="scss" scoped>
.task-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-md);
}

.task-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  
  .title {
    font-family: var(--font-family-mono);
    color: var(--color-text-primary);
    margin: 0;
  }
  
  .actions {
    display: flex;
    gap: var(--space-md);
  }
}

.delete-btn {
  background-color: var(--color-warning);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--space-xs) var(--space-md);
  font-family: var(--font-family-mono);
  font-weight: bold;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
}

.task-content {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  min-height: 200px;
}

.loading-indicator,
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  gap: var(--space-md);
  text-align: center;
}

.loading-indicator {
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
}

.error-message {
  color: var(--color-warning);
  font-family: var(--font-family-mono);
}

.btn-secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--space-xs) var(--space-md);
  font-family: var(--font-family-mono);
  font-weight: bold;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
