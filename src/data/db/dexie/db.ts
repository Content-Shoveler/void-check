import Dexie from 'dexie';
import { schema, migrations } from './schema';
import type { Task } from '../../models/Task';

/**
 * VoidCheckDB - Dexie database instance for the VoidCheck application
 * Provides typed access to IndexedDB storage
 */
class VoidCheckDB extends Dexie {
  tasks!: Dexie.Table<Task, string>;
  settings!: Dexie.Table<{ id: string; value: any }, string>;

  constructor() {
    super('VoidCheckDB');
    
    // Define database version and schema
    this.version(1).stores(schema);
    
    // Define upgrade hooks for future migrations
    for (const [versionKey, migrationFn] of Object.entries(migrations)) {
      const version = parseInt(versionKey, 10);
      if (!isNaN(version) && version > 1) {
        this.version(version).upgrade(migrationFn);
      }
    }
  }
}

// Create and export a singleton instance of the database
const db = new VoidCheckDB();
export default db;

/**
 * Initialize the database and ensure it's ready to use
 * @returns Promise that resolves when the database is ready
 */
export async function initDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('VoidCheck database initialized successfully');
    
    // Check if default settings exist, create them if not
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await initDefaultSettings();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Initialize default application settings
 */
async function initDefaultSettings(): Promise<void> {
  const defaultSettings = [
    { id: 'theme', value: 'dark' },
    { id: 'defaultTimeScale', value: 'day' },
    { id: 'notificationsEnabled', value: true }
  ];
  
  try {
    await db.settings.bulkAdd(defaultSettings);
    console.log('Default settings initialized');
  } catch (error) {
    console.error('Failed to initialize default settings:', error);
  }
}
