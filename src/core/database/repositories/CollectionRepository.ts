import { executeQuery } from "../database";
import {
  insertWithSync,
  updateWithSync,
  softDeleteWithSync,
  generateUUID,
} from "../helpers";
import { Collection, CollectionWithStats } from "../types";

/**
 * CollectionRepository - Handles all collection-related database operations
 */

/**
 * Get collection by ID
 */
export const getCollectionById = async (
  collectionId: string
): Promise<Collection | null> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM collections WHERE id = ? AND is_deleted = 0",
      [collectionId]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0) as Collection;
    }
    return null;
  } catch (error) {
    console.error("Error getting collection by id:", error);
    throw error;
  }
};

/**
 * Get all collections for a user
 */
export const getCollectionsByUserId = async (
  userId: string
): Promise<Collection[]> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM collections WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC",
      [userId]
    );

    const collections: Collection[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      collections.push(result.rows.item(i) as Collection);
    }
    return collections;
  } catch (error) {
    console.error("Error getting collections by user id:", error);
    throw error;
  }
};

/**
 * Create a new collection
 */
export const createCollection = async (
  userId: string,
  name: string,
  description?: string
): Promise<Collection | null> => {
  try {
    const id = generateUUID();

    await insertWithSync("collections", {
      id,
      user_id: userId,
      name,
      description,
      is_deleted: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return await getCollectionById(id);
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
};

/**
 * Update a collection
 */
export const updateCollection = async (
  collectionId: string,
  name: string,
  description?: string
): Promise<Collection | null> => {
  try {
    const updates: Record<string, any> = {
      name,
      description,
    };

    await updateWithSync(
      "collections",
      collectionId,
      updates,
      Object.keys(updates)
    );

    return await getCollectionById(collectionId);
  } catch (error) {
    console.error("Error updating collection:", error);
    throw error;
  }
};

/**
 * Delete a collection (soft delete)
 */
export const deleteCollection = async (
  collectionId: string
): Promise<boolean> => {
  try {
    await softDeleteWithSync("collections", collectionId);
    return true;
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
};

/**
 * Get collection with card count
 */
export const getCollectionWithStats = async (
  collectionId: string
): Promise<CollectionWithStats | null> => {
  try {
    const result = await executeQuery(
      `SELECT 
        c.*,
        COUNT(CASE WHEN cd.is_deleted = 0 THEN 1 END) as total_cards,
        COUNT(CASE WHEN cd.status = 'new' AND cd.is_deleted = 0 THEN 1 END) as new_cards,
        COUNT(CASE WHEN cd.status = 'learning' AND cd.is_deleted = 0 THEN 1 END) as learning_cards,
        COUNT(CASE WHEN cd.status = 'review' AND cd.is_deleted = 0 THEN 1 END) as review_cards,
        COUNT(CASE WHEN cd.due_date <= date('now') AND cd.is_deleted = 0 THEN 1 END) as due_cards
      FROM collections c
      LEFT JOIN cards cd ON c.id = cd.collection_id
      WHERE c.id = ? AND c.is_deleted = 0
      GROUP BY c.id`,
      [collectionId]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0) as CollectionWithStats;
    }
    return null;
  } catch (error) {
    console.error("Error getting collection with stats:", error);
    throw error;
  }
};

/**
 * Get all collections with stats for a user
 *
 * ⚠️ CRITICAL: Logic theo chuẩn Anki - PER COLLECTION LIMITS
 * - NEW: Giới hạn 25 cards/ngày PER COLLECTION
 * - REVIEW: Giới hạn 50 cards/ngày PER COLLECTION
 * - LEARNING: KHÔNG GIỚI HẠN (vì là kết quả của việc học New/Review)
 *
 * Home screen hiển thị:
 * - New: Remaining quota của TỪNG collection
 * - Learning: TẤT CẢ due cards (không giới hạn)
 * - Review: Remaining quota của TỪNG collection
 */
export const getCollectionsWithStats = async (
  userId: string
): Promise<any[]> => {
  try {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    // 1. Lấy user settings (daily limits)
    const userRes = await executeQuery(
      "SELECT daily_new_cards_limit, daily_review_cards_limit FROM users WHERE id = ?",
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new Error("User not found");
    }

    const settings = userRes.rows.item(0);
    const limitNew = settings.daily_new_cards_limit || 25;
    const limitReview = settings.daily_review_cards_limit || 50;

    // 2. Query collections với stats
    const query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM cards WHERE collection_id = c.id AND status = 'new' AND is_deleted = 0) as count_new,
        (SELECT COUNT(*) FROM cards WHERE collection_id = c.id AND status = 'learning' AND due_date <= ? AND is_deleted = 0) as count_learning,
        (SELECT COUNT(*) FROM cards WHERE collection_id = c.id AND status = 'review' AND due_date <= ? AND is_deleted = 0) as count_review
      FROM collections c
      WHERE c.user_id = ? AND c.is_deleted = 0
      ORDER BY c.created_at DESC
    `;

    const result = await executeQuery(query, [now, now, userId]);

    // 3. Đếm số cards ĐÃ HỌC hôm nay cho TỪNG collection
    const collections = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const collectionId = item.id;

      // Đếm new cards đã học trong collection này
      const countNewDoneRes = await executeQuery(
        `SELECT COUNT(DISTINCT card_id) as count 
         FROM reviews r
         INNER JOIN cards c ON r.card_id = c.id
         WHERE r.user_id = ? 
         AND c.collection_id = ?
         AND DATE(r.reviewed_at) = ?
         AND r.old_interval = 0
         AND c.is_deleted = 0`,
        [userId, collectionId, today]
      );

      // Đếm review cards đã học trong collection này
      const countReviewDoneRes = await executeQuery(
        `SELECT COUNT(DISTINCT card_id) as count 
         FROM reviews r
         INNER JOIN cards c ON r.card_id = c.id
         WHERE r.user_id = ? 
         AND c.collection_id = ?
         AND DATE(r.reviewed_at) = ?
         AND r.old_interval >= 1
         AND c.is_deleted = 0`,
        [userId, collectionId, today]
      );

      const countNewDone = countNewDoneRes.rows.item(0).count || 0;
      const countReviewDone = countReviewDoneRes.rows.item(0).count || 0;

      // Tính remaining quota cho collection này
      const remainingNew = Math.max(0, limitNew - countNewDone);
      const remainingReview = Math.max(0, limitReview - countReviewDone);

      // NEW: Hiển thị số lượng available (giới hạn bởi quota)
      const collectionNew = item.count_new || 0;
      const displayNew = Math.min(collectionNew, remainingNew);

      // LEARNING: Hiển thị TẤT CẢ (không giới hạn)
      const displayLearning = item.count_learning || 0;

      // REVIEW: Hiển thị số lượng available (giới hạn bởi quota)
      const collectionReview = item.count_review || 0;
      const displayReview = Math.min(collectionReview, remainingReview);

      collections.push({
        ...item,
        title: item.name,
        new: displayNew,
        learning: displayLearning,
        review: displayReview,
      });
    }

    return collections;
  } catch (error) {
    console.error("Error fetching collections with stats:", error);
    throw error;
  }
};

/**
 * Create or update collection (used for sync from server)
 */
export const upsertCollection = async (
  collectionData: Partial<Collection> & { id: string }
): Promise<Collection | null> => {
  try {
    // Check if collection exists (including soft-deleted ones)
    const existingCheck = await executeQuery(
      "SELECT id FROM collections WHERE id = ?",
      [collectionData.id]
    );

    if (existingCheck.rows.length > 0) {
      // Update existing collection (including soft-deleted ones)
      await executeQuery(
        `UPDATE collections SET 
          name = ?, 
          description = ?,
          is_deleted = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          collectionData.name,
          collectionData.description,
          collectionData.is_deleted ?? 0,
          collectionData.updated_at ?? new Date().toISOString(),
          collectionData.id,
        ]
      );
    } else {
      // Insert new collection
      await executeQuery(
        `INSERT INTO collections (
          id, user_id, name, description, is_deleted,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          collectionData.id,
          collectionData.user_id,
          collectionData.name,
          collectionData.description,
          collectionData.is_deleted ?? 0,
          collectionData.created_at ?? new Date().toISOString(),
          collectionData.updated_at ?? new Date().toISOString(),
        ]
      );
    }

    return await getCollectionById(collectionData.id);
  } catch (error) {
    console.error("Error upserting collection:", error);
    throw error;
  }
};
