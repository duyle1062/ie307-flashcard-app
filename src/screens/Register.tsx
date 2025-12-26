import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "../shared/constants/Color";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "../navigation/AuthStack";

import Fontisto from "@expo/vector-icons/Fontisto";

import AuthHeader from "../components/AuthHeader";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import AuthNavigate from "../components/AuthNavigate";
import AuthSocial from "../components/AuthSocial";

import { useAuth } from "../shared/context/AuthContext";

export default function Register() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t("auth.missingInformation"), t("auth.fillAllFields"));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t("auth.weakPassword"), t("auth.passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    const success = await register(email, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AuthHeader title={t("auth.signUp")} />

      <View style={styles.field}>
        <Text style={styles.label}>{t("auth.email")}</Text>
        <AuthInput
          icon={<Fontisto name="email" size={18} color={Colors.black} />}
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t("auth.createPassword")}</Text>
        <AuthInput
          icon={<Fontisto name="key" size={18} color={Colors.black} />}
          placeholder={t("auth.passwordPlaceholder")}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t("auth.confirmPassword")}</Text>
        <AuthInput
          icon={<Fontisto name="key" size={18} color={Colors.black} />}
          placeholder={t("auth.repeatPasswordPlaceholder")}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <AuthButton
        title={loading ? t("auth.creatingAccount") : t("auth.signUp")}
        onPress={handleRegister}
        disabled={loading}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{t("auth.orRegisterWith")}</Text>
        <View style={styles.line} />
      </View>

      <AuthSocial />

      <AuthNavigate
        text={t("auth.haveAccount")}
        linkText={t("auth.signIn")}
        onPress={() => navigation.navigate("Login")}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 50,
    paddingHorizontal: 30,
  },

  field: {
    width: "100%",
    marginVertical: 6,
  },

  label: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.black,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 5,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray,
  },

  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: Colors.black,
  },
});
