<template>
  <div class="task-modal-overlay" @click.self="close">
    <div class="task-modal">
      <div class="task-modal-header">
        <h2>{{ isNewTask ? 'New Task' : task?.title || 'Task Details' }}</h2>
        <button class="close-icon" @click="close">✕</button>
      </div>

      <div class="task-modal-content">
        <task-form 
          :task="task"
          @update="onTaskUpdate"
          @delete="confirmDelete"
        />
      </div>

      <div class="task-modal-footer">
        <v-button variant="ghost" @click="close">Close</v-button>
      </div>

      <!-- Delete confirmation dialog -->
      <div v-if="showDeleteConfirm" class="delete-confirm-overlay" @click.self="showDeleteConfirm = false">
        <div class="delete-confirm-container">
          <h3>Delete Task</h3>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <div class="confirm-actions">
            <v-button variant="ghost" @click="showDeleteConfirm = false">
              Cancel
            </v-button>
            <v-button variant="danger" @click="deleteTask">
              Delete
            </v-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/store/task';
import { Task } from '@/data/models/Task';
import TaskForm from './TaskForm.vue';
import VButton from '@/components/ui/base/VButton.vue';

export default defineComponent({
  name: 'TaskModal',
  
  components: {
    TaskForm,
    VButton
  },
  
  props: {
    taskId: {
      type: String,
      default: null
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'update'],
  
  setup(props, { emit }) {
    const router = useRouter();
    const taskStore = useTaskStore();
    const showDeleteConfirm = ref(false);
    
    // Get task from store based on ID
    const task = computed(() => {
      if (!props.taskId) return null;
      return taskStore.tasks.find(t => t.id === props.taskId) || null;
    });
    
    // Check if this is a new task
    const isNewTask = computed(() => {
      return !props.taskId;
    });
    
    // Close the modal
    const close = () => {
      emit('close');
    };
    
    // Handle task update
    const onTaskUpdate = (updatedTask: Task) => {
      emit('update', updatedTask);
    };
    
    // Show delete confirmation
    const confirmDelete = () => {
      showDeleteConfirm.value = true;
    };
    
    // Delete the task
    const deleteTask = async () => {
      if (task.value) {
        await taskStore.deleteTask(task.value.id);
        showDeleteConfirm.value = false;
        close();
      }
    };
    
    return {
      task,
      isNewTask,
      showDeleteConfirm,
      close,
      onTaskUpdate,
      confirmDelete,
      deleteTask
    };
  }
});
</script>

<style lang="scss" scoped>
.task-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.task-modal {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  
  .task-modal-header {
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid var(--color-divider);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background-color: var(--color-surface);
    z-index: 2;
    
    h2 {
      margin: 0;
      color: var(--color-text);
      font-size: 1.5rem;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .close-icon {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-size: 1.25rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: var(--radius-circle);
      transition: background-color 0.2s;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: var(--color-text);
      }
    }
  }
  
  .task-modal-content {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }
  
  .task-modal-footer {
    padding: 1rem 1.5rem 1.5rem;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--color-divider);
    position: sticky;
    bottom: 0;
    background-color: var(--color-surface);
    z-index: 2;
  }
}

.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
  
  .delete-confirm-container {
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    
    h3 {
      margin-bottom: 1rem;
      color: var(--color-danger);
    }
    
    p {
      margin-bottom: 1.5rem;
    }
    
    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
}

@media (max-width: 600px) {
  .task-modal {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
