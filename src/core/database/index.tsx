// Database initialization and management
export {
  initDatabase,
  getDatabase,
  closeDatabase,
  dropAllTables,
  resetDatabase,
  migrateSyncQueueTable,
  migrateToIsDeleted,
  executeSql,
  executeTransaction,
  executeQuery,
} from "./database";

// AsyncStorage utilities
export {
  saveLastSyncTimestamp,
  getLastSyncTimestamp,
  saveCurrentUserId,
  getCurrentUserId,
  saveAuthToken,
  getAuthToken,
  saveUserData,
  getUserData,
  isFirstLaunch,
  setAppLaunched,
  clearAllData,
  clearEverything,
  STORAGE_KEYS,
} from "./storage";

// Helper functions
export {
  generateUUID,
  getCurrentTimestamp,
  parseRows,
  insertWithSync,
  updateWithSync,
  softDeleteWithSync,
  hasLocalChanges,
  getUnsyncedChanges,
  clearSyncQueue,
  getTodayDate,
  calculateDueDate,
  removeSyncQueueItems,
} from "./helpers";

// Schema definitions
export { DB_NAME, DB_VERSION, CREATE_TABLES, CREATE_INDEXES } from "./schema";

// Repositories
export * from "./repositories";

// Migration utilities
export { migrateDatabase, needsMigration } from "./migration";

// Spaced Repetition System
export { onAnswer, getTodaysQueue, checkDailyLimits } from "./spacedRepetition";

// Type definitions
export * from "./types";
