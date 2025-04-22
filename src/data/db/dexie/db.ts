import Dexie from 'dexie';
import { DB_NAME, DB_VERSION, schema, DbSchema } from './schema';
import { applyMigrations } from './migrations';

/**
 * VoidCheckDatabase extends Dexie to provide typesafe database operations
 * for our application using IndexedDB
 */
class VoidCheckDatabase extends Dexie {
  // Typed tables
  tasks!: Dexie.Table<DbSchema['tasks'], string>;
  settings!: Dexie.Table<DbSchema['settings'], string>;

  constructor() {
    super(DB_NAME);
    
    // Initialize database with schema
    this.version(DB_VERSION).stores(schema);
    
    // Apply migrations for schema changes in future versions
    applyMigrations(this);
    
    // Initialize default settings if not present
    this.initializeSettings();
  }

  /**
   * Initialize default settings if they don't exist
   */
  private async initializeSettings() {
    const settingsCount = await this.settings.count();
    
    if (settingsCount === 0) {
      await this.settings.add({
        id: 'app_settings',
        theme: {
          darkMode: true,
          accentColor: '#7D3C98' // Deep space purple
        },
        timeScale: {
          id: '24h',
          showGridLines: true,
          showLabels: true
        },
        language: 'en'
      });
    }
  }
}

// Create a database instance
const db = new VoidCheckDatabase();

export default db;
