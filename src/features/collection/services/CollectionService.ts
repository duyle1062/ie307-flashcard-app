/**
 * CollectionService - Business logic for Collection operations
 * Handles all collection-related database operations
 */

import {
  getCollectionsByUserId,
  getCollectionsWithStats,
  createCollection as createCollectionRepo,
  updateCollection as updateCollectionRepo,
  deleteCollection as deleteCollectionRepo,
  getCollectionById,
} from "../../../core/database/repositories/CollectionRepository";

export interface CollectionData {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_deleted: number;
}

export class CollectionService {
  /**
   * Get all collections for a user
   */
  static async getCollections(userId: string): Promise<any[]> {
    try {
      return await getCollectionsWithStats(userId);
    } catch (error) {
      console.error("CollectionService: Error getting collections:", error);
      throw error;
    }
  }

  /**
   * Create a new collection
   */
  static async createCollection(
    userId: string,
    name: string
  ): Promise<CollectionData | null> {
    try {
      return await createCollectionRepo(userId, name);
    } catch (error) {
      console.error("CollectionService: Error creating collection:", error);
      throw error;
    }
  }

  /**
   * Rename a collection
   */
  static async renameCollection(
    collectionId: string,
    newName: string
  ): Promise<CollectionData | null> {
    try {
      return await updateCollectionRepo(collectionId, newName);
    } catch (error) {
      console.error("CollectionService: Error renaming collection:", error);
      throw error;
    }
  }

  /**
   * Delete a collection (soft delete)
   */
  static async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      return await deleteCollectionRepo(collectionId);
    } catch (error) {
      console.error("CollectionService: Error deleting collection:", error);
      throw error;
    }
  }

  /**
   * Get collection by ID
   */
  static async getCollectionById(
    collectionId: string
  ): Promise<CollectionData | null> {
    try {
      return await getCollectionById(collectionId);
    } catch (error) {
      console.error(
        "CollectionService: Error getting collection by ID:",
        error
      );
      throw error;
    }
  }
}

export default CollectionService;
