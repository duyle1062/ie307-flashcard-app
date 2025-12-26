/**
 * UserService - Business logic for User operations
 * Handles all user-related database operations
 */

import {
  getUserById,
  updateUserProfile as updateUserProfileRepo,
  checkAndIncrementStreak,
} from "../../../core/database/repositories/UserRepository";
import { getCurrentUserId } from "../../../core/database/storage";
import { User } from "../../../shared/types";
import { getUserStudyDates } from "../../../core/database/repositories/ReviewRepository";

export class UserService {
  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return null;
      }
      return await getUserById(userId);
    } catch (error) {
      console.error("UserService: Error getting current user:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    name: string,
    picture?: string
  ): Promise<User | null> {
    try {
      console.log("UserService: Updating profile for user:", userId);
      console.log("Name:", name);
      console.log("Picture:", picture || "(no change)");

      const result = await updateUserProfileRepo(userId, name, picture);

      if (result) {
        console.log("UserService: Profile updated successfully");
        console.log("Updated data:", {
          id: result.id,
          name: result.display_name,
          email: result.email,
        });
      } else {
        console.log("UserService: Profile update returned null");
      }

      return result;
    } catch (error) {
      console.error("UserService: Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      return await getUserById(userId);
    } catch (error) {
      console.error("UserService: Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Check and update streak when user completes a session
   */
  static async updateDailyStreak(userId: string): Promise<User | null> {
    try {
      return await checkAndIncrementStreak(userId);
    } catch (error) {
      console.error("UserService: Error updating streak:", error);
      throw error;
    }
  }

  /**
   * Get all dates user has studied (Streak history)
   */
  static async getStudyHistory(userId: string): Promise<string[]> {
    try {
      return await getUserStudyDates(userId);
    } catch (error) {
      console.error("UserService: Error getting study history:", error);
      return [];
    }
  }
}

export default UserService;
