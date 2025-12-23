import { executeQuery } from "../database";
import { insertWithSync, generateUUID } from "../helpers";
import { Review, ReviewStats } from "../types";

/**
 * ReviewRepository - Handles all review-related database operations
 * Reviews track each card study session for daily limit enforcement
 */

/**
 * Get review by ID
 */
export const getReviewById = async (
  reviewId: string
): Promise<Review | null> => {
  try {
    const result = await executeQuery("SELECT * FROM reviews WHERE id = ?", [
      reviewId,
    ]);

    if (result.rows.length > 0) {
      return result.rows.item(0) as Review;
    }
    return null;
  } catch (error) {
    console.error("Error getting review by id:", error);
    throw error;
  }
};

/**
 * Get all reviews for a card
 */
export const getReviewsByCardId = async (cardId: string): Promise<Review[]> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM reviews WHERE card_id = ? ORDER BY reviewed_at DESC",
      [cardId]
    );

    const reviews: Review[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      reviews.push(result.rows.item(i) as Review);
    }
    return reviews;
  } catch (error) {
    console.error("Error getting reviews by card id:", error);
    throw error;
  }
};

/**
 * Create a new review record
 */
export const createReview = async (
  userId: string,
  cardId: string,
  rating: number,
  oldInterval: number,
  newInterval: number,
  oldEf: number,
  newEf: number
): Promise<Review | null> => {
  try {
    const id = generateUUID();
    const now = new Date().toISOString();

    await insertWithSync("reviews", {
      id,
      user_id: userId,
      card_id: cardId,
      rating,
      old_interval: oldInterval,
      new_interval: newInterval,
      old_ef: oldEf,
      new_ef: newEf,
      reviewed_at: now,
    });

    return await getReviewById(id);
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

/**
 * Count new cards studied today by user
 */
export const countNewCardsStudiedToday = async (
  userId: string
): Promise<number> => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const result = await executeQuery(
      `SELECT COUNT(DISTINCT card_id) as count 
       FROM reviews r
       INNER JOIN cards c ON r.card_id = c.id
       WHERE r.user_id = ? 
       AND DATE(r.reviewed_at) = ?
       AND r.old_interval = 0
       AND c.is_deleted = 0`,
      [userId, today]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0).count;
    }
    return 0;
  } catch (error) {
    console.error("Error counting new cards studied today:", error);
    throw error;
  }
};

/**
 * Count review cards studied today by user
 * 
 * ⚠️ QUAN TRỌNG: Chỉ đếm cards có old_interval >= 1 (Review cards đã graduate)
 * KHÔNG đếm Learning cards vì Learning không tính vào review limit
 * 
 * Logic phân biệt:
 * - New cards: old_interval = 0 (chưa học bao giờ)
 * - Review cards: old_interval >= 1 (đã graduate, đang ôn định kỳ)
 * - Learning cards: 0 < old_interval < 1 (đang học dở, chưa graduate)
 */
export const countReviewCardsStudiedToday = async (
  userId: string
): Promise<number> => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Chỉ đếm cards có old_interval >= 1 (Review cards)
    // Learning cards (0 < interval < 1) KHÔNG tính
    const result = await executeQuery(
      `SELECT COUNT(DISTINCT card_id) as count 
       FROM reviews r
       INNER JOIN cards c ON r.card_id = c.id
       WHERE r.user_id = ? 
       AND DATE(r.reviewed_at) = ?
       AND r.old_interval >= 1
       AND c.is_deleted = 0`,
      [userId, today]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0).count;
    }
    return 0;
  } catch (error) {
    console.error("Error counting review cards studied today:", error);
    throw error;
  }
};

/**
 * Get review statistics for a user (today, this week, this month)
 */
export const getUserReviewStats = async (
  userId: string
): Promise<ReviewStats> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const result = await executeQuery(
      `SELECT 
        COUNT(CASE WHEN DATE(reviewed_at) = ? THEN 1 END) as today_count,
        COUNT(CASE WHEN DATE(reviewed_at) >= ? THEN 1 END) as week_count,
        COUNT(CASE WHEN DATE(reviewed_at) >= ? THEN 1 END) as month_count,
        COUNT(*) as total_count,
        AVG(rating) as avg_rating
       FROM reviews 
       WHERE user_id = ?`,
      [today, weekAgo, monthAgo, userId]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0) as ReviewStats;
    }
    return {
      today_count: 0,
      week_count: 0,
      month_count: 0,
      total_count: 0,
      avg_rating: 0,
    };
  } catch (error) {
    console.error("Error getting user review stats:", error);
    throw error;
  }
};

/**
 * Get reviews for a specific date range
 */
export const getReviewsByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<Array<Review & { front: string; back: string }>> => {
  try {
    const result = await executeQuery(
      `SELECT r.*, c.front, c.back 
       FROM reviews r
       INNER JOIN cards c ON r.card_id = c.id
       WHERE r.user_id = ? 
       AND DATE(r.reviewed_at) BETWEEN ? AND ?
       ORDER BY r.reviewed_at DESC`,
      [userId, startDate, endDate]
    );

    const reviews: Array<Review & { front: string; back: string }> = [];
    for (let i = 0; i < result.rows.length; i++) {
      reviews.push(result.rows.item(i));
    }
    return reviews;
  } catch (error) {
    console.error("Error getting reviews by date range:", error);
    throw error;
  }
};

/**
 * Create or update review (used for sync from server)
 */
export const upsertReview = async (
  reviewData: Partial<Review> & { id: string }
): Promise<Review | null> => {
  try {
    // Check if review exists (simple check)
    const existingCheck = await executeQuery(
      "SELECT id FROM reviews WHERE id = ?",
      [reviewData.id]
    );

    if (existingCheck.rows.length === 0) {
      // Insert new review (reviews are immutable, so we only insert if not exists)
      await executeQuery(
        `INSERT INTO reviews (
          id, user_id, card_id, rating,
          old_interval, new_interval, old_ef, new_ef,
          reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reviewData.id,
          reviewData.user_id,
          reviewData.card_id,
          reviewData.rating,
          reviewData.old_interval,
          reviewData.new_interval,
          reviewData.old_ef,
          reviewData.new_ef,
          reviewData.reviewed_at,
        ]
      );
    }
    // If exists, skip (reviews are immutable, no update needed)

    return await getReviewById(reviewData.id);
  } catch (error) {
    console.error("Error upserting review:", error);
    throw error;
  }
};

/**
 * Get list of distinct dates user has studied
 * Used for Streak Calendar
 */
export const getUserStudyDates = async (userId: string): Promise<string[]> => {
  try {
    // Lấy chuỗi ngày YYYY-MM-DD từ field reviewed_at
    // SQLite: substr(reviewed_at, 1, 10) lấy 10 ký tự đầu (YYYY-MM-DD)
    const result = await executeQuery(
      `SELECT DISTINCT substr(reviewed_at, 1, 10) as study_date 
       FROM reviews 
       WHERE user_id = ? 
       ORDER BY study_date ASC`,
      [userId]
    );

    const dates: string[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      dates.push(result.rows.item(i).study_date);
    }
    
    return dates;
  } catch (error) {
    console.error("Error getting user study dates:", error);
    throw error;
  }
};
