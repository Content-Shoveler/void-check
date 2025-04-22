<template>
  <div class="task-list">
    <div class="task-list-header">
      <div class="view-controls">
        <button 
          class="view-control" 
          :class="{ active: viewMode === 'list' }"
          @click="setViewMode('list')"
        >
          <span class="icon">≡</span> List
        </button>
        <button 
          class="view-control" 
          :class="{ active: viewMode === 'grid' }"
          @click="setViewMode('grid')"
        >
          <span class="icon">□</span> Cards
        </button>
      </div>
      
      <div class="task-filters">
        <select v-model="priorityFilter" class="filter-select">
          <option value="all">All Priorities</option>
          <option :value="1">Low Priority</option>
          <option :value="2">Medium Priority</option>
          <option :value="3">High Priority</option>
          <option :value="4">Critical Priority</option>
        </select>
        
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
    
    <div class="task-list-content" :class="viewMode">
      <div v-if="filteredTasks.length === 0" class="no-tasks">
        <p>No tasks found. Try adjusting your filters or create a new task.</p>
      </div>
      
      <template v-else>
        <!-- Grid view (cards) -->
        <div v-if="viewMode === 'grid'" class="task-grid">
          <v-card 
            v-for="task in filteredTasks" 
            :key="task.id"
            variant="outlined"
            class="task-card"
            :class="{
              'task-completed': task.completed,
              [`priority-${task.priority}`]: true
            }"
            @click="$emit('task-click', task.id)"
          >
            <template #header>
              <div class="task-card-header">
                <div class="task-indicators">
                  <span 
                    class="status-indicator"
                    :class="{ 'completed': task.completed }"
                  >
                    {{ task.completed ? 'Completed' : 'Pending' }}
                  </span>
                  <span 
                    class="priority-indicator"
                    :class="`priority-${task.priority}`"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
              </div>
            </template>
            
            <div class="task-card-content">
              <h3 class="task-title">{{ task.title }}</h3>
              
              <p v-if="task.description" class="task-description">
                {{ truncateText(task.description, 100) }}
              </p>
              
              <div class="task-due-date">
                Due: {{ formatDate(task.dueDate) }}
                <span v-if="isTaskOverdue(task)" class="overdue-label">OVERDUE</span>
              </div>
              
              <div v-if="task.tags.length > 0" class="task-tags">
                <span 
                  v-for="tag in task.tags.slice(0, 3)" 
                  :key="tag" 
                  class="task-tag"
                >
                  {{ tag }}
                </span>
                <span v-if="task.tags.length > 3" class="more-tags">
                  +{{ task.tags.length - 3 }} more
                </span>
              </div>
            </div>
          </v-card>
        </div>
        
        <!-- List view -->
        <div v-else class="task-table">
          <div class="task-table-header">
            <div class="table-cell title-cell">Title</div>
            <div class="table-cell due-date-cell">Due Date</div>
            <div class="table-cell priority-cell">Priority</div>
            <div class="table-cell status-cell">Status</div>
          </div>
          
          <div 
            v-for="task in filteredTasks" 
            :key="task.id"
            class="task-row"
            :class="{
              'task-completed': task.completed,
              [`priority-${task.priority}`]: true
            }"
            @click="$emit('task-click', task.id)"
          >
            <div class="table-cell title-cell">
              <div class="task-title">{{ task.title }}</div>
              <div v-if="task.tags.length > 0" class="task-tags-inline">
                <span 
                  v-for="tag in task.tags.slice(0, 2)" 
                  :key="tag" 
                  class="task-tag small"
                >
                  {{ tag }}
                </span>
                <span v-if="task.tags.length > 2" class="more-tags">
                  +{{ task.tags.length - 2 }}
                </span>
              </div>
            </div>
            
            <div class="table-cell due-date-cell">
              {{ formatDate(task.dueDate) }}
              <span v-if="isTaskOverdue(task)" class="overdue-label small">OVERDUE</span>
            </div>
            
            <div class="table-cell priority-cell">
              <span 
                class="priority-indicator small"
                :class="`priority-${task.priority}`"
              >
                {{ getPriorityLabel(task.priority) }}
              </span>
            </div>
            
            <div class="table-cell status-cell">
              <span 
                class="status-indicator small"
                :class="{ 'completed': task.completed }"
              >
                {{ task.completed ? 'Completed' : 'Pending' }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Task, TaskPriority, isTaskOverdue } from '@/data/models/Task';
import VCard from '@/components/ui/base/VCard.vue';

export default defineComponent({
  name: 'TaskList',
  
  components: {
    VCard
  },
  
  props: {
    tasks: {
      type: Array as () => Task[],
      required: true
    },
    defaultViewMode: {
      type: String,
      default: 'grid', // 'grid' or 'list'
      validator: (value: string) => ['grid', 'list'].includes(value)
    }
  },
  
  emits: ['task-click'],
  
  setup(props, { emit }) {
    // View mode
    const viewMode = ref(props.defaultViewMode);
    
    // Filters
    const priorityFilter = ref('all');
    const statusFilter = ref('all');
    
    // Set view mode
    const setViewMode = (mode: 'grid' | 'list') => {
      viewMode.value = mode;
    };
    
    // Filtered tasks
    const filteredTasks = computed(() => {
      return props.tasks.filter(task => {
        // Apply priority filter
        if (priorityFilter.value !== 'all' && task.priority !== Number(priorityFilter.value)) {
          return false;
        }
        
        // Apply status filter
        if (statusFilter.value === 'pending' && task.completed) {
          return false;
        }
        
        if (statusFilter.value === 'completed' && !task.completed) {
          return false;
        }
        
        return true;
      });
    });
    
    // Get priority label
    const getPriorityLabel = (priority: TaskPriority) => {
      switch (priority) {
        case TaskPriority.LOW:
          return 'Low';
        case TaskPriority.MEDIUM:
          return 'Medium';
        case TaskPriority.HIGH:
          return 'High';
        case TaskPriority.CRITICAL:
          return 'Critical';
        default:
          return 'Unknown';
      }
    };
    
    // Format date for display
    const formatDate = (date: Date) => {
      const d = new Date(date);
      return d.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    // Truncate text to specified length
    const truncateText = (text: string, maxLength: number) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };
    
    return {
      viewMode,
      priorityFilter,
      statusFilter,
      filteredTasks,
      setViewMode,
      getPriorityLabel,
      formatDate,
      truncateText,
      isTaskOverdue
    };
  }
});
</script>

