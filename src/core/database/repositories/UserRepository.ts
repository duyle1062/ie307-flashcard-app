import { executeQuery } from "../database";
import { updateWithSync } from "../helpers";
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
      "SELECT * FROM users WHERE id = ?",
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
      "SELECT * FROM users WHERE email = ?",
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
    // Handle email uniqueness: If email exists with different ID, delete old user
    if (userData.email) {
      const emailConflict = await executeQuery(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [userData.email, userData.id]
      );
      
      if (emailConflict.rows.length > 0) {
        const oldId = emailConflict.rows.item(0).id;
        console.log(`⚠️ Email ${userData.email} exists with different ID ${oldId}, deleting old user...`);
        await executeQuery("DELETE FROM users WHERE id = ?", [oldId]);
      }
    }
    
    // Use INSERT OR REPLACE to handle both insert and update atomically
    // COALESCE preserves original created_at if user already exists
    await executeQuery(
      `INSERT OR REPLACE INTO users (
        id, email, display_name, picture,
        streak_days, last_active_date, 
        daily_new_cards_limit, daily_review_cards_limit,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        COALESCE((SELECT created_at FROM users WHERE id = ?), datetime('now')),
        datetime('now')
      )`,
      [
        userData.id,
        userData.email,
        userData.display_name,
        userData.picture,
        userData.streak_days ?? 0,
        userData.last_active_date,
        userData.daily_new_cards_limit ?? 25,
        userData.daily_review_cards_limit ?? 50,
        userData.id, // For COALESCE to preserve original created_at
      ]
    );

    return await getUserById(userData.id);
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
    console.log("🔄 UserRepository: Updating user profile");
    console.log("   User ID:", userId);
    console.log("   Display Name:", displayName);
    console.log("   Profile Picture:", profilePictureUrl || "(no change)");
    
    await updateWithSync(
      "users",
      userId,
      {
        display_name: displayName,
        picture: profilePictureUrl,
      },
      ["display_name", "picture"]
    );
    
    console.log("✅ UserRepository: Update query executed");

    const updatedUser = await getUserById(userId);
    
    if (updatedUser) {
      console.log("✅ UserRepository: Retrieved updated user:", {
        id: updatedUser.id,
        display_name: updatedUser.display_name,
        email: updatedUser.email,
      });
    } else {
      console.log("❌ UserRepository: Could not retrieve updated user");
    }
    
    return updatedUser;
  } catch (error) {
    console.error("❌ UserRepository: Error updating user profile:", error);
    throw error;
  }
};
