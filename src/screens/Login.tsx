import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";

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

import { useTranslation } from "react-i18next";

export default function Login() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password."
      );
      return;
    }

    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <AuthHeader title={t("auth.login")} />

      <View style={styles.field}>
        <Text style={styles.label}>{t("auth.email")}</Text>
        <AuthInput
          icon={<Fontisto name="email" size={18} color={Colors.black} />}
          placeholder={t("auth.loginEmailPlaceholder")}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t("auth.password")}</Text>
        <AuthInput
          icon={<Fontisto name="key" size={18} color={Colors.black} />}
          placeholder={t("auth.loginPasswordPlaceholder")}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        style={styles.forgotPassword}
        // onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotPasswordText}>
          {t("auth.forgotPassword")}
        </Text>
      </TouchableOpacity>

      <AuthButton
        title={loading ? t("common.loading") : t("auth.login")}
        onPress={handleLogin}
        disabled={loading}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{t("auth.orLoginWith")}</Text>
        <View style={styles.line} />
      </View>

      <AuthSocial />

      <AuthNavigate
        text={t("auth.noAccount")}
        linkText={t("auth.signUp")}
        onPress={() => navigation.navigate("Register")}
      />
    </View>
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

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },

  forgotPasswordText: {
    color: Colors.midnightBlue,
    fontWeight: "500",
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