<style lang="scss" scoped>
.task-list {
  width: 100%;
  
  .task-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
    
    .view-controls {
      display: flex;
      gap: 0.5rem;
      
      .view-control {
        background: none;
        border: 1px solid var(--color-divider);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        
        &.active {
          background-color: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        
        .icon {
          font-size: 1.25rem;
        }
      }
    }
    
    .task-filters {
      display: flex;
      gap: 1rem;
      
      .filter-select {
        padding: 0.5rem;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        background-color: var(--color-bg-input);
        color: var(--color-text);
        
        &:focus {
          border-color: var(--color-primary);
          outline: none;
        }
      }
    }
  }
  
  .task-list-content {
    width: 100%;
    
    .no-tasks {
      padding: 2rem;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: var(--radius-md);
    }
    
    &.grid {
      .task-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
        
        .task-card {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          height: 100%;
          
          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          
          &.task-completed {
            opacity: 0.7;
          }
          
          .task-card-header {
            padding: 0.5rem 1rem;
          }
          
          .task-card-content {
            padding: 0.5rem 1rem 1rem;
            
            .task-title {
              margin-bottom: 0.5rem;
              font-size: 1.1rem;
              font-weight: 600;
            }
            
            .task-description {
              margin-bottom: 1rem;
              color: var(--color-text-secondary);
              font-size: 0.9rem;
            }
            
            .task-due-date {
              margin-bottom: 0.75rem;
              font-size: 0.9rem;
              color: var(--color-text-secondary);
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .task-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 0.25rem;
            }
          }
        }
      }
    }
    
    &.list {
      .task-table {
        width: 100%;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        overflow: hidden;
        
        .task-table-header {
          display: flex;
          background-color: rgba(0, 0, 0, 0.05);
          font-weight: 600;
          
          .table-cell {
            padding: 0.75rem 1rem;
            flex-shrink: 0;
          }
        }
        
        .task-row {
          display: flex;
          border-top: 1px solid var(--color-divider);
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: rgba(0, 0, 0, 0.03);
          }
          
          &.task-completed {
            background-color: rgba(0, 0, 0, 0.02);
            color: var(--color-text-secondary);
          }
          
          .table-cell {
            padding: 0.75rem 1rem;
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }
        }
        
        .title-cell {
          flex: 1;
          min-width: 200px;
          
          .task-title {
            font-weight: 500;
          }
          
          .task-tags-inline {
            display: flex;
            gap: 0.25rem;
            margin-top: 0.25rem;
          }
        }
        
        .due-date-cell {
          width: 150px;
        }
        
        .priority-cell {
          width: 120px;
        }
        
        .status-cell {
          width: 100px;
        }
      }
    }
  }
  
  .task-indicators {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .status-indicator {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-circle);
    font-size: 0.75rem;
    background-color: var(--color-warning);
    color: white;
    
    &.completed {
      background-color: var(--color-success);
    }
    
    &.small {
      font-size: 0.7rem;
      padding: 0.15rem 0.4rem;
    }
  }
  
  .priority-indicator {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-circle);
    font-size: 0.75rem;
    
    &.priority-1 {
      background-color: #4CAF50;
      color: white;
    }
    
    &.priority-2 {
      background-color: #2196F3;
      color: white;
    }
    
    &.priority-3 {
      background-color: #FF9800;
      color: white;
    }
    
    &.priority-4 {
      background-color: #F44336;
      color: white;
    }
    
    &.small {
      font-size: 0.7rem;
      padding: 0.15rem 0.4rem;
    }
  }
  
  .task-tag {
    background-color: var(--color-primary);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-circle);
    font-size: 0.75rem;
    
    &.small {
      font-size: 0.7rem;
      padding: 0.1rem 0.3rem;
    }
  }
  
  .more-tags {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
  
  .overdue-label {
    color: var(--color-danger);
    font-weight: 600;
    font-size: 0.75rem;
    
    &.small {
      font-size: 0.7rem;
    }
  }
}

@media (max-width: 768px) {
  .task-list {
    .task-list-header {
      flex-direction: column;
      align-items: flex-start;
      
      .task-filters {
        width: 100%;
        
        .filter-select {
          flex: 1;
        }
      }
    }
    
    .task-list-content.list {
      .task-table {
        .task-table-header {
          .due-date-cell, 
          .priority-cell {
            display: none;
          }
        }
        
        .task-row {
          .due-date-cell, 
          .priority-cell {
            display: none;
          }
        }
        
        .title-cell {
          flex: 1;
        }
        
        .status-cell {
          width: 80px;
        }
      }
    }
  }
}
</style>
