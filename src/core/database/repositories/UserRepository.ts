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
    // Check if user exists by ID (simple check to avoid race conditions)
    const existingCheck = await executeQuery(
      "SELECT id FROM users WHERE id = ?",
      [userData.id]
    );
    
    if (existingCheck.rows.length > 0) {
      // Update existing user by ID
      await executeQuery(
        `UPDATE users SET 
          email = ?, 
          name = ?, 
          picture = ?,
          streak_days = ?,
          last_active_date = ?,
          daily_new_cards_limit = ?,
          daily_review_cards_limit = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
        [
          userData.email,
          userData.display_name,
          userData.picture,
          userData.streak_days ?? 0,
          userData.last_active_date,
          userData.daily_new_cards_limit ?? 25,
          userData.daily_review_cards_limit ?? 50,
          userData.id,
        ]
      );
    } else {
      // Check if email already exists (handle email conflict)
      if (userData.email) {
        const emailCheck = await executeQuery(
          "SELECT id FROM users WHERE email = ?",
          [userData.email]
        );
        
        if (emailCheck.rows.length > 0) {
          // Email exists with different ID, delete old record
          console.log(`⚠️ Email ${userData.email} exists with different ID, replacing...`);
          await executeQuery("DELETE FROM users WHERE email = ?", [userData.email]);
        }
      }
      
      // Insert new user
      await executeQuery(
        `INSERT INTO users (
          id, email, name, picture,
          streak_days, last_active_date, 
          daily_new_cards_limit, daily_review_cards_limit,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          userData.id,
          userData.email,
          userData.display_name,
          userData.picture,
          userData.streak_days ?? 0,
          userData.last_active_date,
          userData.daily_new_cards_limit ?? 25,
          userData.daily_review_cards_limit ?? 50,
        ]
      );
    }

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
        name: displayName,
        picture: profilePictureUrl,
      },
      ["name", "picture"]
    );
    
    console.log("✅ UserRepository: Update query executed");

    const updatedUser = await getUserById(userId);
    
    if (updatedUser) {
      console.log("✅ UserRepository: Retrieved updated user:", {
        id: updatedUser.id,
        name: updatedUser.name,
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
