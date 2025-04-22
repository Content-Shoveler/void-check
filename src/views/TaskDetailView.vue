<template>
  <div class="task-detail-view">
    <div v-if="loading" class="loading-container">
      <div class="loading-animation">
        <div class="loading-circle"></div>
      </div>
      <p>Loading task...</p>
    </div>
    
    <div v-else-if="!task" class="error-container">
      <h2>Task not found</h2>
      <p>The task you're looking for doesn't exist or has been deleted.</p>
      <v-button @click="goBack" variant="primary">Go Back</v-button>
    </div>
    
    <template v-else>
      <div class="task-header">
        <div class="task-header-actions">
          <v-button variant="ghost" @click="goBack" class="back-button">
            ← Back
          </v-button>
        </div>
        <h1>{{ task.title }}</h1>
        <div class="task-meta">
          <div class="task-status" :class="{ 'completed': task.completed }">
            {{ task.completed ? 'Completed' : 'Pending' }}
          </div>
          <div class="task-due-date">
            Due: {{ formatDate(task.dueDate) }}
          </div>
          <div class="task-priority" :class="`priority-${task.priority}`">
            {{ getPriorityLabel(task.priority) }}
          </div>
        </div>
      </div>
      
      <div class="task-content">
        <v-card variant="default" class="task-card">
          <template #header>
            <div class="card-header">
              <h3>Details</h3>
            </div>
          </template>
          
          <div class="task-description">
            <p v-if="task.description">{{ task.description }}</p>
            <p v-else class="empty-description">No description provided</p>
          </div>
          
          <div class="task-tags" v-if="task.tags && task.tags.length > 0">
            <h4>Tags:</h4>
            <div class="tags-container">
              <span 
                v-for="tag in task.tags" 
                :key="tag" 
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="task-links" v-if="task.externalLinks && task.externalLinks.length > 0">
            <h4>External Links:</h4>
            <ul class="links-list">
              <li v-for="link in task.externalLinks" :key="link.url">
                <a :href="link.url" target="_blank" rel="noopener noreferrer">
                  {{ link.title }}
                </a>
              </li>
            </ul>
          </div>
        </v-card>
        
        <div class="task-actions">
          <v-button 
            variant="secondary" 
            @click="toggleComplete"
            :class="{ 'completed-button': task.completed }"
          >
            {{ task.completed ? 'Mark as Incomplete' : 'Mark as Complete' }}
          </v-button>
          
          <v-button variant="primary" @click="showEditForm = true">
            Edit Task
          </v-button>
          
          <v-button variant="danger" @click="showDeleteConfirm = true">
            Delete Task
          </v-button>
        </div>
      </div>
    </template>
    
    <!-- Delete confirmation dialog (placeholder) -->
    <div v-if="showDeleteConfirm" class="delete-confirm-overlay">
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
    
    <!-- Edit form (placeholder) -->
    <div v-if="showEditForm" class="edit-form-overlay">
      <div class="edit-form-container">
        <h3>Edit Task</h3>
        <p>Edit form will be implemented here</p>
        <div class="form-actions">
          <v-button variant="ghost" @click="showEditForm = false">
            Cancel
          </v-button>
          <v-button variant="primary" @click="updateTask">
            Save Changes
          </v-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskStore } from '@/store/task';
import { TaskPriority } from '@/data/models/Task';
import VButton from '@/components/ui/base/VButton.vue';
import VCard from '@/components/ui/base/VCard.vue';

