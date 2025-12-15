/**
 * useStudy Hook
 * Custom hook for managing study session logic and state
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { getCardsByCollectionId } from "../../../core/database/repositories/CardRepository";
import { Card } from "../../../shared/types";

export interface StudyCard {
  id: string;
  frontText: string;
  backText: string;
  type: "new" | "learning" | "review";
}

export interface StudyCounts {
  new: number;
  learning: number;
  review: number;
}

interface StudyHistory {
  index: number;
  counts: StudyCounts;
}

interface UseStudyParams {
  collectionId: string;
}

interface UseStudyReturn {
  // State
  cards: StudyCard[];
  currentCard: StudyCard | undefined;
  currentIndex: number;
  isFlipped: boolean;
  counts: StudyCounts;
  isLoading: boolean;
  canUndo: boolean;
  
  // Actions
  handleFlip: () => void;
  handleRate: (difficulty: "again" | "hard" | "good" | "easy") => void;
  handleUndo: () => void;
  refreshCards: () => Promise<void>;
}

export const useStudy = ({ collectionId }: UseStudyParams): UseStudyReturn => {
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [counts, setCounts] = useState<StudyCounts>({
    new: 0,
    learning: 0,
    review: 0,
  });
  const [history, setHistory] = useState<StudyHistory[]>([]);

  /**
   * Transform Card from DB to StudyCard format
   */
  const transformCard = (card: Card): StudyCard => ({
    id: card.id,
    frontText: card.front,
    backText: card.back,
    type: card.status as "new" | "learning" | "review",
  });

  /**
   * Calculate counts from cards
   */
  const calculateCounts = (cardList: StudyCard[]): StudyCounts => {
    return cardList.reduce(
      (acc, card) => {
        if (card.type === "new") acc.new++;
        else if (card.type === "learning") acc.learning++;
        else if (card.type === "review") acc.review++;
        return acc;
      },
      { new: 0, learning: 0, review: 0 }
    );
  };

  /**
   * Load cards from database
   */
  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const dbCards = await getCardsByCollectionId(collectionId);
      const studyCards = dbCards.map(transformCard);
      
      setCards(studyCards);
      setCounts(calculateCounts(studyCards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setHistory([]);
    } catch (error) {
      console.error("Error loading cards:", error);
      Alert.alert("Error", "Failed to load cards");
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  /**
   * Get current card
   */
  const currentCard = cards[currentIndex] || undefined;

  /**
   * Check if can undo
   */
  const canUndo = history.length > 0;

  /**
   * Handle flip card
   */
  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  /**
   * Handle rate card and move to next
   */
  const handleRate = useCallback(
    (difficulty: "again" | "hard" | "good" | "easy") => {
      if (!currentCard) return;

      // Save current state to history
      setHistory((prev) => [
        ...prev,
        { index: currentIndex, counts: { ...counts } },
      ]);

      // Update counts based on current card type and difficulty
      setCounts((prev) => {
        const newCounts = { ...prev };
        
        // Decrease count for current card type
        if (currentCard.type === "new" && newCounts.new > 0) {
          newCounts.new--;
        } else if (currentCard.type === "learning" && newCounts.learning > 0) {
          newCounts.learning--;
        } else if (currentCard.type === "review" && newCounts.review > 0) {
          newCounts.review--;
        }

        // If rated "again", add to learning
        if (difficulty === "again") {
          newCounts.learning++;
        }

        return newCounts;
      });

      // Move to next card
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentCard, currentIndex, counts]
  );

  /**
   * Handle undo last action
   */
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const lastState = history[history.length - 1];
    setCurrentIndex(lastState.index);
    setCounts(lastState.counts);
    setIsFlipped(false);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  /**
   * Refresh cards
   */
  const refreshCards = useCallback(async () => {
    await loadCards();
  }, [loadCards]);

  return {
    // State
    cards,
    currentCard,
    currentIndex,
    isFlipped,
    counts,
    isLoading,
    canUndo,
    
    // Actions
    handleFlip,
    handleRate,
    handleUndo,
    refreshCards,
  };
};
