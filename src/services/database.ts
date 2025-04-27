
import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Task } from '../types';

/**
 * VoidCheckDB - Database service for the Cyberpunk Space Todo application
 * 
 * This service provides access to the IndexedDB database using Dexie.js
 */
export class VoidCheckDB extends Dexie {
  // Table definitions
  tasks!: Table<Task, string>; // string = type of the primary key

  constructor() {
    super('VoidCheckDB');
    
    // Define database schema with indexes for efficient querying
    this.version(1).stores({
      tasks: 'id, completed, dueDate, priority, *tags, createdAt, updatedAt'
      // id is the primary key
      // completed, dueDate, priority are indexed for filtering
      // tags is a multi-entry index for tag filtering
      // createdAt, updatedAt are indexed for sorting
    });
  }

  /**
   * Initialize the database and load test data if needed
   */
  async initialize(): Promise<void> {
    try {
      // Check if the database has already been initialized
      const taskCount = await this.tasks.count();
      console.log(`Database initialized with ${taskCount} tasks`);
      
      // If we want to add sample data on first run, we could do it here
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
}

// Create a singleton instance of the database
const db = new VoidCheckDB();

export default db;