export default defineComponent({
  name: 'TaskDetailView',
  
  components: {
    VButton,
    VCard
  },
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const taskStore = useTaskStore();
    
    const loading = ref(true);
    const showDeleteConfirm = ref(false);
    const showEditForm = ref(false);
    
    // Get task ID from route params
    const taskId = computed(() => route.params.id as string);
    
    // Get task from store
    const task = computed(() => {
      return taskStore.tasks.find(t => t.id === taskId.value) || null;
    });
    
    // Load tasks when component mounts
    onMounted(async () => {
      // Only load tasks if they're not already loaded
      if (taskStore.tasks.length === 0) {
        await taskStore.loadTasks();
      }
      loading.value = false;
    });
    
    // Watch for task ID changes to reload data
    watch(taskId, async () => {
      loading.value = true;
      await taskStore.loadTasks();
      loading.value = false;
    });
    
    // Format date for display
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Get priority label
    const getPriorityLabel = (priority: TaskPriority) => {
      switch (priority) {
        case TaskPriority.LOW:
          return 'Low Priority';
        case TaskPriority.MEDIUM:
          return 'Medium Priority';
        case TaskPriority.HIGH:
          return 'High Priority';
        case TaskPriority.CRITICAL:
          return 'Critical Priority';
        default:
          return 'Unknown Priority';
      }
    };
    
    // Navigation
    const goBack = () => {
      router.back();
    };
    
    // Toggle task completion
    const toggleComplete = async () => {
      if (task.value) {
        await taskStore.toggleTaskCompletion(task.value.id);
      }
    };
    
    // Delete task
    const deleteTask = async () => {
      if (task.value) {
        await taskStore.deleteTask(task.value.id);
        router.push('/');
      }
    };
    
    // Update task (placeholder)
    const updateTask = async () => {
      // This would use form data to update the task
      showEditForm.value = false;
    };
    
    return {
      task,
      loading,
      showDeleteConfirm,
      showEditForm,
      formatDate,
      getPriorityLabel,
      goBack,
      toggleComplete,
      deleteTask,
      updateTask
    };
  }
});
</script>

<style lang="scss">
.task-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
    
    h2 {
      margin-bottom: 1rem;
    }
    
    .loading-animation {
      margin-bottom: 1rem;
      
      .loading-circle {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(156, 39, 176, 0.3);
        border-top: 4px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }
  
  .task-header {
    margin-bottom: 2rem;
    
    .task-header-actions {
      margin-bottom: 1rem;
      
      .back-button {
        padding-left: 0;
      }
    }
    
    h1 {
      margin-bottom: 1rem;
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(156, 39, 176, 0.3);
    }
    
    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      
      > div {
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
      }
      
      .task-status {
        background-color: var(--color-warning);
        color: #fff;
        
        &.completed {
          background-color: var(--color-success);
        }
      }
      
      .task-due-date {
        background-color: rgba(0, 0, 0, 0.2);
        color: var(--color-text);
      }
      
      .task-priority {
        &.priority-1 {
          background-color: #4CAF50;
          color: #fff;
        }
        
        &.priority-2 {
          background-color: #2196F3;
          color: #fff;
        }
        
        &.priority-3 {
          background-color: #FF9800;
          color: #fff;
        }
        
        &.priority-4 {
          background-color: #F44336;
          color: #fff;
        }
      }
    }
  }
  
  .task-content {
    margin-bottom: 2rem;
    
    .task-card {
      margin-bottom: 2rem;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
        }
      }
      
      .task-description {
        margin-bottom: 1.5rem;
        line-height: 1.6;
        
        .empty-description {
          color: var(--color-text-secondary);
          font-style: italic;
        }
      }
      
      .task-tags {
        margin-bottom: 1.5rem;
        
        h4 {
          margin-bottom: 0.5rem;
        }
        
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          
          .tag {
            background-color: var(--color-primary);
            color: #fff;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-circle);
            font-size: 0.75rem;
          }
        }
      }
      
      .task-links {
        h4 {
          margin-bottom: 0.5rem;
        }
        
        .links-list {
          list-style: none;
          padding: 0;
          
          li {
            margin-bottom: 0.5rem;
            
            a {
              color: var(--color-primary);
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              
              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
    
    .task-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      
      .completed-button {
        background-color: var(--color-success);
      }
    }
  }
  
  .delete-confirm-overlay,
  .edit-form-overlay {
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
    
    .delete-confirm-container,
    .edit-form-container {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      
      h3 {
        margin-bottom: 1rem;
      }
      
      p {
        margin-bottom: 1.5rem;
      }
      
      .confirm-actions,
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .task-detail-view {
    .task-meta {
      flex-direction: column;
      
      > div {
        width: 100%;
      }
    }
    
    .task-actions {
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }
}
</style>
