/**
 * Database Migration Utility
 * Use this if you need to update the database schema
 */

import { resetDatabase } from "./database";
import { clearAllData } from "./storage";

/**
 * Force reset database and clear all local data
 * WARNING: This will delete all local data!
 * Use only for development or when schema changes
 */
export const migrateDatabase = async (): Promise<void> => {
  console.log("⚠️ Starting database migration...");
  
  try {
    // Clear AsyncStorage
    await clearAllData();
    console.log("✅ AsyncStorage cleared");
    
    // Reset SQLite database
    await resetDatabase();
    console.log("✅ Database reset complete");
    
    console.log("✅ Migration complete! Please restart the app.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

/**
 * Check if database needs migration
 * This is a simple version number check
 */
export const needsMigration = async (): Promise<boolean> => {
  // TODO: Implement version checking logic
  // For now, always return false
  return false;
};
