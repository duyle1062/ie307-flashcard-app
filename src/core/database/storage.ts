import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys, User } from "./types";

/**
 * AsyncStorage utility functions for sync metadata and user data
 */

export const STORAGE_KEYS: StorageKeys = {
  LAST_SYNC_TIMESTAMP: "@flashcard_last_sync_timestamp",
  USER_ID: "@flashcard_user_id",
  AUTH_TOKEN: "@flashcard_auth_token",
  USER_DATA: "@flashcard_user_data",
};

/**
 * Save last sync timestamp
 */
export const saveLastSyncTimestamp = async (
  timestamp: number
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SYNC_TIMESTAMP,
      timestamp.toString()
    );
  } catch (error) {
    console.error("Error saving last sync timestamp:", error);
    throw error;
  }
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTimestamp = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP);
    return value ? parseInt(value, 10) : null;
  } catch (error) {
    console.error("Error getting last sync timestamp:", error);
    return null;
  }
};

/**
 * Save current user ID
 */
export const saveCurrentUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  } catch (error) {
    console.error("Error saving user ID:", error);
    throw error;
  }
};

/**
 * Get current user ID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Save auth token
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error("Error saving auth token:", error);
    throw error;
  }
};

/**
 * Get auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Firebase Auth token persistence (offline login)
 */
export const saveFirebaseAuthToken = saveAuthToken;
export const getFirebaseAuthToken = getAuthToken;

export const clearFirebaseAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    console.log("✅ Firebase auth token cleared");
  } catch (error) {
    console.error("Error clearing Firebase auth token:", error);
    throw error;
  }
};

/**
 * Save user data
 */
export const saveUserData = async (userData: Partial<User>): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(userData)
    );
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

/**
 * Get user data
 */
export const getUserData = async (): Promise<Partial<User> | null> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Check if this is the first app launch
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem("@flashcard_first_launch");
    return value === null;
  } catch (error) {
    console.error("Error checking first launch:", error);
    return false;
  }
};

/**
 * Mark app as launched
 */
export const setAppLaunched = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem("@flashcard_first_launch", "false");
  } catch (error) {
    console.error("Error setting app launched:", error);
    throw error;
  }
};

/**
 * Clear all data (logout)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LAST_SYNC_TIMESTAMP,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error("Error clearing all data:", error);
    throw error;
  }
};

/**
 * Clear everything including first launch flag
 */
export const clearEverything = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing everything:", error);
    throw error;
  }
};
