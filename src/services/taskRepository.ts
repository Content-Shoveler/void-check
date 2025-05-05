import db from './database';
import type { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { createTask, updateTask, isOverdue, isDueToday } from '../utils/taskUtils';

/**
 * Task Repository Service
 * 
 * Provides methods for interacting with tasks in the database
 * Abstracts the database operations from the store
 * Supports both legacy and new task formats
 */
export class TaskRepository {
  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    // Convert stored tasks to normalized format
    const storedTasks = await db.tasks.toArray();
    // Tasks are already fully populated, no need to convert them
    return storedTasks;
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
    return await db.tasks.filter(task => {
      // Handle both legacy and new task model
      const isCompleted = task.status ? task.status.completed : task.completed;
      return isCompleted === completed;
    }).toArray();
  }

  /**
   * Get overdue tasks (due date is in the past and not completed)
   */
  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await db.tasks
      .filter(task => {
        // Use utility function for consistency
        return isOverdue(task);
      })
      .toArray();
  }

  /**
   * Get tasks due today (due date is today and not completed)
   */
  async getTasksDueToday(): Promise<Task[]> {
    return await db.tasks
      .filter(task => {
        // Use utility function for consistency
        return isDueToday(task);
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
    // Use the utility to create a properly formatted task
    const newTask = createTask({
      ...taskData,
      id: uuidv4() // Ensure we have a new ID
    });
    
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
    
    // Use the utility to ensure proper task format
    const updatedTask = updateTask(task, {
      ...updates,
      updatedAt: now,
      history: [...task.history, historyEntry]
    });
    
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
    
    // Use status.completed for the new model
    const isCurrentlyCompleted = task.status?.completed !== undefined 
      ? task.status.completed 
      : task.completed;
    
    return await this.update(id, { 
      completed: !isCurrentlyCompleted,
      status: {
        ...task.status,
        completed: !isCurrentlyCompleted,
        completedAt: !isCurrentlyCompleted ? new Date() : undefined
      }
    });
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
  
  /**
   * Create a task from a calendar event
   */
  async createFromCalendarEvent(
    eventData: any, 
    source: 'google' | 'microsoft'
  ): Promise<Task> {
    // Convert event to task
    const taskData: Partial<Task> = {
      title: eventData.title || eventData.summary || 'Calendar Event',
      description: eventData.description || '',
      source,
      sourceId: eventData.id,
      lastSynced: new Date(),
      
      // Location common to calendar events
      location: eventData.location,
      
      // Timing information
      startTime: eventData.start?.dateTime 
        ? new Date(eventData.start.dateTime) 
        : undefined,
      
      endTime: eventData.end?.dateTime 
        ? new Date(eventData.end.dateTime) 
        : new Date(),
        
      isAllDay: eventData.isAllDay || false,
      
      // Additional calendar info
      attendees: eventData.attendees,
      
      // Store original event data
      sourceMetadata: eventData
    };
    
    // Create and store the task
    return await this.create(taskData);
  }
}

// Create singleton instance
const taskRepository = new TaskRepository();

export default taskRepository;
