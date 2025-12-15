/**
 * useUserProfile Hook
 * Custom hook for managing user profile data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { UserService } from "../services/UserService";
import { useSync } from "../../sync/hooks";
import { User } from "../../../shared/types";

interface UseUserProfileReturn {
  userData: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  loadUserData: () => Promise<void>;
  updateProfile: (name: string, picture?: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { forceSync } = useSync();

  /**
   * Load user data from database
   */
  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = await UserService.getCurrentUser();
      
      if (user) {
        setUserData(user);
      } else {
        Alert.alert("Error", "User data not found");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (name: string, picture?: string): Promise<boolean> => {
      if (!userData) {
        console.log("❌ useUserProfile: No user data available");
        Alert.alert("Error", "User data not available");
        return false;
      }

      if (!name.trim()) {
        console.log("❌ useUserProfile: Name is empty");
        Alert.alert("Error", "Name cannot be empty");
        return false;
      }

      try {
        console.log("🔄 useUserProfile: Starting profile update...");
        console.log("   Current userData:", {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        });
        console.log("   New name:", name.trim());
        
        setIsUpdating(true);

        // Update local DB first (adds to sync_queue automatically)
        const updatedUser = await UserService.updateProfile(
          userData.id,
          name.trim(),
          picture
        );

        if (updatedUser) {
          console.log("✅ useUserProfile: Local DB updated successfully");
          console.log("   Updated user data:", {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
          });
          
          setUserData(updatedUser);

          // Trigger sync
          console.log("🔄 useUserProfile: Triggering sync...");
          const syncResult = await forceSync();

          if (syncResult?.success) {
            console.log("✅ useUserProfile: Sync successful");
            console.log("   Pushed:", syncResult.pushedCount);
            console.log("   Pulled:", syncResult.pulledCount);
            Alert.alert("Success!", "Your profile has been updated");
            return true;
          } else if (syncResult?.errors && syncResult.errors.length > 0) {
            console.log("⚠️ useUserProfile: Sync failed but saved locally");
            console.log("   Errors:", syncResult.errors);
            Alert.alert(
              "Saved locally",
              "Changes will sync when connection is available"
            );
            return true;
          } else {
            console.log("⚠️ useUserProfile: Sync result unclear, but data saved locally");
            Alert.alert("Saved locally", "Your changes have been saved");
            return true;
          }
        } else {
          console.log("❌ useUserProfile: Failed to update profile - returned null");
          Alert.alert("Error", "Failed to update profile");
          return false;
        }
      } catch (error: any) {
        console.error("❌ useUserProfile: Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile: " + error.message);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [userData, forceSync]
  );

  /**
   * Refresh user data
   */
  const refreshUserData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    userData,
    isLoading,
    isUpdating,
    loadUserData,
    updateProfile,
    refreshUserData,
  };
};
