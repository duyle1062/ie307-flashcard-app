/**
 * useCardList Hook
 * Custom hook for managing card list with sorting and filtering
 */

import { useState, useCallback, useMemo } from "react";
import { useCards } from "./useCards";

export type SortType = "due_date" | "created" | "status";

interface UseCardListParams {
  collectionId: string;
}

interface UseCardListReturn {
  // State
  cards: any[];
  displayedCards: any[];
  isLoading: boolean;
  sortType: SortType;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  
  // Actions
  setSortType: (sort: SortType) => void;
  setSearchQuery: (query: string) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refreshCards: () => Promise<void>;
}

const PAGE_SIZE = 30;

export const useCardList = ({
  collectionId,
}: UseCardListParams): UseCardListReturn => {
  const {
    cards,
    isLoading,
    refreshCards: refresh,
  } = useCards({ collectionId });

  const [sortType, setSortType] = useState<SortType>("due_date");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Filter cards by search query
   */
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;

    const query = searchQuery.toLowerCase();
    return cards.filter(
      (card) =>
        card.front.toLowerCase().includes(query) ||
        card.back.toLowerCase().includes(query)
    );
  }, [cards, searchQuery]);

  /**
   * Sort cards
   */
  const sortedCards = useMemo(() => {
    const sorted = [...filteredCards];

    switch (sortType) {
      case "due_date":
        // Sort by due date (assuming cards have due_date or created_at)
        // For now, just sort by id as placeholder
        return sorted.sort((a, b) => a.id.localeCompare(b.id));
      
      case "created":
        // Sort by created date
        return sorted.sort((a, b) => a.id.localeCompare(b.id));
      
      case "status": {
        // Sort by status: new -> learning -> review
        const statusOrder = { new: 1, learning: 2, review: 3 };
        return sorted.sort((a, b) => {
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 999;
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 999;
          return aOrder - bOrder;
        });
      }
      
      default:
        return sorted;
    }
  }, [filteredCards, sortType]);

  /**
   * Calculate pagination
   */
  const totalPages = Math.ceil(sortedCards.length / PAGE_SIZE);

  /**
   * Get displayed cards for current page
   */
  const displayedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return sortedCards.slice(startIndex, endIndex);
  }, [sortedCards, currentPage]);

  /**
   * Navigation actions
   */
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  /**
   * Refresh cards and reset pagination
   */
  const refreshCards = useCallback(async () => {
    await refresh();
    setCurrentPage(1);
  }, [refresh]);

  return {
    // State
    cards: sortedCards,
    displayedCards,
    isLoading,
    sortType,
    searchQuery,
    currentPage,
    totalPages,
    
    // Actions
    setSortType,
    setSearchQuery,
    nextPage,
    prevPage,
    goToPage,
    refreshCards,
  };
};
