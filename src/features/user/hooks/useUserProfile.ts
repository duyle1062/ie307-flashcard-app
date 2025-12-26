/**
 * useUserProfile Hook
 * Custom hook for managing user profile data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { UserService } from "../services/UserService";
import { useSync } from "../../../shared/context/SyncContext";
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
  const { t } = useTranslation();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { checkAndSyncIfNeeded } = useSync();

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
        Alert.alert(t("common.error"), t("alerts.userDataNotFound"));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert(t("common.error"), t("alerts.failedToLoadUserData"));
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
        console.log("useUserProfile: No user data available");
        Alert.alert(t("common.error"), t("alerts.userDataNotAvailable"));
        return false;
      }

      if (!name.trim()) {
        console.log("useUserProfile: Name is empty");
        Alert.alert(t("common.error"), t("alerts.nameCannotBeEmpty"));
        return false;
      }

      try {
        console.log("useUserProfile: Starting profile update...");
        console.log("Current userData:", {
          id: userData.id,
          name: userData.display_name,
          email: userData.email,
        });
        console.log("New name:", name.trim());

        setIsUpdating(true);

        // Update local DB first (adds to sync_queue automatically)
        const updatedUser = await UserService.updateProfile(
          userData.id,
          name.trim(),
          picture
        );

        if (updatedUser) {
          console.log("useUserProfile: Local DB updated successfully");
          console.log("Updated user data:", {
            id: updatedUser.id,
            name: updatedUser.display_name,
            email: updatedUser.email,
          });

          setUserData(updatedUser);

          // Trigger sync
          console.log("useUserProfile: Triggering sync...");
          checkAndSyncIfNeeded();

          Alert.alert(t("common.success"), t("profile.updateSuccess"));
          return true;
        } else {
          console.log(
            "useUserProfile: Failed to update profile - returned null"
          );
          Alert.alert(t("common.error"), t("alerts.failedToUpdateProfile"));
          return false;
        }
      } catch (error: any) {
        console.error("useUserProfile: Error updating profile:", error);
        Alert.alert(
          t("common.error"),
          t("alerts.failedToUpdateProfile") + ": " + error.message
        );
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [userData, checkAndSyncIfNeeded]
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
