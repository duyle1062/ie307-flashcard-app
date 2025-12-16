/**
 * useCollections Hook
 * Custom hook for managing collections list and operations
 */

import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { CollectionService } from "../services/CollectionService";
import { getCardsByStatus } from "../../../core/database/repositories/CardRepository";
import { useSync } from "../../sync/hooks";
import { useAuth } from "../../../shared/context/AuthContext";

export interface Collection {
  id: string;
  title: string;
  new: number;
  learning: number;
  review: number;
}

interface UseCollectionsReturn {
  collections: Collection[];
  isLoading: boolean;
  loadCollections: () => Promise<void>;
  createCollection: (name: string) => Promise<boolean>;
  deleteCollection: (collectionId: string) => Promise<boolean>;
  refreshCollections: () => Promise<void>;
}

export const useCollections = (): UseCollectionsReturn => {
  const { user } = useAuth();
  const { checkAndSyncIfNeeded } = useSync();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load collections from database
   */
  const loadCollections = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const dbCollections = await CollectionService.getCollectionsByUserId(
        user.uid
      );

      // Transform to UI format with actual card counts by status
      const transformedCollections: Collection[] = await Promise.all(
        dbCollections.map(async (col) => {
          // Get cards for each collection and count by status
          const newCards = await getCardsByStatus("new", col.id);
          const learningCards = await getCardsByStatus("learning", col.id);
          const reviewCards = await getCardsByStatus("review", col.id);

          return {
            id: col.id,
            title: col.name,
            new: newCards.length,
            learning: learningCards.length,
            review: reviewCards.length,
          };
        })
      );

      setCollections(transformedCollections);
    } catch (error) {
      console.error("Error loading collections:", error);
      Alert.alert("Error", "Failed to load collections");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Create a new collection
   */
  const createCollection = useCallback(
    async (name: string): Promise<boolean> => {
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return false;
      }

      if (!name.trim()) {
        Alert.alert("Error", "Collection name cannot be empty");
        return false;
      }

      try {
        const newCollection = await CollectionService.createCollection(
          user.uid,
          name.trim()
        );

        if (newCollection) {
          // Add to local state immediately
          const collectionForUI: Collection = {
            id: newCollection.id,
            title: newCollection.name,
            new: 0,
            learning: 0,
            review: 0,
          };
          setCollections((prev) => [collectionForUI, ...prev]);

          // Check if sync is needed
          await checkAndSyncIfNeeded();

          return true;
        } else {
          Alert.alert("Error", "Failed to create collection");
          return false;
        }
      } catch (error) {
        console.error("Error creating collection:", error);
        Alert.alert("Error", "Failed to create collection");
        return false;
      }
    },
    [user, checkAndSyncIfNeeded]
  );

  /**
   * Delete a collection
   */
  const deleteCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      try {
        const success = await CollectionService.deleteCollection(collectionId);

        if (success) {
          // Remove from local state
          setCollections((prev) =>
            prev.filter((col) => col.id !== collectionId)
          );

          // Check if sync is needed
          await checkAndSyncIfNeeded();

          return true;
        } else {
          Alert.alert("Error", "Failed to delete collection");
          return false;
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        Alert.alert("Error", "Failed to delete collection");
        return false;
      }
    },
    [checkAndSyncIfNeeded]
  );

  /**
   * Refresh collections
   */
  const refreshCollections = useCallback(async () => {
    await loadCollections();
  }, [loadCollections]);

  // Load collections on mount and when user changes
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return {
    collections,
    isLoading,
    loadCollections,
    createCollection,
    deleteCollection,
    refreshCollections,
  };
};
