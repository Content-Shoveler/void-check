<template>
  <div class="task-list">
    <!-- Loading state -->
    <div v-if="isLoading" class="task-list__loading">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!tasks.length" class="task-list__empty">
      <div class="cyber-icon">📋</div>
      <h3>No tasks found</h3>
      <p v-if="activeFilter">Try changing your filter settings</p>
      <CyberButton v-else @click="onAddTask">Add your first task</CyberButton>
    </div>

    <!-- Task list content -->
    <div v-else class="task-list__content">
      <!-- Overdue tasks section -->
      <div v-if="overdueTasks.length" class="task-list__section task-list__section--overdue">
        <div class="task-list__section-header">
          <h3>Overdue</h3>
          <CyberBadge variant="error">{{ overdueTasks.length }}</CyberBadge>
        </div>
        <transition-group name="task-list-anim" tag="ul" class="task-list__items">
          <li v-for="task in overdueTasks" :key="task.id" class="task-list__item">
            <task-list-item 
              :task="task" 
              @toggle-complete="onToggleComplete" 
              @edit="onEditTask" 
              @delete="onDeleteTask" 
            />
          </li>
        </transition-group>
      </div>

      <!-- Today's tasks section -->
      <div v-if="todayTasks.length" class="task-list__section task-list__section--today">
        <div class="task-list__section-header">
          <h3>Today</h3>
          <CyberBadge variant="primary">{{ todayTasks.length }}</CyberBadge>
        </div>
        <transition-group name="task-list-anim" tag="ul" class="task-list__items">
          <li v-for="task in todayTasks" :key="task.id" class="task-list__item">
            <task-list-item 
              :task="task" 
              @toggle-complete="onToggleComplete" 
              @edit="onEditTask" 
              @delete="onDeleteTask" 
            />
          </li>
        </transition-group>
      </div>

      <!-- Upcoming tasks section -->
      <div v-if="upcomingTasks.length" class="task-list__section task-list__section--upcoming">
        <div class="task-list__section-header">
          <h3>Upcoming</h3>
          <CyberBadge variant="secondary">{{ upcomingTasks.length }}</CyberBadge>
        </div>
        <transition-group name="task-list-anim" tag="ul" class="task-list__items">
          <li v-for="task in upcomingTasks" :key="task.id" class="task-list__item">
            <task-list-item 
              :task="task" 
              @toggle-complete="onToggleComplete" 
              @edit="onEditTask" 
              @delete="onDeleteTask" 
            />
          </li>
        </transition-group>
      </div>

      <!-- Completed tasks section -->
      <div v-if="completedTasks.length" class="task-list__section task-list__section--completed">
        <div class="task-list__section-header">
          <h3>Completed</h3>
          <CyberBadge variant="success">{{ completedTasks.length }}</CyberBadge>
          <CyberButton 
            v-if="completedTasks.length > 2" 
            size="small" 
            variant="ghost"
            @click="onClearCompleted"
          >
            Clear All
          </CyberButton>
        </div>
        <transition-group name="task-list-anim" tag="ul" class="task-list__items">
          <li v-for="task in completedTasks.slice(0, showAllCompleted ? completedTasks.length : 3)" :key="task.id" class="task-list__item">
            <task-list-item 
              :task="task" 
              @toggle-complete="onToggleComplete" 
              @edit="onEditTask" 
              @delete="onDeleteTask" 
            />
          </li>
        </transition-group>
        <div v-if="completedTasks.length > 3 && !showAllCompleted" class="task-list__show-more">
          <CyberButton size="small" variant="ghost" @click="showAllCompleted = true">
            Show all {{ completedTasks.length }} completed tasks
          </CyberButton>
        </div>
        <div v-else-if="showAllCompleted && completedTasks.length > 3" class="task-list__show-more">
          <CyberButton size="small" variant="ghost" @click="showAllCompleted = false">
            Show fewer
          </CyberButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import type { PropType } from 'vue';
import type { Task } from '../../types';
import CyberBadge from '../cyber/cards/CyberBadge.vue';
import CyberButton from '../cyber/buttons/CyberButton.vue';
import TaskListItem from './TaskListItem.vue';

export default defineComponent({
  name: 'TaskList',
  components: {
    CyberBadge,
    CyberButton,
    TaskListItem
  },
  props: {
    tasks: {
      type: Array as PropType<Task[]>,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    activeFilter: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  emits: ['add-task', 'toggle-complete', 'edit-task', 'delete-task', 'clear-completed'],
  setup(props, { emit }) {
    const showAllCompleted = ref(false);

    // Computed properties to categorize tasks
    const overdueTasks = computed(() => {
      const now = new Date();
      return props.tasks.filter(task => 
        !task.completed && new Date(task.dueDate) < now
      ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });

    const todayTasks = computed(() => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return props.tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return !task.completed && dueDate >= today && dueDate < tomorrow;
      }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });

    const upcomingTasks = computed(() => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return props.tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return !task.completed && dueDate >= tomorrow;
      }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });

    const completedTasks = computed(() => 
      props.tasks.filter(task => task.completed)
        .sort((a, b) => {
          const aDate = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const bDate = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return bDate - aDate; // Most recently completed first
        })
    );

    // Event handlers
    const onAddTask = () => {
      emit('add-task');
    };

    const onToggleComplete = (taskId: string) => {
      emit('toggle-complete', taskId);
    };

    const onEditTask = (taskId: string) => {
      emit('edit-task', taskId);
    };

    const onDeleteTask = (taskId: string) => {
      emit('delete-task', taskId);
    };

    const onClearCompleted = () => {
      emit('clear-completed');
    };

    return {
      showAllCompleted,
      overdueTasks,
      todayTasks,
      upcomingTasks,
      completedTasks,
      onAddTask,
      onToggleComplete,
      onEditTask,
      onDeleteTask,
      onClearCompleted
    };
  }
});
</script>

<style lang="scss" scoped>
.task-list {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  &__loading,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    min-height: 200px;
    text-align: center;

    .cyber-icon {
      font-size: 3rem;
      margin-bottom: var(--space-4);
      opacity: 0.6;
    }

    h3 {
      margin-bottom: var(--space-2);
      font-weight: var(--font-medium);
    }

    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-4);
    }
  }

  &__section {
    margin-bottom: var(--space-6);
    
    &--overdue {
      .task-list__section-header h3 {
        color: var(--color-priority-critical);
      }
    }
    
    &--today {
      .task-list__section-header h3 {
        color: var(--color-primary);
      }
    }
    
    &--completed {
      .task-list__items {
        opacity: 0.7;
      }
    }
  }

  &__section-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-3);
    
    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-medium);
      margin-right: var(--space-2);
    }
    
    .cyber-button {
      margin-left: auto;
    }
  }

  &__items {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    margin-bottom: var(--space-3);
  }

  &__show-more {
    text-align: center;
    padding: var(--space-2);
  }

  // Animation for task list items
  .task-list-anim-enter-active,
  .task-list-anim-leave-active {
    transition: all 0.3s var(--ease-out);
  }
  .task-list-anim-enter-from,
  .task-list-anim-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
  .task-list-anim-move {
    transition: transform 0.5s;
  }
}

// Spinner animation
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
