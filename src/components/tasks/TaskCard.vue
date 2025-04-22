<template>
  <div 
    class="task-card" 
    :class="{ completed: task.completed }"
    @click="$emit('click', task)"
  >
    <div class="task-header">
      <div class="priority-indicator" :class="`priority-${task.priority}`"></div>
      <div class="task-title">{{ task.title }}</div>
    </div>
    
    <div class="task-content">
      <div class="task-description" v-if="task.description">
        {{ truncateDescription(task.description) }}
      </div>
      
      <div class="task-metadata">
        <div class="due-date">
          <span class="metadata-label">Due:</span>
          <span class="metadata-value">{{ formatDate(task.dueDate) }}</span>
        </div>
        
        <div class="task-tags" v-if="task.tags.length > 0">
          <span 
            v-for="(tag, index) in displayedTags" 
            :key="index" 
            class="tag"
          >
            {{ tag }}
          </span>
          <span v-if="task.tags.length > 3" class="tag-more">
            +{{ task.tags.length - 3 }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="task-footer">
      <div class="completion-status">
        <span v-if="task.completed" class="completed-text">Completed</span>
        <span v-else class="pending-text">Pending</span>
      </div>
      
      <div class="task-actions">
        <button 
          class="action-button toggle-button"
          @click.stop="$emit('toggle-completion', task)"
          :title="task.completed ? 'Mark as pending' : 'Mark as completed'"
        >
          {{ task.completed ? '↩' : '✓' }}
        </button>
        <button 
          class="action-button delete-button"
          @click.stop="$emit('delete', task)"
          title="Delete task"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '@/data/models/Task';

// Props
interface Props {
  task: Task;
}

const props = defineProps<Props>();

// Emits
defineEmits<{
  (e: 'click', task: Task): void;
  (e: 'toggle-completion', task: Task): void;
  (e: 'delete', task: Task): void;
}>();

// Computed properties
const displayedTags = computed(() => props.task.tags.slice(0, 3));

// Methods
const truncateDescription = (description: string) => {
  if (description.length > 100) {
    return description.slice(0, 100) + '...';
  }
  return description;
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
</script>

<style lang="scss" scoped>
.task-card {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  border-left: 4px solid var(--color-primary);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  &.completed {
    border-left-color: var(--color-success);
    opacity: 0.7;
  }
}

.task-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.priority-indicator {
  width: 12px;
  height: 12px;
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

.task-title {
  font-family: var(--font-family-mono);
  font-weight: bold;
  font-size: 1rem;
  flex-grow: 1;
}

.task-content {
  margin-bottom: var(--space-sm);
}

.task-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  line-height: 1.4;
}

.task-metadata {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.75rem;
}

.metadata-label {
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
}

.metadata-value {
  color: var(--color-text-primary);
  margin-left: var(--space-xs);
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
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

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-sm);
  border-top: 1px solid var(--color-bg-tertiary);
  padding-top: var(--space-sm);
}

.completion-status {
  font-size: 0.75rem;
  
  .completed-text {
    color: var(--color-success);
  }
  
  .pending-text {
    color: var(--color-text-secondary);
  }
}

.task-actions {
  display: flex;
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
</style>
