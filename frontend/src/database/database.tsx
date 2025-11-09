import * as SQLite from "expo-sqlite";
import { CREATE_TABLES, CREATE_INDEXES, DB_NAME } from "./schema";
import { SQLResultSet, SQLTransaction } from "./types";

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
