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
    try {
      // Retrieve all tasks and ensure dates are parsed correctly
      const tasks = await db.tasks.toArray();
      return tasks.map(task => this.deserializeTask(task));
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
  }

  /**
   * Get tasks filtered by completion status
   * @param completed - Whether to get completed or incomplete tasks
   * @returns Promise resolving to filtered tasks
   */
  async getByCompletionStatus(completed: boolean): Promise<Task[]> {
    try {
      // Use a filter function instead of where clause for type safety
      const tasks = await db.tasks.filter(task => task.completed === completed).toArray();
      return tasks.map(task => this.deserializeTask(task));
    } catch (error) {
      console.error('Error fetching tasks by completion status:', error);
      return [];
    }
  }

  /**
   * Get tasks with due dates in the specified range
   * @param startDate - Start of the range
   * @param endDate - End of the range
   * @returns Promise resolving to tasks in the date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      // Convert dates to strings for comparison
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();
      
      const tasks = await db.tasks
        .filter(task => {
          const taskDateStr = task.dueDate instanceof Date 
            ? task.dueDate.toISOString() 
            : typeof task.dueDate === 'string' 
              ? task.dueDate 
              : new Date(task.dueDate).toISOString();
              
          return taskDateStr >= startStr && taskDateStr <= endStr;
        })
        .toArray();
        
      return tasks.map(task => this.deserializeTask(task));
    } catch (error) {
      console.error('Error fetching tasks by date range:', error);
      return [];
    }
  }

  /**
   * Get tasks with the specified tags
   * @param tags - Array of tags to filter by
   * @returns Promise resolving to tasks with matching tags
   */
  async getByTags(tags: string[]): Promise<Task[]> {
    if (!tags.length) return [];
    
    try {
      // Using a filter function to find tasks containing any of the specified tags
      const tasks = await db.tasks
        .filter(task => {
          if (!Array.isArray(task.tags)) return false;
          return task.tags.some(tag => tags.includes(tag));
        })
        .toArray();
        
      return tasks.map(task => this.deserializeTask(task));
    } catch (error) {
      console.error('Error fetching tasks by tags:', error);
      return [];
    }
  }

  /**
   * Get a single task by its ID
   * @param id - The task ID
   * @returns Promise resolving to the task or undefined if not found
   */
  async getById(id: string): Promise<Task | undefined> {
    try {
      const task = await db.tasks.get(id);
      return task ? this.deserializeTask(task) : undefined;
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Create a new task in the database
   * @param task - The task to create
   * @returns Promise resolving to the created task ID
   */
  async create(task: Omit<Task, 'id'>): Promise<string> {
    try {
      // Generate a UUID for the task
      const taskWithId = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as Task;
      
      // Serialize the task to ensure it can be stored in IndexedDB
      const serializedTask = this.serializeTask(taskWithId);
      
      const id = await db.tasks.add(serializedTask);
      return id.toString();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param id - The task ID
   * @param updates - Partial task object with fields to update
   * @returns Promise resolving to true if successful
   */
  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<boolean> {
    try {
      // Always update the updatedAt timestamp
      const updatedFields = {
        ...updates,
        updatedAt: new Date()
      };
      
      // Serialize the updates to ensure they can be stored in IndexedDB
      const serializedUpdates = this.serializePartialTask(updatedFields);
      
      await db.tasks.update(id, serializedUpdates);
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

  /**
   * Serialize a task for storage in IndexedDB
   * Converts Date objects to ISO strings and handles any other serialization needs
   */
  private serializeTask(task: Task): any {
    return {
      ...task,
      dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
      createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
      updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
      // Ensure tags and externalLinks are properly serialized
      tags: [...(task.tags || [])],
      externalLinks: task.externalLinks ? task.externalLinks.map(link => ({...link})) : []
    };
  }

  /**
   * Serialize a partial task update for storage in IndexedDB
   */
  private serializePartialTask(updates: Partial<Task>): any {
    const serialized: any = {...updates};
    
    if (updates.dueDate instanceof Date) {
      serialized.dueDate = updates.dueDate.toISOString();
    }
    
    if (updates.createdAt instanceof Date) {
      serialized.createdAt = updates.createdAt.toISOString();
    }
    
    if (updates.updatedAt instanceof Date) {
      serialized.updatedAt = updates.updatedAt.toISOString();
    }
    
    if (updates.tags) {
      serialized.tags = [...updates.tags];
    }
    
    if (updates.externalLinks) {
      serialized.externalLinks = updates.externalLinks.map(link => ({...link}));
    }
    
    return serialized;
  }

  /**
   * Deserialize a task from IndexedDB storage
   * Converts ISO string dates back to Date objects
   */
  private deserializeTask(task: any): Task {
    return {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
      // Ensure tags and externalLinks are properly deserialized
      tags: Array.isArray(task.tags) ? [...task.tags] : [],
      externalLinks: Array.isArray(task.externalLinks) ? task.externalLinks.map((link: any) => ({...link})) : []
    };
  }
}

// Export a singleton instance
export const taskRepository = new TaskRepository();
