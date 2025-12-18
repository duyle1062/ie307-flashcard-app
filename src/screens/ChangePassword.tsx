// pages/ChangePassword.tsx

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AuthInput from "@/components/AuthInput";
import Fontisto from "@expo/vector-icons/Fontisto";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import DottedBackground from "@/components/DottedBackground";
import { useLanguage } from "../shared/hooks/useLanguage";

export default function ChangePassword() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const [isUpdating, setIsUpdating] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("common.error"), t("common.confirm"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("common.error"),
        "New password and confirmation do not match"
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        t("common.error"),
        "Password must be at least 6 characters long"
      );
      return;
    }

    try {
      setIsUpdating(true);

      // Hiện tại dùng mock success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(t("common.success"), "Password changed successfully");

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t("common.error"),
        "Failed to change password. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DottedBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("auth.changePassword")}</Text>
        <View style={{ width: 100 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.topSection}>
              <View style={styles.avatarContainer}>
                <FontAwesome name="lock" size={50} color={Colors.white} />
              </View>
            </View>

            <Text style={styles.label}>{t("auth.oldPassword")}</Text>

            <AuthInput
              icon={<Fontisto name="key" size={18} color={Colors.black} />}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder={t("auth.oldPassword")}
              secureTextEntry
              editable={!isUpdating}
              placeholderTextColor={Colors.subText}
            />

            <Text style={styles.label}>{t("auth.newPassword")}</Text>

            <AuthInput
              icon={<Fontisto name="key" size={18} color={Colors.black} />}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t("auth.newPassword")}
              secureTextEntry
              editable={!isUpdating}
              placeholderTextColor={Colors.subText}
            />
            <Text style={styles.label}>{t("auth.confirmNewPassword")}</Text>
            <AuthInput
              icon={<Fontisto name="key" size={18} color={Colors.black} />}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("auth.confirmNewPassword")}
              secureTextEntry
              editable={!isUpdating}
              placeholderTextColor={Colors.subText}
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.updateButton, isUpdating && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.updateButtonText}>{t("common.save")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    justifyContent: "center",
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

  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.subText,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.title,
    marginBottom: 8,
    marginTop: 15,
  },

  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    ...Shadows.strong,
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
