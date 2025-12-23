/**
 * SyncService - Centralized synchronization service
 * Handles bidirectional sync between SQLite (Local) and Firestore (Cloud)
 * Implements: Idempotency, Conflict Resolution (Last Write Wins), Retry Logic
 */

import { db } from "../../../core/config/firebaseConfig";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { getUnsyncedChanges, removeSyncQueueItems } from "../../../core/database/helpers";
import { executeQuery } from "../../../core/database/database";
import {
  saveLastSyncTimestamp,
  getLastSyncTimestamp,
} from "../../../core/database/storage";
import {
  upsertUser,
  upsertCollection,
  upsertCard,
  upsertReview,
} from "../../../core/database/repositories";
import NetInfo from "@react-native-community/netinfo";
import { toFirestoreData, fromFirestoreData } from "../../../core/utils/mapper"; // Import vào

// Sync configuration
const SYNC_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
  BATCH_SIZE: 500, // Firestore WriteBatch max: 500 operations
  QUEUE_THRESHOLD: 20, // Trigger sync khi queue > 20 items
};

// Sync status
export interface SyncStatus {
  isRunning: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  error: string | null;
}

// Sync result
export interface SyncResult {
  success: boolean;
  pushedCount: number;
  pulledCount: number;
  failedCount: number;
  errors: string[];
}

// Options để điều khiển Sync
export interface SyncOptions {
  push?: boolean; // default: true
  pull?: boolean; // default: true
}

/**
 * Main Sync Service class
 */
class SyncService {
  private isRunning: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Public getter for isRunning
   */
  get isSyncing(): boolean {
    return this.isRunning;
  }

  /**
   * Check network connectivity
   */
  private async hasNetwork(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true;
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    try {
      const lastSyncTime = await getLastSyncTimestamp();
      const unsyncedChanges = await getUnsyncedChanges();

      return {
        isRunning: this.isRunning,
        lastSyncTime,
        pendingChanges: unsyncedChanges.length,
        error: null,
      };
    } catch (error: any) {
      return {
        isRunning: this.isRunning,
        lastSyncTime: null,
        pendingChanges: 0,
        error: error.message,
      };
    }
  }

