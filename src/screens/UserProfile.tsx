import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import DottedBackground from "@/components/DottedBackground";

import { useUserProfile } from "../features/user";

export default function UserProfile() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { userData, isLoading, isUpdating, updateProfile } = useUserProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    if (userData) {
      setName(userData.display_name || "");
      setEmail(userData.email);
      setStreakDays(userData.streak_days || 0);
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    if (!userData) {
      Alert.alert(t("common.error"), t("alerts.userNotAuthenticated"));
      return;
    }
    if (!name.trim()) {
      Alert.alert(
        t("common.error"),
        t("profile.username") + " " + t("auth.emailRequired")
      );
      return;
    }
    await updateProfile(name, userData.picture);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DottedBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        <View style={{ width: 100 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Avatar & Streak Section */}
            <View style={styles.topSection}>
              <View style={styles.avatarContainer}>
                <FontAwesome name="user" size={50} color={Colors.white} />
              </View>

              <View style={styles.streakContainer}>
                <Text style={styles.streakLabel}>
                  {t("profile.streak")}:{" "}
                  {t("card.daysInterval", { count: streakDays })}
                </Text>
                <AntDesign name="fire" size={24} color="orange" />
              </View>
            </View>

            {/* Form Fields */}
            <Text style={styles.label}>{t("profile.username")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("profile.username")}
              editable={!isUpdating}
            />

            <Text style={styles.label}>{t("profile.email")}</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              keyboardType="email-address"
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.updateButton, isUpdating && styles.disabledButton]}
          onPress={handleUpdateProfile}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.updateButtonText}>
              {t("card.update").toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.subText,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    ...Shadows.medium,
    borderColor: Colors.primary,
    borderWidth: 1,
  },

  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.silver,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    gap: 8,
  },

  streakLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.subText,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.title,
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.subText,
  },

  disabledInput: {
    backgroundColor: Colors.silver,
    color: Colors.subText,
  },

  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },

  disabledButton: {
    backgroundColor: Colors.gray,
    opacity: 0.6,
  },

  updateButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
