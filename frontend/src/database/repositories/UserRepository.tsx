import { executeQuery } from "../database";
import { insertWithSync, updateWithSync } from "../helpers";
import { User } from "../types";

/**
 * UserRepository - Handles all user-related database operations
 */

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL",
      [userId]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0) as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user by id:", error);
    throw error;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await executeQuery(
      "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL",
      [email]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0) as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

/**
 * Create or update user (used for sync from server)
 */
export const upsertUser = async (
  userData: Partial<User> & { id: string }
): Promise<User | null> => {
  try {
    const existing = await getUserById(userData.id);

    if (existing) {
      // Update existing user
      await executeQuery(
        `UPDATE users SET 
          email = ?, 
          display_name = ?, 
          profile_picture_url = ?,
          streak_days = ?,
          last_active_date = ?,
          daily_new_cards_limit = ?,
          daily_review_cards_limit = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
        [
          userData.email ?? existing.email,
          userData.display_name ?? existing.display_name,
          userData.profile_picture_url ?? existing.profile_picture_url,
          userData.streak_days ?? existing.streak_days,
          userData.last_active_date ?? existing.last_active_date,
          userData.daily_new_cards_limit ?? existing.daily_new_cards_limit,
          userData.daily_review_cards_limit ??
            existing.daily_review_cards_limit,
          userData.id,
        ]
      );

      return await getUserById(userData.id);
    } else {
      // Insert new user
      await executeQuery(
        `INSERT INTO users (
          id, email, display_name, profile_picture_url,
          streak_days, last_active_date, 
          daily_new_cards_limit, daily_review_cards_limit,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          userData.id,
          userData.email,
          userData.display_name,
          userData.profile_picture_url,
          userData.streak_days ?? 0,
          userData.last_active_date,
          userData.daily_new_cards_limit ?? 25,
          userData.daily_review_cards_limit ?? 50,
        ]
      );

      return await getUserById(userData.id);
    }
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
};

/**
 * Update user's streak and last active date
 */
export const updateUserStreak = async (
  userId: string,
  streakDays: number,
  lastActiveDate: string
): Promise<User | null> => {
  try {
    await updateWithSync(
      "users",
      userId,
      { streak_days: streakDays, last_active_date: lastActiveDate },
      ["streak_days", "last_active_date"]
    );

    return await getUserById(userId);
  } catch (error) {
    console.error("Error updating user streak:", error);
    throw error;
  }
};

/**
 * Update user's daily limits
 */
export const updateUserDailyLimits = async (
  userId: string,
  newCardsLimit: number,
  reviewCardsLimit: number
): Promise<User | null> => {
  try {
    await updateWithSync(
      "users",
      userId,
      {
        daily_new_cards_limit: newCardsLimit,
        daily_review_cards_limit: reviewCardsLimit,
      },
      ["daily_new_cards_limit", "daily_review_cards_limit"]
    );

    return await getUserById(userId);
  } catch (error) {
    console.error("Error updating user daily limits:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  displayName: string,
  profilePictureUrl?: string
): Promise<User | null> => {
  try {
    await updateWithSync(
      "users",
      userId,
      {
        display_name: displayName,
        profile_picture_url: profilePictureUrl,
      },
      ["display_name", "profile_picture_url"]
    );

    return await getUserById(userId);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
