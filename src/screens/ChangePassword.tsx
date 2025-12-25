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
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useTranslation } from "react-i18next";

import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AuthInput from "@/components/AuthInput";
import Fontisto from "@expo/vector-icons/Fontisto";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";
import { useAuth } from "../shared/context/AuthContext";

import DottedBackground from "@/components/DottedBackground";

export default function ChangePassword() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [isUpdating, setIsUpdating] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("common.error"), t("auth.fillAllFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.newPasswordMismatch"));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t("common.error"), t("auth.passwordTooShort"));
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert(t("common.error"), t("auth.newPasswordMustDiffer"));
      return;
    }

    if (!user || !user.email) {
      Alert.alert(t("common.error"), t("alerts.userNotAuthenticated"));
      return;
    }

    try {
      setIsUpdating(true);

      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert(t("common.success"), t("auth.passwordChangeSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      let errorMessage = t("auth.passwordChangeFailed");

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-login-credentials"
      ) {
        errorMessage = t("auth.oldPasswordIncorrect");
      } else if (error.code === "auth/weak-password") {
        errorMessage = t("auth.passwordTooWeak");
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = t("auth.requiresRecentLogin");
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = t("auth.tooManyRequests");
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = t("auth.networkError");
      }

      Alert.alert(t("common.error"), errorMessage);
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
              placeholder={t("auth.oldPasswordPlaceholder")}
              secureTextEntry
              editable={!isUpdating}
              placeholderTextColor={Colors.subText}
            />

            <Text style={styles.label}>{t("auth.newPassword")}</Text>

            <AuthInput
              icon={<Fontisto name="key" size={18} color={Colors.black} />}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t("auth.newPasswordPlaceholder")}
              secureTextEntry
              editable={!isUpdating}
              placeholderTextColor={Colors.subText}
            />
            <Text style={styles.label}>{t("auth.confirmNewPassword")}</Text>
            <AuthInput
              icon={<Fontisto name="key" size={18} color={Colors.black} />}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("auth.confirmNewPasswordPlaceholder")}
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
    fontWeight: "bold",
    color: Colors.subText,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.title,
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
