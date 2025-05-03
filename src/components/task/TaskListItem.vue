<template>
  <div class="task-list-item" :class="{ 'task-list-item--completed': task.completed }">
    <div class="task-list-item__checkbox">
      <CyberCheckbox 
        :modelValue="task.completed" 
        @update:modelValue="onToggleComplete" 
        :aria-label="task.completed ? 'Mark as incomplete' : 'Mark as complete'"
      />
    </div>
    
    <div class="task-list-item__content" @click="onEditTask">
      <div class="task-list-item__title">
        {{ task.title }}
      </div>
      
      <div class="task-list-item__details">
        <div class="task-list-item__date">
          <span :class="dueDateClass">
            {{ formattedDueDate }}
          </span>
        </div>
        
        <div v-if="task.subtasks.length > 0" class="task-list-item__subtasks">
          <CyberProgressBar 
            :value="completedSubtasksPercentage" 
            size="small" 
            :class="{'task-list-item__progress--completed': subtasksAllCompleted }"
          />
          <span class="task-list-item__subtasks-count">
            {{ completedSubtasks }} / {{ task.subtasks.length }}
          </span>
        </div>
        
        <div v-if="task.tags.length > 0" class="task-list-item__tags">
          <span 
            v-for="tag in task.tags.slice(0, 2)" 
            :key="tag" 
            class="task-list-item__tag"
          >
            {{ tag }}
          </span>
          <span v-if="task.tags.length > 2" class="task-list-item__tag-more">
            +{{ task.tags.length - 2 }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="task-list-item__priority" :class="`task-list-item__priority--${task.priority}`"></div>
    
    <div class="task-list-item__actions">
      <CyberButton 
        variant="ghost" 
        size="small" 
        icon-only 
        @click="onEditTask" 
        aria-label="Edit task"
      >
        ✏️
      </CyberButton>
      <CyberButton 
        variant="ghost" 
        size="small" 
        icon-only 
        @click="onDeleteTask" 
        aria-label="Delete task"
      >
        🗑️
      </CyberButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { Task } from '../../types';
import CyberCheckbox from '../cyber/inputs/CyberCheckbox.vue';
import CyberProgressBar from '../cyber/cards/CyberProgressBar.vue';
import CyberButton from '../cyber/buttons/CyberButton.vue';

export default defineComponent({
  name: 'TaskListItem',
  components: {
    CyberCheckbox,
    CyberProgressBar,
    CyberButton
  },
  props: {
    task: {
      type: Object as PropType<Task>,
      required: true
    }
  },
  emits: ['toggle-complete', 'edit', 'delete'],
  setup(props, { emit }) {
    // Format the due date nicely
    const formattedDueDate = computed(() => {
      const dueDate = new Date(props.task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      // Due date is in the past
      if (dueDate < today) {
        const days = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return days === 0 ? 'Due today' : days === 1 ? 'Due yesterday' : `${days} days overdue`;
      }
      
      // Due date is today
      if (dueDate >= today && dueDate < tomorrow) {
        return 'Due today';
      }
      
      // Due date is tomorrow
      if (dueDate >= tomorrow && dueDate < new Date(tomorrow.getTime() + 86400000)) {
        return 'Due tomorrow';
      }
      
      // Due date is within a week
      if (dueDate < nextWeek) {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
        return `Due ${dueDate.toLocaleDateString(undefined, options)}`;
      }
      
      // Due date is later
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return `Due ${dueDate.toLocaleDateString(undefined, options)}`;
    });
    
    // Determine the color class for the due date
    const dueDateClass = computed(() => {
      const dueDate = new Date(props.task.dueDate);
      const now = new Date();
      
      if (props.task.completed) return 'task-list-item__date--completed';
      if (dueDate < now) return 'task-list-item__date--overdue';
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (dueDate <= today) return 'task-list-item__date--today';
      
      return 'task-list-item__date--upcoming';
    });
    
    // Calculate subtask completion stats
    const completedSubtasks = computed(() => 
      props.task.subtasks.filter(subtask => subtask.completed).length
    );
    
    const completedSubtasksPercentage = computed(() => 
      props.task.subtasks.length ? (completedSubtasks.value / props.task.subtasks.length) * 100 : 0
    );
    
    const subtasksAllCompleted = computed(() => 
      props.task.subtasks.length > 0 && completedSubtasks.value === props.task.subtasks.length
    );
    
    // Event handlers
    const onToggleComplete = () => {
      emit('toggle-complete', props.task.id);
    };
    
    const onEditTask = () => {
      emit('edit', props.task.id);
    };
    
    const onDeleteTask = () => {
      emit('delete', props.task.id);
    };
    
    return {
      formattedDueDate,
      dueDateClass,
      completedSubtasks,
      completedSubtasksPercentage,
      subtasksAllCompleted,
      onToggleComplete,
      onEditTask,
      onDeleteTask
    };
  }
});
</script>

<style lang="scss" scoped>
.task-list-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background-color: var(--color-background-card);
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    
    .task-list-item__actions {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  &--completed {
    opacity: 0.7;
    
    .task-list-item__title {
      text-decoration: line-through;
      color: var(--color-text-secondary);
    }
  }
  
  &__checkbox {
    margin-right: var(--space-3);
    flex-shrink: 0;
  }
  
  &__content {
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }
  
  &__title {
    font-weight: var(--font-medium);
    margin-bottom: var(--space-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &__details {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }
  
  &__date {
    flex-shrink: 0;
    
    &--overdue {
      color: var(--color-priority-critical);
      font-weight: var(--font-medium);
    }
    
    &--today {
      color: var(--color-priority-high);
      font-weight: var(--font-medium);
    }
    
    &--upcoming {
      color: var(--color-text-secondary);
    }
    
    &--completed {
      color: var(--color-priority-low);
    }
  }
  
  &__subtasks {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
    
    &-count {
      font-size: var(--text-xs);
      white-space: nowrap;
    }
  }
  
  &__progress {
    width: 60px;
    
    &--completed {
      color: var(--color-priority-low);
    }
  }
  
  &__tags {
    display: flex;
    gap: var(--space-1);
    flex-wrap: nowrap;
    overflow: hidden;
  }
  
  &__tag {
    font-size: var(--text-xs);
    padding: 2px 6px;
    border-radius: 10px;
    background-color: rgba(var(--color-primary-rgb), 0.2);
    color: var(--color-primary);
    white-space: nowrap;
  }
  
  &__tag-more {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }
  
  &__priority {
    width: 4px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    
    &--low {
      background-color: var(--color-priority-low);
    }
    
    &--medium {
      background-color: var(--color-priority-medium);
    }
    
    &--high {
      background-color: var(--color-priority-high);
    }
    
    &--critical {
      background-color: var(--color-priority-critical);
    }
  }
  
  &__actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    opacity: 0;
    transform: translateX(10px);
    transition: opacity 0.2s var(--ease-out), transform 0.2s var(--ease-out);
  }
}

@media (max-width: 768px) {
  .task-list-item {
    &__actions {
      opacity: 1;
      transform: translateX(0);
    }
    
    &__details {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-1);
    }
  }
}
</style>
