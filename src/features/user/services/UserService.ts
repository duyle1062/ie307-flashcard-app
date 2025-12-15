/**
 * UserService - Business logic for User operations
 * Handles all user-related database operations
 */

import {
  getUserById,
  updateUserProfile as updateUserProfileRepo,
} from "../../../core/database/repositories/UserRepository";
import { getCurrentUserId } from "../../../core/database/storage";
import { User } from "../../../shared/types";

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
      console.log("🔄 UserService: Updating profile for user:", userId);
      console.log("   Name:", name);
      console.log("   Picture:", picture || "(no change)");
      
      const result = await updateUserProfileRepo(userId, name, picture);
      
      if (result) {
        console.log("✅ UserService: Profile updated successfully");
        console.log("   Updated data:", {
          id: result.id,
          name: result.name,
          email: result.email,
        });
      } else {
        console.log("❌ UserService: Profile update returned null");
      }
      
      return result;
    } catch (error) {
      console.error("❌ UserService: Error updating profile:", error);
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
}

export default UserService;
