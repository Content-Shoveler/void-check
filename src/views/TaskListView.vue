<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <h1 class="title">Tasks</h1>
      <div class="controls">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search tasks..." 
            class="search-input"
          />
        </div>
        
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'card' }" 
            @click="viewMode = 'card'" 
            title="Card View"
          >
            <span class="icon">▦</span>
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'list' }" 
            @click="viewMode = 'list'" 
            title="List View"
          >
            <span class="icon">≡</span>
          </button>
        </div>
        
        <div class="filters">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          
          <select v-model="sortBy" class="filter-select">
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="createdAt">Sort by Creation Date</option>
          </select>
        </div>
        
        <button class="create-btn" @click="createNewTask">
          <span class="icon">+</span>
          <span class="btn-text">New Task</span>
        </button>
      </div>
    </div>
    
    <!-- Task Cards View -->
    <div v-if="viewMode === 'card'" class="tasks-card-view">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No Tasks Found</h3>
        <p class="empty-state-message">
          No tasks match your current filters. Try adjusting your search or create a new task.
        </p>
      </div>
      
      <div v-else class="card-grid">
        <TaskCard 
          v-for="task in filteredTasks" 
          :key="task.id" 
          :task="task"
          @click="openTaskDetails(task)"
          @toggle-completion="toggleTaskCompletion"
          @delete="confirmDeleteTask"
        />
      </div>
    </div>
    
    <!-- Task List View -->
    <div v-else class="tasks-list-view">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No Tasks Found</h3>
        <p class="empty-state-message">
          No tasks match your current filters. Try adjusting your search or create a new task.
        </p>
      </div>
      
      <table v-else class="tasks-table">
        <thead>
          <tr>
            <th class="status-col"></th>
            <th class="title-col">Title</th>
            <th class="due-date-col">Due Date</th>
            <th class="priority-col">Priority</th>
            <th class="tags-col">Tags</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="task in filteredTasks" 
            :key="task.id" 
            :class="{ completed: task.completed }"
            @click="openTaskDetails(task)"
            class="task-row"
          >
            <td class="status-col">
              <span 
                class="status-indicator" 
                :class="`priority-${task.priority}`"
                :title="task.completed ? 'Completed' : 'Pending'"
              ></span>
            </td>
            <td class="title-col">{{ task.title }}</td>
            <td class="due-date-col">{{ formatDate(task.dueDate) }}</td>
            <td class="priority-col">
              <span class="priority-text">
                {{ getPriorityText(task.priority) }}
              </span>
            </td>
            <td class="tags-col">
              <div class="tag-list">
                <span 
                  v-for="(tag, index) in task.tags.slice(0, 2)" 
                  :key="index" 
                  class="tag"
                >
                  {{ tag }}
                </span>
                <span v-if="task.tags.length > 2" class="tag-more">
                  +{{ task.tags.length - 2 }}
                </span>
              </div>
            </td>
            <td class="actions-col">
              <div class="action-buttons">
                <button 
                  class="action-button toggle-button"
                  @click.stop="toggleTaskCompletion(task)"
                  :title="task.completed ? 'Mark as pending' : 'Mark as completed'"
                >
                  {{ task.completed ? '↩' : '✓' }}
                </button>
                <button 
                  class="action-button delete-button"
                  @click.stop="confirmDeleteTask(task)"
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/store/task';
import TaskCard from '@/components/tasks/TaskCard.vue';
import type { Task } from '@/data/models/Task';

// Store access
const taskStore = useTaskStore();
const router = useRouter();

// State
const viewMode = ref<'card' | 'list'>('card');
const searchQuery = ref('');
const filterStatus = ref<'all' | 'completed' | 'pending'>('all');
const sortBy = ref<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');

// Computed
const filteredTasks = computed(() => {
  let tasks = [...taskStore.allTasks];
  
  // Apply status filter
  if (filterStatus.value === 'completed') {
    tasks = tasks.filter(task => task.completed);
  } else if (filterStatus.value === 'pending') {
    tasks = tasks.filter(task => !task.completed);
  }
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(query) || 
      (task.description?.toLowerCase().includes(query) || false) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Apply sorting
  tasks.sort((a, b) => {
    switch (sortBy.value) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        return b.priority - a.priority;  // Higher priority first
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
  
  return tasks;
});

// Methods
const openTaskDetails = (task: Task) => {
  taskStore.setActiveTask(task.id);
  router.push({ name: 'task-detail', params: { id: task.id } });
};

const createNewTask = () => {
  taskStore.setActiveTask(null);
  // Would typically show modal, but for now we'll navigate to task detail with no ID
  router.push({ name: 'task-detail', params: { id: 'new' } });
};

const toggleTaskCompletion = async (task: Task) => {
  await taskStore.toggleTaskCompletion(task.id);
};

const confirmDeleteTask = async (task: Task) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    await taskStore.deleteTask(task.id);
  }
};

const formatDate = (date: Date) => {
  const taskDate = new Date(date);
  const now = new Date();
  
  // If date is today
  if (taskDate.toDateString() === now.toDateString()) {
    return 'Today';
  }
  
  // If date is tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (taskDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // If date is within a week
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  if (taskDate <= nextWeek) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[taskDate.getDay()];
  }
  
  // Otherwise just show the date
  return taskDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const getPriorityText = (priority: number): string => {
  switch (priority) {
    case 1: return 'Very Low';
    case 2: return 'Low';
    case 3: return 'Medium';
    case 4: return 'High';
    case 5: return 'Very High';
    default: return 'Medium';
  }
};

