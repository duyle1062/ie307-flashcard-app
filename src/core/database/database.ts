import * as SQLite from "expo-sqlite";
import { CREATE_TABLES, CREATE_INDEXES, DB_NAME } from "./schema";
import { SQLResultSet, SQLTransaction } from "./types";
// Removed seedDatabase import - no longer auto-creating collections on init

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize and open the database
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    if (database) {
      console.log("Database already initialized");
      return database;
    }

    console.log("Opening database...");
    database = await SQLite.openDatabaseAsync(DB_NAME);

    console.log("Database opened successfully");
    await createTables();

    // Run migrations BEFORE creating indexes
    await migrateSyncQueueTable();
    await migrateToIsDeleted();

    // Create indexes AFTER migrations (so new columns exist)
    await createIndexes();

    console.log("Database initialization complete");
    return database;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

/**
 * Get the current database instance
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!database) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return database;
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (database) {
    await database.closeAsync();
    database = null;
    console.log("Database closed");
  }
};

/**
 * Create all tables
 */
const createTables = async (): Promise<void> => {
  const db = getDatabase();

  try {
    console.log("Creating tables...");

    for (const [tableName, createStatement] of Object.entries(CREATE_TABLES)) {
      console.log(`Creating table: ${tableName}`);
      await db.execAsync(createStatement);
    }

    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

/**
 * Create all indexes
 */
const createIndexes = async (): Promise<void> => {
  const db = getDatabase();

  try {
    console.log("Creating indexes...");

    for (const [indexName, createStatement] of Object.entries(CREATE_INDEXES)) {
      console.log(`Creating index: ${indexName}`);
      await db.execAsync(createStatement);
    }

    console.log("All indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  }
};

/**
 * Execute a SQL query
 */
export const executeQuery = async (
  sql: string,
  params: any[] = []
): Promise<any> => {
  const db = getDatabase();

  try {
    const result = await db.getAllAsync(sql, params);
    // Format result to match old API structure
    return {
      rows: {
        length: result.length,
        item: (i: number) => result[i],
        _array: result,
      },
      rowsAffected: result.length,
    };
  } catch (error) {
    console.error("Error executing query:", error);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw error;
  }
};

/**
 * Execute multiple SQL statements in a transaction
 */
export const executeTransaction = async (
  statements: Array<{ sql: string; params?: any[] }>
): Promise<void> => {
  const db = getDatabase();

  try {
    await db.withTransactionAsync(async () => {
      for (const { sql, params = [] } of statements) {
        await db.runAsync(sql, params);
      }
    });
  } catch (error) {
    console.error("Error executing transaction:", error);
    throw error;
  }
};

/**
 * Migrate sync_queue table to use new column names
 */
export const migrateSyncQueueTable = async (): Promise<void> => {
  const db = getDatabase();

  try {
    console.log("Migrating sync_queue table...");

    // Check if old columns exist
    const tableInfo = await db.getAllAsync("PRAGMA table_info(sync_queue)");
    const hasOldColumns = tableInfo.some(
      (col: any) => col.name === "table_name" || col.name === "record_id"
    );

    if (hasOldColumns) {
      console.log("Old column names detected, migrating...");

      // SQLite doesn't support ALTER TABLE RENAME COLUMN directly in older versions
      // So we need to: 1) Create new table, 2) Copy data, 3) Drop old, 4) Rename new

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue_new (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
          data TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Copy data from old table to new table (if old table has data)
      await db.execAsync(`
        INSERT INTO sync_queue_new (id, entity_type, entity_id, operation, data, created_at)
        SELECT id, table_name, record_id, operation, data, created_at
        FROM sync_queue
        WHERE EXISTS (SELECT 1 FROM sync_queue LIMIT 1);
      `);

      // Drop old table
      await db.execAsync("DROP TABLE sync_queue");

      // Rename new table to sync_queue
      await db.execAsync("ALTER TABLE sync_queue_new RENAME TO sync_queue");

      // Recreate index
      await db.execAsync(
        "CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);"
      );

      console.log("✅ sync_queue table migrated successfully");
    } else {
      console.log("sync_queue table already has correct column names");
    }
  } catch (error) {
    console.error("Error migrating sync_queue table:", error);
    throw error;
  }
};

/**
 * Migrate to new schema: deleted_at -> is_deleted, remove user_id from cards
 */
export const migrateToIsDeleted = async (): Promise<void> => {
  const db = getDatabase();

  try {
    console.log("Migrating to is_deleted schema...");

    // Check collections table
    const collectionsInfo = await db.getAllAsync(
      "PRAGMA table_info(collections)"
    );
    const collectionsHasIsDeleted = collectionsInfo.some(
      (col: any) => col.name === "is_deleted"
    );
    const collectionsHasDeletedAt = collectionsInfo.some(
      (col: any) => col.name === "deleted_at"
    );

    if (!collectionsHasIsDeleted || collectionsHasDeletedAt) {
      console.log("Migrating collections table to is_deleted...");

      // Clean up any leftover temp table from failed migration
      await db.execAsync("DROP TABLE IF EXISTS collections_new");

      await db.execAsync(`
        CREATE TABLE collections_new (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          is_deleted INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Build the INSERT query based on which columns exist
      if (collectionsHasDeletedAt) {
        // Old schema with deleted_at
        await db.execAsync(`
          INSERT INTO collections_new (id, user_id, name, description, is_deleted, created_at, updated_at)
          SELECT id, user_id, name, description, 
                 CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END, 
                 created_at, updated_at
          FROM collections;
        `);
      } else {
        // New schema or fresh install - just copy data
        await db.execAsync(`
          INSERT INTO collections_new (id, user_id, name, description, is_deleted, created_at, updated_at)
          SELECT id, user_id, name, description, 
                 COALESCE(is_deleted, 0),
                 created_at, updated_at
          FROM collections;
        `);
      }

      await db.execAsync("DROP TABLE collections");
      await db.execAsync("ALTER TABLE collections_new RENAME TO collections");

      console.log("✅ Collections table migrated to is_deleted");
    }

    // Check cards table
    const cardsInfo = await db.getAllAsync("PRAGMA table_info(cards)");
    const cardsHasIsDeleted = cardsInfo.some(
      (col: any) => col.name === "is_deleted"
    );
    const cardsHasDeletedAt = cardsInfo.some(
      (col: any) => col.name === "deleted_at"
    );
    const cardsHasUserId = cardsInfo.some((col: any) => col.name === "user_id");

    if (!cardsHasIsDeleted || cardsHasDeletedAt || cardsHasUserId) {
      console.log(
        "Migrating cards table to is_deleted and removing user_id..."
      );

      // Clean up any leftover temp table from failed migration
      await db.execAsync("DROP TABLE IF EXISTS cards_new");

      await db.execAsync(`
        CREATE TABLE cards_new (
          id TEXT PRIMARY KEY,
          collection_id TEXT NOT NULL,
          front TEXT NOT NULL,
          back TEXT NOT NULL,
          status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review')),
          interval INTEGER DEFAULT 0,
          ef REAL DEFAULT 2.5,
          due_date TEXT,
          is_deleted INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
        );
      `);

      // Build the INSERT query based on which columns exist
      if (cardsHasDeletedAt) {
        // Old schema with deleted_at
        await db.execAsync(`
          INSERT INTO cards_new (id, collection_id, front, back, status, interval, ef, due_date, is_deleted, created_at, updated_at)
          SELECT id, collection_id, front, back, status, interval, ef, due_date,
                 CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END,
                 created_at, updated_at
          FROM cards;
        `);
      } else {
        // New schema or fresh install - just copy data
        await db.execAsync(`
          INSERT INTO cards_new (id, collection_id, front, back, status, interval, ef, due_date, is_deleted, created_at, updated_at)
          SELECT id, collection_id, front, back, status, interval, ef, due_date, 
                 COALESCE(is_deleted, 0),
                 created_at, updated_at
          FROM cards;
        `);
      }

      await db.execAsync("DROP TABLE cards");
      await db.execAsync("ALTER TABLE cards_new RENAME TO cards");

      console.log("✅ Cards table migrated to is_deleted");
    }
  } catch (error) {
    console.error("Error migrating to is_deleted:", error);
    throw error;
  }
};

/**
 * Drop all tables (for development/testing only)
 */
export const dropAllTables = async (): Promise<void> => {
  const db = getDatabase();

  try {
    console.log("Dropping all tables...");

    await db.execAsync("DROP TABLE IF EXISTS sync_queue");
    await db.execAsync("DROP TABLE IF EXISTS usage_logs");
    await db.execAsync("DROP TABLE IF EXISTS reviews");
    await db.execAsync("DROP TABLE IF EXISTS cards");
    await db.execAsync("DROP TABLE IF EXISTS collections");
    await db.execAsync("DROP TABLE IF EXISTS users");

    console.log("All tables dropped");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  }
};

/**
 * Reset the entire database (drop and recreate)
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log("Resetting database...");
    await dropAllTables();
    await createTables();
    await createIndexes();
    console.log("Database reset complete");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
};

/**
 * Execute raw SQL (alias for executeQuery)
 */
export const executeSql = executeQuery;
