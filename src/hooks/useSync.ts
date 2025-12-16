/**
 * useSync Hook - React Hook for SyncService
 * ✅ OPTIMIZED: Sync strategy for cost savings
 * - Sync when app opens (initial load)
 * - Sync when app goes to background (save session)
 * - Sync when queue > 20 items (batch threshold)
 * - NO periodic interval sync (saves bandwidth)
 */

import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { syncService, SyncStatus, SyncResult } from "../services/syncService";
import { useAuth } from "../context/AuthContext";
import NetInfo from "@react-native-community/netinfo";
import { seedDatabase } from "../database/seed";

export const useSync = () => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSyncTime: null,
    pendingChanges: 0,
    error: null,
  });

  /**
   * Refresh sync status
   */
  const refreshStatus = useCallback(async () => {
    try {
      const status = await syncService.getStatus();
      setSyncStatus(status);
    } catch (error: any) {
      console.error("Failed to get sync status:", error);
    }
  }, []);

  /**
   * Perform sync
   */
  const performSync = useCallback(async (): Promise<SyncResult | null> => {
    if (!user) {
      console.warn("No user logged in, cannot sync");
      return null;
    }

    try {
      setSyncStatus((prev) => ({ ...prev, isRunning: true }));
      const result = await syncService.sync(user.uid);
      await refreshStatus();
      return result;
    } catch (error: any) {
      console.error("Sync failed:", error);
      return {
        success: false,
        pushedCount: 0,
        pulledCount: 0,
        failedCount: 1,
        errors: [error.message],
      };
    } finally {
      setSyncStatus((prev) => ({ ...prev, isRunning: false }));
    }
  }, [user, refreshStatus]);

  /**
   * Force sync (manual trigger)
   */
  const forceSync = useCallback(async (): Promise<SyncResult | null> => {
    if (!user) {
      console.warn("No user logged in, cannot sync");
      return null;
    }

    try {
      setSyncStatus((prev) => ({ ...prev, isRunning: true }));
      const result = await syncService.forceSync(user.uid);
      await refreshStatus();
      return result;
    } catch (error: any) {
      console.error("Force sync failed:", error);
      return {
        success: false,
        pushedCount: 0,
        pulledCount: 0,
        failedCount: 1,
        errors: [error.message],
      };
    } finally {
      setSyncStatus((prev) => ({ ...prev, isRunning: false }));
    }
  }, [user, refreshStatus]);

  /**
   * Check if should sync based on queue threshold
   * If queue >= 20 items, automatically trigger sync
   * ✅ OPTIMIZED: Only called after mutations (create/update/delete)
   */
  const checkAndSyncIfNeeded = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const shouldSync = await syncService.shouldSync();
      if (shouldSync) {
        console.log("🔔 Queue threshold reached (≥20 items), auto-syncing...");
        await performSync();
      }
    } catch (error) {
      console.error("Error checking sync threshold:", error);
    }
  }, [user, performSync]);

  /**
   * Start optimized sync when user is logged in
   * ✅ Sync on app open (initial load)
   * ✅ Sync on app background (save session)
   * ❌ NO periodic interval (tiết kiệm bandwidth)
   */
  useEffect(() => {
    if (!user) return;

    // Initial sync when app opens
    console.log("🚀 App opened, performing initial sync...");
    performSync().then(() => {
      // Seed database after sync (so user data is available)
      seedDatabase(user.uid).catch((error) => {
        console.error("Failed to seed database:", error);
      });
    });

    // Handle AppState changes (Active <-> Background)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        console.log("📱 App going to background, syncing...");
        performSync();
      } else if (nextAppState === "active") {
        console.log("📱 App became active, refreshing status...");
        refreshStatus();
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Refresh status periodically (chỉ UI, không trigger sync)
    const statusInterval = setInterval(refreshStatus, 30000);

    return () => {
      appStateSubscription.remove();
      clearInterval(statusInterval);
    };
  }, [user, performSync, refreshStatus]);

  /**
   * Sync when network comes back online
   * ✅ OPTIMIZED: Debounce để tránh sync nhiều lần khi network fluctuate
   */
  useEffect(() => {
    if (!user) return;

    let wasOffline = false;
    let syncTimeout: NodeJS.Timeout | null = null;

    const unsubscribe = NetInfo.addEventListener((state) => {
      // Chỉ sync khi network QUAY LẠI (từ offline → online)
      if (state.isConnected && wasOffline) {
        console.log("📶 Network reconnected, syncing in 2s...");

        // Debounce: Đợi 2s trước khi sync (tránh nhiều trigger liên tiếp)
        if (syncTimeout) clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
          performSync();
        }, 2000);
      }

      // Track offline state
      wasOffline = !state.isConnected;
    });

    return () => {
      unsubscribe();
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }, [user, performSync]);

  return {
    syncStatus,
    performSync,
    forceSync,
    refreshStatus,
    checkAndSyncIfNeeded, // Export để dùng sau mutations
  };
};
