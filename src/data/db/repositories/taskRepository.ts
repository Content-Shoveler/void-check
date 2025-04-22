import db from '../dexie/db';
import type { DbTask } from '../dexie/schema';
import { Task, TaskPriority, createTask } from '@/data/models/Task';

/**
 * Repository for task-related operations
 * Provides an abstraction layer over the IndexedDB operations
 */
export class TaskRepository {
  /**
   * Get all tasks
   * @returns Promise with array of tasks
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      const dbTasks = await db.tasks.toArray();
      return dbTasks.map(this.mapFromDb);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
  }

  /**
   * Get a task by ID
   * @param id Task ID
   * @returns Promise with the task or null if not found
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const dbTask = await db.tasks.get(id);
      return dbTask ? this.mapFromDb(dbTask) : null;
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Add a new task
   * @param task Task to add
   * @returns Promise with the ID of the newly added task
   */
  async addTask(task: Task): Promise<string> {
    try {
      const dbTask = this.mapToDb(task);
      await db.tasks.add(dbTask);
      return task.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add task');
    }
  }

  /**
   * Update an existing task
   * @param task Updated task
   * @returns Promise indicating success or failure
   */
  async updateTask(task: Task): Promise<boolean> {
    try {
      const dbTask = this.mapToDb(task);
      await db.tasks.update(task.id, dbTask);
      return true;
    } catch (error) {
      console.error(`Error updating task with ID ${task.id}:`, error);
      return false;
    }
  }

  /**
   * Delete a task by ID
   * @param id Task ID to delete
   * @returns Promise indicating success or failure
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      await db.tasks.delete(id);
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Find tasks by their due date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise with array of tasks
   */
  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const dbTasks = await db.tasks
        .where('dueDate')
        .between(startDate, endDate)
        .toArray();
      return dbTasks.map(this.mapFromDb);
    } catch (error) {
      console.error('Error fetching tasks by date range:', error);
      return [];
    }
  }

  /**
   * Find tasks by tag
   * @param tag Tag to search for
   * @returns Promise with array of tasks
   */
  async getTasksByTag(tag: string): Promise<Task[]> {
    try {
      const dbTasks = await db.tasks
        .where('tags')
        .equals(tag)
        .toArray();
      return dbTasks.map(this.mapFromDb);
    } catch (error) {
      console.error(`Error fetching tasks with tag ${tag}:`, error);
      return [];
    }
  }

  /**
   * Mark a task as completed
   * @param id Task ID
   * @param completed Completion status
   * @returns Promise indicating success or failure
   */
  async setTaskCompletionStatus(id: string, completed: boolean): Promise<boolean> {
    try {
      const task = await this.getTaskById(id);
      if (!task) return false;
      
      task.completed = completed;
      task.updatedAt = new Date();
      
      return await this.updateTask(task);
    } catch (error) {
      console.error(`Error updating completion status for task ${id}:`, error);
      return false;
    }
  }

  /**
   * Map from database model to application model
   * @param dbTask Task from database
   * @returns Task model for application use
   */
  private mapFromDb(dbTask: DbTask): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      dueDate: new Date(dbTask.dueDate),
      externalLinks: dbTask.externalLinks,
      completed: dbTask.completed,
      priority: dbTask.priority as TaskPriority,
      tags: dbTask.tags,
      createdAt: new Date(dbTask.createdAt),
      updatedAt: new Date(dbTask.updatedAt)
    };
  }

  /**
   * Map from application model to database model
   * @param task Task from application
   * @returns Task model for database storage
   */
  private mapToDb(task: Task): DbTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      externalLinks: task.externalLinks,
      completed: task.completed,
      priority: task.priority,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }
}

// Export a singleton instance
export const taskRepository = new TaskRepository();
