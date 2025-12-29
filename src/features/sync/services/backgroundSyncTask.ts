/**
 * Background Sync Task
 * Registers and manages background sync using expo-background-task
 * Runs even when app is closed/terminated
 */

import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { syncService } from "./syncService";
import { getCurrentUserId } from "../../../core/database/storage";

const BACKGROUND_SYNC_TASK = "background-sync-task";

/**
 * Define the background task
 * This will be called by the OS when the app is in background
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log("🔄 Background sync task started");

    // Get current user ID from storage
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log("⚠️ No user logged in, skipping background sync");
      return BackgroundTask.BackgroundTaskResult.NoData;
    }

    // Perform sync (push only to save bandwidth)
    const result = await syncService.sync(userId, { push: true, pull: false });

    if (result?.success) {
      console.log(
        `✅ Background sync completed: pushed ${result.pushedCount} items`
      );
      return BackgroundTask.BackgroundTaskResult.NewData;
    } else {
      console.log("❌ Background sync failed");
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  } catch (error) {
    console.error("Background sync error:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Register background sync task
 * Call this once when user logs in
 */
export const registerBackgroundSync = async (): Promise<void> => {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_SYNC_TASK
    );

    if (isRegistered) {
      console.log("✅ Background sync task already registered");
      return;
    }

    // Register the task with minimum interval (15 minutes on iOS, varies on Android)
    await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes in seconds
      stopOnTerminate: false, // Continue even if app is killed
      startOnBoot: true, // Start on device boot
    });

    console.log("✅ Background sync task registered successfully");
  } catch (error) {
    console.error("Failed to register background sync task:", error);
  }
};

/**
 * Unregister background sync task
 * Call this when user logs out
 */
export const unregisterBackgroundSync = async (): Promise<void> => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_SYNC_TASK
    );

    if (isRegistered) {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      console.log("✅ Background sync task unregistered");
    }
  } catch (error) {
    console.error("Failed to unregister background sync task:", error);
  }
};

/**
 * Check background sync status
 */
export const getBackgroundSyncStatus = async (): Promise<{
  isRegistered: boolean;
  status?: BackgroundTask.BackgroundTaskStatus;
}> => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_SYNC_TASK
    );
    const fetchStatus = await BackgroundTask.getStatusAsync();

    return {
      isRegistered,
      status: fetchStatus !== null ? fetchStatus : undefined,
    };
  } catch (error) {
    console.error("Failed to get background sync status:", error);
    return { isRegistered: false };
  }
};