  /**
   * PUSH: Sync local changes to Firestore
   * ✅ OPTIMIZED: Sử dụng WriteBatch để gom tối đa 500 operations trong 1 request
   * Tiết kiệm bandwidth và tăng tốc độ sync
   */
  private async pushToCloud(userId: string): Promise<{
    pushedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let pushedCount = 0;
    let failedCount = 0;

    try {
      // Get all unsynced changes
      const unsyncedChanges = await getUnsyncedChanges();

      if (unsyncedChanges.length === 0) {
        console.log("✅ No local changes to push");
        return { pushedCount, failedCount, errors };
      }

      console.log(
        `🔄 Pushing ${unsyncedChanges.length} changes via WriteBatch...`
      );

      // Process in batches of 500 (Firestore WriteBatch limit)
      for (let i = 0; i < unsyncedChanges.length; i += SYNC_CONFIG.BATCH_SIZE) {
        const batchItems = unsyncedChanges.slice(i, i + SYNC_CONFIG.BATCH_SIZE);
        const batch = writeBatch(db);
        const successfulIds: string[] = [];

        try {
          // Add all operations to batch
          for (const change of batchItems) {
            const { entity_type, entity_id, operation, data } = change;
            console.log(
              `📤 Syncing: ${entity_type}:${entity_id.substring(
                0,
                8
              )}... Operation: ${operation}`
            );
            const parsedData = data ? JSON.parse(data) : {};

            const collectionName = this.getFirestoreCollection(entity_type);
            if (!collectionName) {
              errors.push(`Unknown entity type: ${entity_type}`);
              failedCount++;
              continue;
            }

            const docRef = doc(db, collectionName, entity_id);

            switch (operation) {
              case "INSERT":
              case "UPDATE": {
                const parsedData = data ? JSON.parse(data) : {};

                const updateData = {
                  ...toFirestoreData(entity_type, parsedData),
                  updated_at: serverTimestamp(),
                };

                batch.set(docRef, updateData, { merge: true });
                successfulIds.push(change.id);
                break;
              }

              case "DELETE": {
                // Soft delete - use is_deleted flag (new schema)
                // ⚠️ IMPORTANT: Include parsedData (contains collection_id for cards)
                const deleteData: Record<string, unknown> = {
                  ...toFirestoreData(entity_type, parsedData),
                  is_deleted: 1,
                  updated_at: serverTimestamp(),
                };

                batch.set(docRef, deleteData, { merge: true });
                successfulIds.push(change.id);
                break;
              }

              default:
                errors.push(`Unknown operation: ${operation}`);
                failedCount++;
            }
          }

          const syncStateRef = doc(db, "sync_state", userId);
          batch.set(
            syncStateRef,
            { 
              last_modified: serverTimestamp(),
              updated_by_device_id: "current_device_id" // (Optional) Để debug
            }, 
            { merge: true }
          );

          // Commit entire batch in one network request
          await batch.commit();

          // Remove successfully synced items from queue
          if (successfulIds.length > 0) {
            await removeSyncQueueItems(successfulIds);
          }

          pushedCount += successfulIds.length;
          console.log(
            `✅ Batch ${Math.floor(i / SYNC_CONFIG.BATCH_SIZE) + 1} pushed: ${
              successfulIds.length
            } items`
          );
        } catch (error: any) {
          console.error(`❌ Batch failed:`, error);
          errors.push(`Batch failed: ${error.message}`);
          failedCount += batchItems.length;
          // Items không được mark as synced -> sẽ retry lần sau
        }

        // Small delay between batches
        if (i + SYNC_CONFIG.BATCH_SIZE < unsyncedChanges.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(
        `✅ Push complete: ${pushedCount} synced, ${failedCount} failed`
      );
    } catch (error: any) {
      console.error("❌ Push to cloud failed:", error);
      errors.push(`Push failed: ${error.message}`);
    }

    return { pushedCount, failedCount, errors };
  }

  /**
   * PULL: Sync Firestore changes to local SQLite
   * ✅ OPTIMIZED: Delta Sync - Chỉ query updated_at > last_sync_timestamp
   * Tiết kiệm Firestore Reads (chỉ đọc dữ liệu thay đổi, không đọc toàn bộ)
   */
  private async pullFromCloud(userId: string): Promise<{
    pulledCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let pulledCount = 0;
    let failedCount = 0;

    try {
      // Get last sync timestamp
      const lastSyncTime = await getLastSyncTimestamp();
      const lastSyncDate = lastSyncTime ? new Date(lastSyncTime) : new Date(0); // Epoch if first sync

      console.log(
        `🔄 [DELTA SYNC] Pulling changes since: ${lastSyncDate.toISOString()}`
      );

      // MASTER CHECK: Kiểm tra sync_state để quyết định có nên pull không
      try {
        const syncStateRef = doc(db, "sync_state", userId);
        const syncStateSnap = await getDoc(syncStateRef);

        if (syncStateSnap.exists()) {
          const syncData = syncStateSnap.data();
          // Chuyển Firestore Timestamp sang Milliseconds
          const cloudLastModified = syncData.last_modified 
            ? (syncData.last_modified as Timestamp).toMillis() 
            : 0;

          // SO SÁNH: Nếu Cloud <= Local (nghĩa là không có gì mới)
          // Lưu ý: Thêm buffer 1-2 giây để tránh lệch đồng hồ mạng
          if (cloudLastModified <= (lastSyncTime || 0)) {
             console.log("✅ [MASTER CHECK] Cloud is not newer. Skipping Pull.");
             console.log(`   Cloud: ${new Date(cloudLastModified).toISOString()}`);
             console.log(`   Local: ${lastSyncDate.toISOString()}`);
             
             // RETURN SỚM - Tiết kiệm 4 Reads tại đây!
             return { pulledCount: 0, failedCount: 0, errors: [] };
          }
          
          console.log("🚀 [MASTER CHECK] Found updates on Cloud. Proceeding to pull...");
        } else {
          console.log("⚠️ [MASTER CHECK] No sync_state doc found. Proceeding to full pull (first time?)");
        }
      } catch (checkError) {
        console.warn("⚠️ [MASTER CHECK] Failed to check sync_state, proceeding anyway:", checkError);
      }

      // --- NẾU CODE CHẠY ĐẾN ĐÂY NGHĨA LÀ CÓ DỮ LIỆU MỚI ---

      // Pull changes from each collection
      const collections = ["users", "collections", "cards", "reviews"];

      for (const collectionName of collections) {
        try {
          const count = await this.pullCollection(
            collectionName,
            userId,
            lastSyncDate
          );
          pulledCount += count;
        } catch (error: any) {
          console.error(`❌ Failed to pull ${collectionName}:`, error);
          errors.push(`${collectionName}: ${error.message}`);
          failedCount++;
        }
      }

      // Update last sync timestamp ONLY if pull succeeded
      if (failedCount === 0) {
        await saveLastSyncTimestamp(Date.now());
      }

      console.log(
        `✅ Pull complete: ${pulledCount} records synced, ${failedCount} failed`
      );
    } catch (error: any) {
      console.error("❌ Pull from cloud failed:", error);
      errors.push(`Pull failed: ${error.message}`);
    }

    return { pulledCount, failedCount, errors };
  }

  /**
   * Pull a specific collection from Firestore
   * Implements Last Write Wins conflict resolution
   */
  private async pullCollection(
    collectionName: string,
    userId: string,
    lastSyncDate: Date
  ): Promise<number> {
    try {
      const collectionRef = collection(db, collectionName);
      let syncQueryDate = lastSyncDate;

      // Chỉ áp dụng cho bảng reviews VÀ khi sync lần đầu (lastSyncDate = 0)
      if (collectionName === "reviews" && lastSyncDate.getTime() === 0) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // Ép buộc chỉ lấy dữ liệu từ 3 tháng trở lại đây
        syncQueryDate = threeMonthsAgo;
        console.log(`❄️ [COLD STORAGE] Reviews: Only syncing data from ${syncQueryDate.toISOString()}`);
      }
      
      // Chuyển đổi sang Firestore Timestamp để query
      const syncTimestamp = Timestamp.fromDate(syncQueryDate);

      if (collectionName === "users") {
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            // Mapper thủ công
            const rawData = fromFirestoreData(collectionName, userSnap.id, userSnap.data());
            const firestoreData = this.convertFirestoreData(rawData);

            // Manual Check updated_at
            const cloudUpdateTime = new Date(firestoreData.updated_at).getTime();
            if (cloudUpdateTime > syncQueryDate.getTime()) {
                await this.resolveConflictAndUpsert(collectionName, firestoreData);
                return 1;
            }
        }
        return 0;
      }

      // CASE 2: CÁC COLLECTION KHÁC (Dùng Query bình thường)
      // ✅ PERFECT ARCHITECTURE: Tất cả collections đều có user_id
      // Query đơn giản, nhất quán, và hiệu quả
      const q = query(
        collectionRef,
        where("user_id", "==", userId),
        where("updated_at", ">", syncTimestamp)
      );

      const querySnapshot = await getDocs(q);
      let count = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const rawData = fromFirestoreData(collectionName, docSnapshot.id, docSnapshot.data());
        
        // Convert timestamp
        const firestoreData = this.convertFirestoreData(rawData);

        // Xử lý conflict và lưu xuống SQLite
        await this.resolveConflictAndUpsert(collectionName, firestoreData);
        count++;
      }

      if (count > 0) {
        console.log(`✅ Pulled ${count} records from ${collectionName}`);
      }

      return count;
    } catch (error: any) {
      // Handle permission errors gracefully for cards
      // This can happen when cards collection is empty or rules can't be evaluated
      if (error.code === "permission-denied" && collectionName === "cards") {
        console.log(
          `⏭️  Skipping ${collectionName} pull (no cards available or permission issue)`
        );
        return 0;
      }

      console.error(`❌ Failed to pull ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Convert Firestore Timestamp objects to ISO strings
   */
  private convertFirestoreData(data: any): any {
    const converted: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Timestamp) {
        converted[key] = value.toDate().toISOString();
      } else if (value && typeof value === "object" && "seconds" in value) {
        // Handle Timestamp-like objects
        const timestampValue = value as { seconds: number };
        converted[key] = new Date(timestampValue.seconds * 1000).toISOString();
      } else {
        converted[key] = value;
      }
    }

    return converted;
  }

  /**
   * Resolve conflict using Last Write Wins and upsert to local DB
   */
  private async resolveConflictAndUpsert(
    collectionName: string,
    cloudData: any
  ): Promise<void> {
    try {
      // Get local data (including soft-deleted records)
      const localData = await this.getLocalRecord(collectionName, cloudData.id);

      // If no local data, just insert
      if (!localData) {
        await this.upsertToLocal(collectionName, cloudData);
        return;
      }

      // Conflict Resolution: Compare timestamps (Last Write Wins)
      const cloudUpdatedAt = new Date(cloudData.updated_at).getTime();
      const localUpdatedAt = new Date(localData.updated_at as string).getTime();

      if (cloudUpdatedAt >= localUpdatedAt) {
        // Cloud version is newer or same -> Accept cloud version
        // This includes accepting is_deleted = 1 from cloud
        console.log(
          `🔄 Accepting cloud version for ${collectionName}:${cloudData.id}`
        );
        await this.upsertToLocal(collectionName, cloudData);
      } else {
        // Local version is newer -> Keep local, it will be pushed later
        // This includes keeping local is_deleted = 1
        console.log(
          `⏭️  Keeping local version for ${collectionName}:${cloudData.id}`
        );
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to resolve conflict for ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get local record by ID
   */
  private async getLocalRecord(
    collectionName: string,
    recordId: string
  ): Promise<Record<string, unknown> | null> {
    try {
      const tableName = this.getSQLiteTable(collectionName);
      const result = await executeQuery(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [recordId]
      );

      return result.rows.length > 0 ? result.rows.item(0) : null;
    } catch (error) {
      console.error(`❌ Failed to get local record:`, error);
      return null;
    }
  }

  /**
   * Upsert data to local SQLite using repository functions
   */
  private async upsertToLocal(
    collectionName: string,
    data: any
  ): Promise<void> {
    try {
      switch (collectionName) {
        case "users":
          await upsertUser(data);
          break;
        case "collections":
          await upsertCollection(data);
          break;
        case "cards":
          await upsertCard(data);
          break;
        case "reviews":
          await upsertReview(data);
          break;
        default:
          console.warn(`⚠️ Unknown collection: ${collectionName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to upsert to local ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Map entity type to Firestore collection name
   */
  private getFirestoreCollection(entityType: string): string | null {
    const mapping: Record<string, string> = {
      users: "users",
      collections: "collections",
      cards: "cards",
      reviews: "reviews",
    };

    return mapping[entityType] || null;
  }

  /**
   * Map Firestore collection to SQLite table name
   */
  private getSQLiteTable(collectionName: string): string {
    // In this case, they're the same
    return collectionName;
  }

  /**
   * Full bidirectional sync with options
   * @param options.push Default true
   * @param options.pull Default true
   */
  async sync(userId: string, options: SyncOptions = { push: true, pull: true }): Promise<SyncResult> {
    // Prevent concurrent sync
    if (this.isRunning) {
      console.log("⚠️ Sync already running, skipping...");
      return { success: false, pushedCount: 0, pulledCount: 0, failedCount: 0, errors: ["Sync busy"] };
    }
    this.isRunning = true;

    // Check network
    const hasNetwork = await this.hasNetwork();
    if (!hasNetwork) {
      this.isRunning = false;
      return { success: false, pushedCount: 0, pulledCount: 0, failedCount: 0, errors: ["No network"] };
    }

    const allErrors: string[] = [];
    let pushResult = { pushedCount: 0, failedCount: 0, errors: [] as string[] };
    let pullResult = { pulledCount: 0, failedCount: 0, errors: [] as string[] };

    try {
      console.log(`🔄 Starting sync (Push: ${options.push}, Pull: ${options.pull})...`);

      // ✅ Step 1: PUSH (Chỉ chạy khi options.push = true)
      // Push nên được ưu tiên chạy để bảo toàn dữ liệu người dùng vừa nhập
      if (options.push !== false) {
        pushResult = await this.pushToCloud(userId);
        allErrors.push(...pushResult.errors);
      }

      // ✅ Step 2: PULL (Chỉ chạy khi options.pull = true)
      // Pull có thể "lười" (lazy), không cần chạy liên tục
      if (options.pull !== false) {
         pullResult = await this.pullFromCloud(userId); // Hàm này đã có Master Check ở bài trước
         allErrors.push(...pullResult.errors);
      }

      const result: SyncResult = {
        success: allErrors.length === 0,
        pushedCount: pushResult.pushedCount,
        pulledCount: pullResult.pulledCount,
        failedCount: pushResult.failedCount + pullResult.failedCount,
        errors: allErrors,
      };

      console.log("✅ Sync complete:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Sync failed:", error);
      return { success: false, pushedCount: 0, pulledCount: 0, failedCount: 1, errors: [error.message] };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start automatic background sync (every X minutes)
   */
  startAutoSync(userId: string, intervalMinutes: number = 30): void {
    if (this.syncInterval) {
      return;
    }

    console.log(`🔄 Starting auto-sync every ${intervalMinutes} minutes`);

    this.syncInterval = setInterval(async () => {
      try {
        // Auto sync định kỳ thì nên Pull về để cập nhật
        // Push cũng cần thiết để đảm bảo data an toàn
        await this.sync(userId, { push: true, pull: true });
      } catch (error) {
        console.error("❌ Auto-sync failed:", error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop automatic background sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log("🔄 Auto-sync stopped");
    }
  }

  /**
   * Check if should trigger sync based on queue size
   * ✅ OPTIMIZED: Chỉ sync khi queue > threshold để gom batch lớn
   */
  async shouldSync(): Promise<boolean> {
    try {
      const unsyncedChanges = await getUnsyncedChanges();
      return unsyncedChanges.length >= SYNC_CONFIG.QUEUE_THRESHOLD;
    } catch (error) {
      console.error("Failed to check sync threshold:", error);
      return false;
    }
  }

  /**
   * Force sync (for manual trigger by user)
   */
  async forceSync(userId: string): Promise<SyncResult> {
    console.log("🔄 Force sync triggered by user");
    return await this.sync(userId);
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Convenience exports
export const { sync, getStatus, startAutoSync, stopAutoSync, forceSync } =
  syncService;
