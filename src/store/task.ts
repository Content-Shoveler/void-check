import { defineStore } from 'pinia';
import { Task, TaskPriority, createTask } from '@/data/models/Task';
import { taskRepository } from '@/data/db/repositories/taskRepository';

/**
 * Interface for the task store state
 */
interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Task store using Pinia
 */
export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    activeTaskId: null,
    loading: false,
    error: null,
    lastUpdated: null
  }),
  
  /**
   * Getters for derived state
   */
  getters: {
    /**
     * Get all tasks sorted by due date (closest first)
     */
    sortedTasks: (state) => {
      return [...state.tasks].sort((a, b) => 
        a.dueDate.getTime() - b.dueDate.getTime()
      );
    },
    
    /**
     * Get active task
     */
    activeTask: (state) => {
      return state.activeTaskId 
        ? state.tasks.find(task => task.id === state.activeTaskId) || null
        : null;
    },
    
    /**
     * Get completed tasks
     */
    completedTasks: (state) => {
      return state.tasks.filter(task => task.completed);
    },
    
    /**
     * Get pending tasks
     */
    pendingTasks: (state) => {
      return state.tasks.filter(task => !task.completed);
    },
    
    /**
     * Get tasks by priority
     */
    tasksByPriority: (state) => (priority: TaskPriority) => {
      return state.tasks.filter(task => task.priority === priority);
    },
    
    /**
     * Get tasks by tag
     */
    tasksByTag: (state) => (tag: string) => {
      return state.tasks.filter(task => task.tags.includes(tag));
    },
    
    /**
     * Get all unique tags
     */
    allTags: (state) => {
      const tagsSet = new Set<string>();
      state.tasks.forEach(task => {
        task.tags.forEach(tag => tagsSet.add(tag));
      });
      return Array.from(tagsSet);
    }
  },
  
  /**
   * Actions for modifying state
   */
  actions: {
    /**
     * Load all tasks from the database
     */
    async loadTasks() {
      this.loading = true;
      this.error = null;
      
      try {
        this.tasks = await taskRepository.getAllTasks();
        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Failed to load tasks:', error);
        this.error = 'Failed to load tasks';
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Set the active task
     */
    setActiveTask(taskId: string | null) {
      this.activeTaskId = taskId;
    },
    
    /**
     * Add a new task
     */
    async addTask(taskData: Partial<Task> = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const newTask = createTask(taskData);
        await taskRepository.addTask(newTask);
        this.tasks.push(newTask);
        this.lastUpdated = new Date();
        return newTask.id;
      } catch (error) {
        console.error('Failed to add task:', error);
        this.error = 'Failed to add task';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update an existing task
     */
    async updateTask(updatedTask: Task) {
      this.loading = true;
      this.error = null;
      
      try {
        await taskRepository.updateTask(updatedTask);
        
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = { ...updatedTask };
        }
        
        this.lastUpdated = new Date();
        return true;
      } catch (error) {
        console.error('Failed to update task:', error);
        this.error = 'Failed to update task';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Delete a task
     */
    async deleteTask(taskId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        await taskRepository.deleteTask(taskId);
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        
        if (this.activeTaskId === taskId) {
          this.activeTaskId = null;
        }
        
        this.lastUpdated = new Date();
        return true;
      } catch (error) {
        console.error('Failed to delete task:', error);
        this.error = 'Failed to delete task';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Toggle task completion status
     */
    async toggleTaskCompletion(taskId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        
        const newStatus = !task.completed;
        await taskRepository.setTaskCompletionStatus(taskId, newStatus);
        
        // Update local state
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = {
            ...this.tasks[index],
            completed: newStatus,
            updatedAt: new Date()
          };
        }
        
        this.lastUpdated = new Date();
        return true;
      } catch (error) {
        console.error('Failed to toggle task completion:', error);
        this.error = 'Failed to update task status';
        return false;
      } finally {
        this.loading = false;
      }
    }
  },
  
  /**
   * Configure persistence
   */
  persist: {
    storage: localStorage,
    paths: ['activeTaskId']
  }
});
