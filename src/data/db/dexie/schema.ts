/**
 * IndexedDB schema definition for VoidCheck application
 * This defines the database tables and their indexes
 */

export const DB_NAME = 'voidcheck_db';
export const DB_VERSION = 1;

/**
 * Schema definition for database tables and indexes
 * Format: tableName: 'indexedProperties, ++autoIncrementKey'
 * 
 * Table schema:
 * - tasks: [id, dueDate, completed, priority, tags]
 * - settings: [id]
 */
export const schema = {
  tasks: 'id, dueDate, completed, priority, *tags',
  settings: 'id'
};

/**
 * Type definitions for the DB schema
 * Must match the structure of the data being stored
 */
export interface DbTask {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  externalLinks: Array<{ title: string; url: string }>;
  completed: boolean;
  priority: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSettings {
  id: string;
  theme: {
    darkMode: boolean;
    accentColor: string;
  };
  timeScale: {
    id: string;
    showGridLines: boolean;
    showLabels: boolean;
  };
  language: string;
}

/**
 * Database tables structure
 */
export interface DbSchema {
  tasks: DbTask;
  settings: DbSettings;
}
