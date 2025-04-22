import { defineStore } from 'pinia';
import { taskRepository } from '@/data/db/repositories/taskRepository';
import type { Task } from '@/data/models/Task';

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useTaskStore = defineStore({
  id: 'task',
  state: (): TaskState => ({
    tasks: [],
    activeTaskId: null,
    isLoading: false,
    error: null
  }),
  
  getters: {
    allTasks: (state) => state.tasks,
    
    completedTasks: (state) => 
      state.tasks.filter(task => task.completed),
    
    incompleteTasks: (state) => 
      state.tasks.filter(task => !task.completed),
    
    activeTask: (state) => 
      state.activeTaskId ? state.tasks.find(task => task.id === state.activeTaskId) : null,
    
    tasksInDateRange: (state) => (startDate: Date, endDate: Date) => 
      state.tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= startDate && taskDate <= endDate;
      }),
      
    tasksByPriority: (state) => (priority: number) =>
      state.tasks.filter(task => task.priority === priority),
      
    tasksByTags: (state) => (tags: string[]) =>
      state.tasks.filter(task => 
        tags.some(tag => task.tags.includes(tag))
      )
  },
  
  actions: {
    async fetchAllTasks() {
      this.isLoading = true;
      this.error = null;
      
      try {
        this.tasks = await taskRepository.getAll();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tasks';
        console.error('Error fetching tasks:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchTaskById(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const task = await taskRepository.getById(id);
        
        if (task) {
          // Update the task in the store if it exists
          const index = this.tasks.findIndex(t => t.id === id);
          
          if (index !== -1) {
            this.tasks[index] = task;
          } else {
            this.tasks.push(task);
          }
          
          this.activeTaskId = id;
        } else {
          this.error = `Task with ID ${id} not found`;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch task';
        console.error(`Error fetching task with ID ${id}:`, error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async createTask(task: Omit<Task, 'id'>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const id = await taskRepository.create(task);
        const newTask = await taskRepository.getById(id);
        
        if (newTask) {
          this.tasks.push(newTask);
          this.activeTaskId = id;
        }
        
        return id;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create task';
        console.error('Error creating task:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const success = await taskRepository.update(id, updates);
        
        if (success) {
          // Fetch the updated task to ensure store and DB are in sync
          const updatedTask = await taskRepository.getById(id);
          
          if (updatedTask) {
            const index = this.tasks.findIndex(task => task.id === id);
            
            if (index !== -1) {
              this.tasks[index] = updatedTask;
            }
          }
        } else {
          this.error = `Failed to update task with ID ${id}`;
        }
        
        return success;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update task';
        console.error(`Error updating task with ID ${id}:`, error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteTask(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const success = await taskRepository.delete(id);
        
        if (success) {
          this.tasks = this.tasks.filter(task => task.id !== id);
          
          if (this.activeTaskId === id) {
            this.activeTaskId = null;
          }
        } else {
          this.error = `Failed to delete task with ID ${id}`;
        }
        
        return success;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete task';
        console.error(`Error deleting task with ID ${id}:`, error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    async toggleTaskCompletion(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const completed = await taskRepository.toggleCompletion(id);
        const task = this.tasks.find(task => task.id === id);
        
        if (task) {
          task.completed = completed;
          task.updatedAt = new Date();
        }
        
        return completed;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to toggle task completion';
        console.error(`Error toggling completion for task with ID ${id}:`, error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    setActiveTask(id: string | null) {
      this.activeTaskId = id;
    }
  },
  
  persist: {
    storage: localStorage,
    key: 'void-check-tasks'
  }
});
