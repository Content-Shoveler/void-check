/**
 * VoidCheck database schema
 * Defines tables and their indices for IndexedDB via Dexie.js
 */

export interface DBSchema {
  [tableName: string]: string;
}

/**
 * Database schema version 1
 * Initial schema with tasks and settings tables
 */
export const schema: DBSchema = {
  tasks: '++id, title, dueDate, completed, priority, *tags',
  settings: 'id, value'
};

/**
 * Migration handlers for database upgrades
 * These will be executed when the database version changes
 */
export const migrations = {
  // 1 -> 2: Example future migration
  // 2: (transaction: Dexie.Transaction) => {
  //   const tasksStore = transaction.table('tasks');
  //   return tasksStore.toCollection().modify(task => {
  //     task.newField = defaultValue;
  //   });
  // }
};