// Lifecycle hooks
onMounted(async () => {
  await taskStore.fetchAllTasks();
});
</script>

<style lang="scss" scoped>
.tasks-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tasks-header {
  margin-bottom: var(--space-lg);
  
  .title {
    font-family: var(--font-family-mono);
    color: var(--color-text-primary);
    margin-top: 0;
    margin-bottom: var(--space-md);
  }
  
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    align-items: center;
  }
  
  .search-box {
    flex: 1;
    min-width: 200px;
    
    .search-input {
      width: 100%;
      padding: var(--space-sm) var(--space-md);
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-bg-tertiary);
      border-radius: var(--border-radius-md);
      color: var(--color-text-primary);
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }
  }
  
  .view-toggle {
    display: flex;
    gap: 1px;
    
    .toggle-btn {
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      padding: var(--space-xs) var(--space-sm);
      cursor: pointer;
      
      &:first-child {
        border-top-left-radius: var(--border-radius-md);
        border-bottom-left-radius: var(--border-radius-md);
      }
      
      &:last-child {
        border-top-right-radius: var(--border-radius-md);
        border-bottom-right-radius: var(--border-radius-md);
      }
      
      &.active {
        background-color: var(--color-accent);
        border-color: var(--color-accent);
        color: var(--color-text-primary);
      }
    }
  }
  
  .filters {
    display: flex;
    gap: var(--space-sm);
    
    .filter-select {
      padding: var(--space-xs) var(--space-sm);
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-bg-tertiary);
      border-radius: var(--border-radius-md);
      color: var(--color-text-primary);
      cursor: pointer;
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }
  }
  
  .create-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-md);
    background-color: var(--color-accent);
    color: var(--color-text-primary);
    border: none;
    border-radius: var(--border-radius-md);
    font-family: var(--font-family-mono);
    font-weight: bold;
    cursor: pointer;
    transition: background-color var(--transition-fast), transform var(--transition-fast);
    white-space: nowrap;
    
    &:hover, &:focus {
      background-color: var(--color-primary);
      transform: translateY(-2px);
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
  
  .empty-state-icon {
    font-size: 3rem;
    margin-bottom: var(--space-md);
    animation: float 6s ease-in-out infinite;
  }
  
  .empty-state-title {
    font-family: var(--font-family-mono);
    color: var(--color-text-primary);
    margin-bottom: var(--space-sm);
  }
  
  .empty-state-message {
    color: var(--color-text-secondary);
    max-width: 400px;
  }
}

// Card view styles
.tasks-card-view {
  overflow-y: auto;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

// List view styles
.tasks-list-view {
  overflow-x: auto;
  overflow-y: auto;
}

.tasks-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th {
    text-align: left;
    padding: var(--space-sm);
    background-color: var(--color-bg-secondary);
    color: var(--color-text-secondary);
    font-family: var(--font-family-mono);
    font-weight: bold;
    font-size: 0.875rem;
    position: sticky;
    top: 0;
    z-index: 1;
    
    &.status-col {
      width: 40px;
    }
    
    &.title-col {
      min-width: 200px;
    }
    
    &.due-date-col {
      width: 120px;
    }
    
    &.priority-col {
      width: 100px;
    }
    
    &.tags-col {
      width: 150px;
    }
    
    &.actions-col {
      width: 80px;
      text-align: center;
    }
  }
  
  .task-row {
    cursor: pointer;
    transition: background-color var(--transition-fast);
    
    &:hover {
      background-color: var(--color-bg-secondary);
    }
    
    &.completed {
      opacity: 0.7;
    }
    
    td {
      padding: var(--space-sm);
      border-bottom: 1px solid var(--color-bg-tertiary);
      
      &.status-col {
        text-align: center;
      }
      
      &.title-col {
        font-weight: bold;
      }
      
      &.actions-col {
        text-align: center;
      }
    }
  }
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  
  &.priority-1 {
    background-color: var(--color-bg-tertiary);
  }
  
  &.priority-2 {
    background-color: var(--color-primary);
    opacity: 0.7;
  }
  
  &.priority-3 {
    background-color: var(--color-primary);
  }
  
  &.priority-4 {
    background-color: var(--color-accent);
  }
  
  &.priority-5 {
    background-color: var(--color-warning);
  }
}

.priority-text {
  font-size: 0.75rem;
  font-family: var(--font-family-mono);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tag {
  background-color: var(--color-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: 0.7rem;
  white-space: nowrap;
}

.tag-more {
  color: var(--color-text-secondary);
  font-size: 0.7rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--space-xs);
}

.action-button {
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-full);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color var(--transition-fast);
  
  &.toggle-button {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    
    &:hover {
      background-color: var(--color-success);
    }
  }
  
  &.delete-button {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    
    &:hover {
      background-color: var(--color-warning);
    }
  }
}

@media (max-width: 768px) {
  .tasks-header .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
  
  .tasks-table {
    font-size: 0.875rem;
    
    .due-date-col, .priority-col, .tags-col {
      display: none;
    }
  }
}
</style>
