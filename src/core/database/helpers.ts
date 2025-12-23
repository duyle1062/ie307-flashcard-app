import uuid from "react-native-uuid";
import { executeQuery, executeTransaction } from "./database";
import { SyncOperation } from "./types";

/**
 * Generate a new UUID
 */
export const generateUUID = (): string => {
  return uuid.v4() as string;
};

/**
 * Get current timestamp in ISO format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Calculate due date based on interval
 */
export const calculateDueDate = (interval: number): string => {
  const date = new Date();

  if (interval < 1) {
    // For intervals less than 1 day, add hours
    const hours = interval * 24;
    date.setHours(date.getHours() + hours);
  } else {
    // For intervals >= 1 day, add days
    date.setDate(date.getDate() + interval);
  }

  return date.toISOString().split("T")[0];
};

/**
 * Parse SQL result rows into an array
 */
export const parseRows = <T>(results: {
  rows: { length: number; item: (i: number) => T };
}): T[] => {
  const rows: T[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i));
  }
  return rows;
};

/**
 * Insert a record and add to sync queue
 */
export const insertWithSync = async (
  tableName: string,
  data: Record<string, any>
): Promise<void> => {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map(() => "?").join(", ");

  const insertSql = `INSERT INTO ${tableName} (${columns.join(
    ", "
  )}) VALUES (${placeholders})`;
  const syncSql = `INSERT INTO sync_queue (id, entity_type, entity_id, operation, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    await executeTransaction([
      { sql: insertSql, params: values },
      {
        sql: syncSql,
        params: [
          generateUUID(),
          tableName,
          data.id,
          "INSERT",
          JSON.stringify(data),
          getCurrentTimestamp(),
        ],
      },
    ]);
  } catch (error) {
    console.error("Error inserting with sync:", error);
    throw error;
  }
};

/**
 * Update a record and add to sync queue
 */
export const updateWithSync = async (
  tableName: string,
  recordId: string,
  updates: Record<string, any>,
  changedFields: string[]
): Promise<void> => {
  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), recordId];

  const updateSql = `UPDATE ${tableName} SET ${setClause}, updated_at = datetime('now') WHERE id = ?`;
  const syncSql = `INSERT INTO sync_queue (id, entity_type, entity_id, operation, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    await executeTransaction([
      { sql: updateSql, params: values },
      {
        sql: syncSql,
        params: [
          generateUUID(),
          tableName,
          recordId,
          "UPDATE",
          JSON.stringify({ id: recordId, ...updates }),
          getCurrentTimestamp(),
        ],
      },
    ]);
  } catch (error) {
    console.error("Error updating with sync:", error);
    throw error;
  }
};

/**
 * Soft delete a record and add to sync queue
 * @param additionalData - Optional data to include in sync payload (e.g., collection_id for cards)
 */
export const softDeleteWithSync = async (
  tableName: string,
  recordId: string,
  additionalData?: Record<string, any>
): Promise<void> => {
  const deleteSql = `UPDATE ${tableName} SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`;
  const syncSql = `INSERT INTO sync_queue (id, entity_type, entity_id, operation, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    await executeTransaction([
      { sql: deleteSql, params: [recordId] },
      {
        sql: syncSql,
        params: [
          generateUUID(),
          tableName,
          recordId,
          "DELETE",
          JSON.stringify({ id: recordId, ...additionalData }),
          getCurrentTimestamp(),
        ],
      },
    ]);
  } catch (error) {
    console.error("Error soft deleting with sync:", error);
    throw error;
  }
};

/**
 * Check if there are any local changes that need syncing
 */
export const hasLocalChanges = async (): Promise<boolean> => {
  try {
    const result = await executeQuery(
      "SELECT COUNT(*) as count FROM sync_queue"
    );
    const count = result.rows.item(0).count;
    return count > 0;
  } catch (error) {
    console.error("Error checking local changes:", error);
    return false;
  }
};

/**
 * Get all unsynced changes
 */
export const getUnsyncedChanges = async (): Promise<
  Array<{
    id: string;
    entity_type: string;
    entity_id: string;
    operation: SyncOperation;
    data: string;
    created_at: string;
  }>
> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM sync_queue ORDER BY created_at ASC"
    );

    const changes: Array<{
      id: string;
      entity_type: string;
      entity_id: string;
      operation: SyncOperation;
      data: string;
      created_at: string;
    }> = [];

    for (let i = 0; i < result.rows.length; i++) {
      changes.push(result.rows.item(i));
    }

    return changes;
  } catch (error) {
    console.error("Error getting unsynced changes:", error);
    return [];
  }
};

/**
 * Clear the sync queue (after successful sync)
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await executeQuery("DELETE FROM sync_queue");
  } catch (error) {
    console.error("Error clearing sync queue:", error);
    throw error;
  }
};

/**
 * Remove specific items from sync queue
 */
export const removeSyncQueueItems = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;

  const placeholders = ids.map(() => "?").join(", ");

  try {
    await executeQuery(
      `DELETE FROM sync_queue WHERE id IN (${placeholders})`,
      ids
    );
  } catch (error) {
    console.error("Error removing sync queue items:", error);
    throw error;
  }
};

/**
 * Xóa toàn bộ dữ liệu Local (Dùng khi Logout)
 */
export const clearLocalDatabase = async (): Promise<void> => {
  try {
    console.log("🧹 Clearing local database...");
    await executeQuery("DELETE FROM sync_queue");
    await executeQuery("DELETE FROM reviews");
    await executeQuery("DELETE FROM cards");
    await executeQuery("DELETE FROM collections");
    await executeQuery("DELETE FROM users"); // Xóa user cuối cùng
    await executeQuery("DELETE FROM usage_logs");
    console.log("✅ Local database cleared successfully");
  } catch (error) {
    console.error("Error clearing local database:", error);
    throw error;
  }
};
