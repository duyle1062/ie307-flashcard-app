/**
 * useCards Hook
 * Custom hook for managing cards in a collection
 */

import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { CardService } from "../services/CardService";
import { useSync } from "../../sync/hooks";
import { Card } from "../../../shared/types";

interface UseCardsParams {
  collectionId: string | null;
}

interface UseCardsReturn {
  cards: Card[];
  isLoading: boolean;
  isUpdating: boolean;
  loadCards: () => Promise<void>;
  createCard: (front: string, back: string) => Promise<boolean>;
  updateCard: (
    cardId: string,
    front: string,
    back: string
  ) => Promise<boolean>;
  deleteCard: (cardId: string) => Promise<boolean>;
  refreshCards: () => Promise<void>;
}

export const useCards = ({
  collectionId,
}: UseCardsParams): UseCardsReturn => {
  const { checkAndSyncIfNeeded } = useSync();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Load cards from database
   */
  const loadCards = useCallback(async () => {
    if (!collectionId) {
      setCards([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const dbCards = await CardService.getCardsByCollectionId(collectionId);
      setCards(dbCards);
    } catch (error) {
      console.error("Error loading cards:", error);
      Alert.alert("Error", "Failed to load cards");
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  /**
   * Create a new card
   */
  const createCard = useCallback(
    async (front: string, back: string): Promise<boolean> => {
      if (!collectionId) {
        Alert.alert("Error", "No collection selected");
        return false;
      }

      if (!front.trim() || !back.trim()) {
        Alert.alert("Error", "Card front and back cannot be empty");
        return false;
      }

      try {
        setIsUpdating(true);
        const newCard = await CardService.createCard(
          collectionId,
          front.trim(),
          back.trim()
        );

        if (newCard) {
          // Add to local state immediately
          setCards((prev) => [newCard, ...prev]);

          // Check if sync is needed
          await checkAndSyncIfNeeded();

          return true;
        } else {
          Alert.alert("Error", "Failed to create card");
          return false;
        }
      } catch (error) {
        console.error("Error creating card:", error);
        Alert.alert("Error", "Failed to create card");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [collectionId, checkAndSyncIfNeeded]
  );

  /**
   * Update a card
   */
  const updateCard = useCallback(
    async (
      cardId: string,
      front: string,
      back: string
    ): Promise<boolean> => {
      if (!front.trim() || !back.trim()) {
        Alert.alert("Error", "Card front and back cannot be empty");
        return false;
      }

      try {
        setIsUpdating(true);
        const updatedCard = await CardService.updateCard(
          cardId,
          front.trim(),
          back.trim()
        );

        if (updatedCard) {
          // Update local state
          setCards((prev) =>
            prev.map((card) =>
              card.id === cardId
                ? { ...card, front: updatedCard.front, back: updatedCard.back }
                : card
            )
          );

          // Check if sync is needed
          await checkAndSyncIfNeeded();

          return true;
        } else {
          Alert.alert("Error", "Failed to update card");
          return false;
        }
      } catch (error) {
        console.error("Error updating card:", error);
        Alert.alert("Error", "Failed to update card");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [checkAndSyncIfNeeded]
  );

  /**
   * Delete a card
   */
  const deleteCard = useCallback(
    async (cardId: string): Promise<boolean> => {
      try {
        setIsUpdating(true);
        const success = await CardService.deleteCard(cardId);

        if (success) {
          // Remove from local state
          setCards((prev) => prev.filter((card) => card.id !== cardId));

          // Check if sync is needed
          await checkAndSyncIfNeeded();

          return true;
        } else {
          Alert.alert("Error", "Failed to delete card");
          return false;
        }
      } catch (error) {
        console.error("Error deleting card:", error);
        Alert.alert("Error", "Failed to delete card");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [checkAndSyncIfNeeded]
  );

  /**
   * Refresh cards
   */
  const refreshCards = useCallback(async () => {
    await loadCards();
  }, [loadCards]);

  // Load cards when collectionId changes
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return {
    cards,
    isLoading,
    isUpdating,
    loadCards,
    createCard,
    updateCard,
    deleteCard,
    refreshCards,
  };
};
