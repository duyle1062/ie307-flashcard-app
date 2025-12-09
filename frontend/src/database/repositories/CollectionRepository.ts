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
      "SELECT * FROM collections WHERE id = ? AND deleted_at IS NULL",
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
      "SELECT * FROM collections WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
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
      is_public: 0,
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
  description?: string,
  isPublic?: boolean
): Promise<Collection | null> => {
  try {
    const updates: Record<string, any> = {
      name,
      description,
    };

    if (isPublic !== undefined) {
      updates.is_public = isPublic ? 1 : 0;
    }

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
        COUNT(CASE WHEN cd.deleted_at IS NULL THEN 1 END) as total_cards,
        COUNT(CASE WHEN cd.status = 'new' AND cd.deleted_at IS NULL THEN 1 END) as new_cards,
        COUNT(CASE WHEN cd.status = 'learning' AND cd.deleted_at IS NULL THEN 1 END) as learning_cards,
        COUNT(CASE WHEN cd.status = 'review' AND cd.deleted_at IS NULL THEN 1 END) as review_cards,
        COUNT(CASE WHEN cd.due_date <= date('now') AND cd.deleted_at IS NULL THEN 1 END) as due_cards
      FROM collections c
      LEFT JOIN cards cd ON c.id = cd.collection_id
      WHERE c.id = ? AND c.deleted_at IS NULL
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
 */
export const getCollectionsWithStats = async (
  userId: string
): Promise<CollectionWithStats[]> => {
  try {
    const result = await executeQuery(
      `SELECT 
        c.*,
        COUNT(CASE WHEN cd.deleted_at IS NULL THEN 1 END) as total_cards,
        COUNT(CASE WHEN cd.status = 'new' AND cd.deleted_at IS NULL THEN 1 END) as new_cards,
        COUNT(CASE WHEN cd.status = 'learning' AND cd.deleted_at IS NULL THEN 1 END) as learning_cards,
        COUNT(CASE WHEN cd.status = 'review' AND cd.deleted_at IS NULL THEN 1 END) as review_cards,
        COUNT(CASE WHEN cd.due_date <= date('now') AND cd.deleted_at IS NULL THEN 1 END) as due_cards
      FROM collections c
      LEFT JOIN cards cd ON c.id = cd.collection_id
      WHERE c.user_id = ? AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [userId]
    );

    const collections: CollectionWithStats[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      collections.push(result.rows.item(i) as CollectionWithStats);
    }
    return collections;
  } catch (error) {
    console.error("Error getting collections with stats:", error);
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
    const existing = await getCollectionById(collectionData.id);

    if (existing) {
      // Update existing collection
      await executeQuery(
        `UPDATE collections SET 
          name = ?, 
          description = ?, 
          is_public = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          collectionData.name ?? existing.name,
          collectionData.description ?? existing.description,
          collectionData.is_public ?? existing.is_public,
          collectionData.updated_at ?? new Date().toISOString(),
          collectionData.id,
        ]
      );
    } else {
      // Insert new collection
      await executeQuery(
        `INSERT INTO collections (
          id, user_id, name, description, is_public,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          collectionData.id,
          collectionData.user_id,
          collectionData.name,
          collectionData.description,
          collectionData.is_public ?? 0,
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
