<template>
  <div class="tasks-view">
    <div class="tasks-view__header">
      <h1 class="cyber-text-glow">Tasks</h1>
      <div class="tasks-view__actions">
        <CyberButton @click="openNewTaskModal">
          Add Task
        </CyberButton>
      </div>
    </div>

    <div class="tasks-view__controls">
      <div class="tasks-view__search">
        <CyberInput
          v-model="searchQuery"
          placeholder="Search tasks..."
          @input="onSearch"
        >
          <template #icon-left>🔍</template>
        </CyberInput>
      </div>
      
      <div class="tasks-view__filters">
        <div class="tasks-view__filter-group">
          <CyberButton
            size="small"
            :variant="activeFilter === null ? 'primary' : 'ghost'"
            @click="setFilter(null)"
          >
            All
          </CyberButton>
          <CyberButton
            size="small"
            :variant="activeFilter === 'active' ? 'primary' : 'ghost'"
            @click="setFilter('active')"
          >
            Active
          </CyberButton>
          <CyberButton
            size="small"
            :variant="activeFilter === 'completed' ? 'primary' : 'ghost'"
            @click="setFilter('completed')"
          >
            Completed
          </CyberButton>
          <CyberButton
            size="small"
            :variant="activeFilter === 'overdue' ? 'primary' : 'ghost'"
            @click="setFilter('overdue')"
          >
            Overdue
          </CyberButton>
          <CyberButton
            size="small"
            :variant="activeFilter === 'today' ? 'primary' : 'ghost'"
            @click="setFilter('today')"
          >
            Today
          </CyberButton>
        </div>
        
        <div class="tasks-view__sort">
          <div class="tasks-view__sort-label">Sort by:</div>
          <CyberSelect
            v-model="sortField"
            :options="sortOptions"
            @update:modelValue="updateSort"
          />
          <CyberButton
            size="small"
            variant="ghost"
            icon-only
            @click="toggleSortDirection"
            :title="sortDirection === 'asc' ? 'Ascending' : 'Descending'"
          >
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </CyberButton>
        </div>
      </div>
    </div>

    <div class="tasks-view__content">
      <TaskList
        :tasks="filteredTasks"
        :is-loading="isLoading"
        :active-filter="activeFilter"
        @add-task="openNewTaskModal"
        @toggle-complete="toggleTaskCompletion"
        @edit-task="editTask"
        @delete-task="deleteTask"
        @clear-completed="clearCompleted"
      />
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useTasksStore } from '../store/modules/tasks';
import CyberButton from '../components/cyber/buttons/CyberButton.vue';
import CyberInput from '../components/cyber/inputs/CyberInput.vue';
import CyberSelect from '../components/cyber/inputs/CyberSelect.vue';
import TaskList from '../components/task/TaskList.vue';
import TaskModal from '../components/task/TaskModal.vue';
import type { Task } from '../types';

export default defineComponent({
  name: 'TasksView',
  components: {
    CyberButton,
    CyberInput,
    CyberSelect,
    TaskList,
    TaskModal
  },
  setup() {
    const tasksStore = useTasksStore();
    
    // State
    const isTaskModalOpen = ref(false);
    const currentTask = ref<Task | null>(null);
    const isSaving = ref(false);
    const searchQuery = ref('');
    const activeFilter = ref<string | null>(null);
    const sortField = ref('dueDate');
    const sortDirection = ref<'asc' | 'desc'>('asc');
    const isLoading = computed(() => tasksStore.isLoading);
    
    // Sort options
    const sortOptions = [
      { value: 'dueDate', label: 'Due Date' },
      { value: 'createdAt', label: 'Created Date' },
      { value: 'title', label: 'Title' },
      { value: 'priority', label: 'Priority' }
    ];
    
    // Computed properties
    const filteredTasks = computed(() => tasksStore.filteredTasks);
    
    // Initialize tasks
    onMounted(async () => {
      await tasksStore.initializeTasks();
    });
    
    // Watch for changes to search, filter, and sort
    watch(searchQuery, (query) => {
      tasksStore.setSearchQuery(query);
    });
    
    watch(activeFilter, (filter) => {
      tasksStore.setActiveFilter(filter);
    });
    
    watch([sortField, sortDirection], () => {
      tasksStore.setActiveSort(sortField.value, sortDirection.value);
    });
    
    // Methods
    const onSearch = () => {
      tasksStore.setSearchQuery(searchQuery.value);
    };
    
    const setFilter = (filter: string | null) => {
      activeFilter.value = filter;
    };
    
    const updateSort = () => {
      tasksStore.setActiveSort(sortField.value, sortDirection.value);
    };
    
    const toggleSortDirection = () => {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    };
    
    const openNewTaskModal = () => {
      currentTask.value = null;
      isTaskModalOpen.value = true;
    };
    
    const editTask = (taskId: string) => {
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
    
    const toggleTaskCompletion = async (taskId: string) => {
      await tasksStore.toggleTaskCompletion(taskId);
    };
    
    const deleteTask = async (taskId: string) => {
      await tasksStore.deleteTask(taskId);
    };
    
    const clearCompleted = async () => {
      await tasksStore.clearCompletedTasks();
    };
    
    return {
      // State
      isTaskModalOpen,
      currentTask,
      isSaving,
      searchQuery,
      activeFilter,
      sortField,
      sortDirection,
      sortOptions,
      isLoading,
      filteredTasks,
      
      // Methods
      onSearch,
      setFilter,
      updateSort,
      toggleSortDirection,
      openNewTaskModal,
      editTask,
      closeTaskModal,
      saveTask,
      toggleTaskCompletion,
      deleteTask,
      clearCompleted
    };
  }
});
</script>

<style lang="scss" scoped>
.tasks-view {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  min-height: 80vh;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-5);
    
    h1 {
      margin: 0;
      font-size: var(--text-3xl);
    }
  }
  
  &__controls {
    margin-bottom: var(--space-5);
  }
  
  &__search {
    margin-bottom: var(--space-4);
  }
  
  &__filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
  
  &__filter-group {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  
  &__sort {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  &__sort-label {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
  }
  
  &__content {
    flex: 1;
  }
}

// Responsive styles
@media (max-width: 768px) {
  .tasks-view {
    padding: var(--space-4);
    
    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
      
      h1 {
        margin-bottom: var(--space-2);
      }
    }
    
    &__filters {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
    
    &__filter-group {
      width: 100%;
      overflow-x: auto;
      padding-bottom: var(--space-2);
    }
  }
}
</style>
