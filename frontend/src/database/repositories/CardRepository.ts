import { executeQuery } from "../database";
import {
  insertWithSync,
  updateWithSync,
  softDeleteWithSync,
  generateUUID,
} from "../helpers";
import { getCurrentUserId } from "../storage";
import { Card, CardStatus } from "../types";

/**
 * CardRepository - Handles all card-related database operations
 */

/**
 * Get card by ID
 */
export const getCardById = async (cardId: string): Promise<Card | null> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM cards WHERE id = ? AND deleted_at IS NULL",
      [cardId]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0) as Card;
    }
    return null;
  } catch (error) {
    console.error("Error getting card by id:", error);
    throw error;
  }
};

/**
 * Get all cards in a collection
 */
export const getCardsByCollectionId = async (
  collectionId: string
): Promise<Card[]> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM cards WHERE collection_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
      [collectionId]
    );

    const cards: Card[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      cards.push(result.rows.item(i) as Card);
    }
    return cards;
  } catch (error) {
    console.error("Error getting cards by collection id:", error);
    throw error;
  }
};

/**
 * Create a new card
 */
export const createCard = async (
  collectionId: string,
  front: string,
  back: string,
  hint?: string
): Promise<Card | null> => {
  try {
    const id = generateUUID();
    const now = new Date().toISOString();
    
    // Get user_id from collection
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User not logged in");
    }

    await insertWithSync("cards", {
      id,
      collection_id: collectionId,
      user_id: userId,
      front,
      back,
      hint,
      status: "new",
      interval: 0,
      ef: 2.5,
      due_date: now.split("T")[0],
      created_at: now,
      updated_at: now,
    });

    return await getCardById(id);
  } catch (error) {
    console.error("Error creating card:", error);
    throw error;
  }
};

/**
 * Update a card's content
 */
export const updateCard = async (
  cardId: string,
  front: string,
  back: string,
  hint?: string
): Promise<Card | null> => {
  try {
    await updateWithSync("cards", cardId, { front, back, hint }, [
      "front",
      "back",
      "hint",
    ]);

    return await getCardById(cardId);
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

/**
 * Update a card's SRS fields (status, interval, ef, due_date)
 */
export const updateCardSRS = async (
  cardId: string,
  status: CardStatus,
  interval: number,
  ef: number,
  dueDate: string
): Promise<Card | null> => {
  try {
    await updateWithSync(
      "cards",
      cardId,
      {
        status,
        interval,
        ef,
        due_date: dueDate,
      },
      ["status", "interval", "ef", "due_date"]
    );

    return await getCardById(cardId);
  } catch (error) {
    console.error("Error updating card SRS:", error);
    throw error;
  }
};

/**
 * Delete a card (soft delete)
 */
export const deleteCard = async (cardId: string): Promise<boolean> => {
  try {
    await softDeleteWithSync("cards", cardId);
    return true;
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};

/**
 * Get due cards for today
 */
export const getDueCards = async (collectionId?: string): Promise<Card[]> => {
  try {
    const today = new Date().toISOString().split("T")[0];

    let query = `
      SELECT * FROM cards 
      WHERE due_date <= ? AND deleted_at IS NULL
    `;
    const params: any[] = [today];

    if (collectionId) {
      query += " AND collection_id = ?";
      params.push(collectionId);
    }

    query += " ORDER BY due_date ASC, created_at ASC";

    const result = await executeQuery(query, params);

    const cards: Card[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      cards.push(result.rows.item(i) as Card);
    }
    return cards;
  } catch (error) {
    console.error("Error getting due cards:", error);
    throw error;
  }
};

/**
 * Get new cards (status = 'new')
 */
export const getNewCards = async (
  collectionId?: string,
  limit: number = 25
): Promise<Card[]> => {
  try {
    let query = `
      SELECT * FROM cards 
      WHERE status = 'new' AND deleted_at IS NULL
    `;
    const params: any[] = [];

    if (collectionId) {
      query += " AND collection_id = ?";
      params.push(collectionId);
    }

    query += " ORDER BY created_at ASC LIMIT ?";
    params.push(limit);

    const result = await executeQuery(query, params);

    const cards: Card[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      cards.push(result.rows.item(i) as Card);
    }
    return cards;
  } catch (error) {
    console.error("Error getting new cards:", error);
    throw error;
  }
};

/**
 * Get cards by status
 */
export const getCardsByStatus = async (
  status: CardStatus,
  collectionId?: string
): Promise<Card[]> => {
  try {
    let query = `
      SELECT * FROM cards 
      WHERE status = ? AND deleted_at IS NULL
    `;
    const params: any[] = [status];

    if (collectionId) {
      query += " AND collection_id = ?";
      params.push(collectionId);
    }

    query += " ORDER BY created_at DESC";

    const result = await executeQuery(query, params);

    const cards: Card[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      cards.push(result.rows.item(i) as Card);
    }
    return cards;
  } catch (error) {
    console.error("Error getting cards by status:", error);
    throw error;
  }
};

/**
 * Create or update card (used for sync from server)
 */
export const upsertCard = async (
  cardData: Partial<Card> & { id: string }
): Promise<Card | null> => {
  try {
    // Check if card exists (including soft-deleted ones)
    const existingCheck = await executeQuery(
      "SELECT id FROM cards WHERE id = ?",
      [cardData.id]
    );

    if (existingCheck.rows.length > 0) {
      // Update existing card (including soft-deleted ones)
      await executeQuery(
        `UPDATE cards SET 
          front = ?, 
          back = ?, 
          hint = ?,
          status = ?,
          interval = ?,
          ef = ?,
          due_date = ?,
          deleted_at = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          cardData.front,
          cardData.back,
          cardData.hint,
          cardData.status ?? "new",
          cardData.interval ?? 0,
          cardData.ef ?? 2.5,
          cardData.due_date,
          cardData.deleted_at ?? null,
          cardData.updated_at ?? new Date().toISOString(),
          cardData.id,
        ]
      );
    } else {
      // Insert new card
      await executeQuery(
        `INSERT INTO cards (
          id, collection_id, user_id, front, back, hint,
          status, interval, ef, due_date, deleted_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cardData.id,
          cardData.collection_id,
          cardData.user_id,
          cardData.front,
          cardData.back,
          cardData.hint,
          cardData.status ?? "new",
          cardData.interval ?? 0,
          cardData.ef ?? 2.5,
          cardData.due_date ?? new Date().toISOString().split("T")[0],
          cardData.deleted_at ?? null,
          cardData.created_at ?? new Date().toISOString(),
          cardData.updated_at ?? new Date().toISOString(),
        ]
      );
    }

    return await getCardById(cardData.id);
  } catch (error) {
    console.error("Error upserting card:", error);
    throw error;
  }
};
