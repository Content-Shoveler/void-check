import db from './database';
import type { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Task Repository Service
 * 
 * Provides methods for interacting with tasks in the database
 * Abstracts the database operations from the store
 */
export class TaskRepository {
  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    return await db.tasks.toArray();
  }

  /**
   * Get a task by ID
   */
  async getById(id: string): Promise<Task | undefined> {
    return await db.tasks.get(id);
  }

  /**
   * Get tasks by completion status
   */
  async getByCompletionStatus(completed: boolean): Promise<Task[]> {
    return await db.tasks.filter(task => task.completed === completed).toArray();
  }

  /**
   * Get overdue tasks (due date is in the past and not completed)
   */
  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await db.tasks
      .filter(task => !task.completed && new Date(task.dueDate) < now)
      .toArray();
  }

  /**
   * Get tasks due today (due date is today and not completed)
   */
  async getTasksDueToday(): Promise<Task[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.tasks
      .filter(task => {
        const dueDate = new Date(task.dueDate);
        return !task.completed && dueDate >= today && dueDate < tomorrow;
      })
      .toArray();
  }

  /**
   * Get tasks by priority
   */
  async getByPriority(priority: Task['priority']): Promise<Task[]> {
    return await db.tasks.where('priority').equals(priority).toArray();
  }

  /**
   * Get tasks by tag
   */
  async getByTag(tag: string): Promise<Task[]> {
    return await db.tasks.where('tags').equals(tag).toArray();
  }

  /**
   * Search tasks by title or description
   */
  async searchTasks(query: string): Promise<Task[]> {
    const lowerQuery = query.toLowerCase();
    return await db.tasks
      .filter(task => 
        task.title.toLowerCase().includes(lowerQuery) || 
        task.description.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  /**
   * Create a new task
   */
  async create(taskData: Partial<Task>): Promise<Task> {
    const now = new Date();
    
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      dueDate: taskData.dueDate || new Date(now.getTime() + 24 * 60 * 60 * 1000), // Default: tomorrow
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      completed: false,
      priority: taskData.priority || 'medium',
      tags: taskData.tags || [],
      color: taskData.color || '#00F5FF', // Default: cyan
      effectType: taskData.effectType || 'glow',
      isRecurring: taskData.isRecurring || false,
      recurringPattern: taskData.recurringPattern,
      notifications: taskData.notifications || {
        enabled: true,
        reminderTime: 30  // Default: 30 minutes before
      },
      subtasks: taskData.subtasks || [],
      notes: taskData.notes || '',
      links: taskData.links || [],
      history: [
        {
          timestamp: now,
          action: 'created'
        }
      ]
    };
    
    await db.tasks.add(newTask);
    return newTask;
  }

  /**
   * Update an existing task
   */
  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const task = await db.tasks.get(id);
    
    if (!task) return null;
    
    const now = new Date();
    
    // Create history record
    const historyEntry = {
      timestamp: now,
      action: 'updated',
      previousState: { ...task }
    };
    
    // Update the task
    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: now,
      history: [...task.history, historyEntry]
    };
    
    // If marking as complete, set completedAt
    if (updates.completed && !task.completed) {
      updatedTask.completedAt = now;
    }
    // If marking as incomplete, clear completedAt
    else if (updates.completed === false && task.completed) {
      updatedTask.completedAt = null;
    }
    
    await db.tasks.put(updatedTask);
    return updatedTask;
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<boolean> {
    try {
      await db.tasks.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  /**
   * Toggle task completion status
   */
  async toggleCompletion(id: string): Promise<Task | null> {
    const task = await db.tasks.get(id);
    
    if (!task) return null;
    
    return await this.update(id, { completed: !task.completed });
  }

  /**
   * Add a subtask to a task
   */
  async addSubtask(taskId: string, title: string): Promise<Task | null> {
    const task = await db.tasks.get(taskId);
    
    if (!task) return null;
    
    const subtasks = [...task.subtasks, {
      id: uuidv4(),
      title,
      completed: false
    }];
    
    return await this.update(taskId, { subtasks });
  }

  /**
   * Toggle subtask completion status
   */
  async toggleSubtaskCompletion(taskId: string, subtaskId: string): Promise<Task | null> {
    const task = await db.tasks.get(taskId);
    
    if (!task) return null;
    
    const subtaskIndex = task.subtasks.findIndex(subtask => subtask.id === subtaskId);
    
    if (subtaskIndex === -1) return null;
    
    const subtasks = [...task.subtasks];
    subtasks[subtaskIndex] = {
      ...subtasks[subtaskIndex],
      completed: !subtasks[subtaskIndex].completed
    };
    
    return await this.update(taskId, { subtasks });
  }

  /**
   * Delete all completed tasks
   */
  async clearCompletedTasks(): Promise<void> {
    const completedTasks = await this.getByCompletionStatus(true);
    await db.tasks.bulkDelete(completedTasks.map(task => task.id));
  }

  /**
   * Bulk add tasks
   */
  async bulkAdd(tasks: Partial<Task>[]): Promise<Task[]> {
    const newTasks: Task[] = [];
    
    for (const taskData of tasks) {
      const newTask = await this.create(taskData);
      newTasks.push(newTask);
    }
    
    return newTasks;
  }
}

// Create singleton instance
const taskRepository = new TaskRepository();

export default taskRepository;
