/**
 * CardService - Business logic for Card operations
 * Handles all card-related database operations
 */

import {
  getCardsByCollectionId,
  createCard as createCardRepo,
  updateCard as updateCardRepo,
  deleteCard as deleteCardRepo,
  getCardById,
} from "../../../core/database/repositories/CardRepository";
import { Card } from "../../../shared/types";

export type CardData = Card;

export class CardService {
  /**
   * Get all cards for a collection
   */
  static async getCardsByCollectionId(
    collectionId: string
  ): Promise<Card[]> {
    try {
      return await getCardsByCollectionId(collectionId);
    } catch (error) {
      console.error(
        "CardService: Error getting cards by collection ID:",
        error
      );
      throw error;
    }
  }

  /**
   * Create a new card
   */
  static async createCard(
    collectionId: string,
    front: string,
    back: string
  ): Promise<Card | null> {
    try {
      return await createCardRepo(collectionId, front, back);
    } catch (error) {
      console.error("CardService: Error creating card:", error);
      throw error;
    }
  }

  /**
   * Update a card
   */
  static async updateCard(
    cardId: string,
    front: string,
    back: string
  ): Promise<Card | null> {
    try {
      return await updateCardRepo(cardId, front, back);
    } catch (error) {
      console.error("CardService: Error updating card:", error);
      throw error;
    }
  }

  /**
   * Delete a card (soft delete)
   */
  static async deleteCard(cardId: string): Promise<boolean> {
    try {
      return await deleteCardRepo(cardId);
    } catch (error) {
      console.error("CardService: Error deleting card:", error);
      throw error;
    }
  }

  /**
   * Get card by ID
   */
  static async getCardById(cardId: string): Promise<Card | null> {
    try {
      return await getCardById(cardId);
    } catch (error) {
      console.error("CardService: Error getting card by ID:", error);
      throw error;
    }
  }
}

export default CardService;
