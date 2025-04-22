import db from '../dexie/db';
import type { Task, LinkItem } from '../../models/Task';

/**
 * TaskRepository provides methods for CRUD operations on tasks
 * following the repository pattern to abstract the data access layer
 */
export class TaskRepository {
  /**
   * Get all tasks from the database
   * @returns Promise resolving to an array of tasks
   */
  async getAll(): Promise<Task[]> {
    return await db.tasks.toArray();
  }

  /**
   * Get tasks filtered by completion status
   * @param completed - Whether to get completed or incomplete tasks
   * @returns Promise resolving to filtered tasks
   */
  async getByCompletionStatus(completed: boolean): Promise<Task[]> {
    return await db.tasks.where('completed').equals(completed).toArray();
  }

  /**
   * Get tasks with due dates in the specified range
   * @param startDate - Start of the range
   * @param endDate - End of the range
   * @returns Promise resolving to tasks in the date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return await db.tasks
      .where('dueDate')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  /**
   * Get tasks with the specified tags
   * @param tags - Array of tags to filter by
   * @returns Promise resolving to tasks with matching tags
   */
  async getByTags(tags: string[]): Promise<Task[]> {
    if (!tags.length) return [];
    
    // Using Dexie's WhereClause for tag filtering
    return await db.tasks
      .where('tags')
      .anyOf(tags)
      .toArray();
  }

  /**
   * Get a single task by its ID
   * @param id - The task ID
   * @returns Promise resolving to the task or undefined if not found
   */
  async getById(id: string): Promise<Task | undefined> {
    return await db.tasks.get(id);
  }

  /**
   * Create a new task in the database
   * @param task - The task to create
   * @returns Promise resolving to the created task ID
   */
  async create(task: Omit<Task, 'id'>): Promise<string> {
    // Generate a UUID for the task
    const taskWithId = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as Task;
    
    const id = await db.tasks.add(taskWithId);
    return id.toString();
  }

  /**
   * Update an existing task
   * @param id - The task ID
   * @param updates - Partial task object with fields to update
   * @returns Promise resolving to true if successful
   */
  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<boolean> {
    // Always update the updatedAt timestamp
    const updatedTask = {
      ...updates,
      updatedAt: new Date()
    };
    
    try {
      await db.tasks.update(id, updatedTask);
      return true;
    } catch (error) {
      console.error('Failed to update task:', error);
      return false;
    }
  }

  /**
   * Delete a task by its ID
   * @param id - The task ID to delete
   * @returns Promise resolving to true if successful
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
   * Toggle the completion status of a task
   * @param id - The task ID
   * @returns Promise resolving to the new completion status
   */
  async toggleCompletion(id: string): Promise<boolean> {
    try {
      const task = await this.getById(id);
      if (!task) return false;
      
      const completed = !task.completed;
      await this.update(id, { completed });
      return completed;
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      return false;
    }
  }

  /**
   * Add a link to a task
   * @param id - The task ID
   * @param link - The link to add
   * @returns Promise resolving to true if successful
   */
  async addLink(id: string, link: LinkItem): Promise<boolean> {
    try {
      const task = await this.getById(id);
      if (!task) return false;
      
      const externalLinks = [...task.externalLinks, link];
      await this.update(id, { externalLinks });
      return true;
    } catch (error) {
      console.error('Failed to add link to task:', error);
      return false;
    }
  }

  /**
   * Remove a link from a task
   * @param id - The task ID
   * @param linkIndex - The index of the link to remove
   * @returns Promise resolving to true if successful
   */
  async removeLink(id: string, linkIndex: number): Promise<boolean> {
    try {
      const task = await this.getById(id);
      if (!task) return false;
      
      const externalLinks = task.externalLinks.filter((_, index) => index !== linkIndex);
      await this.update(id, { externalLinks });
      return true;
    } catch (error) {
      console.error('Failed to remove link from task:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const taskRepository = new TaskRepository();
