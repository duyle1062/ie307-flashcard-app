import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { Colors } from "../const/Color";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "../navigation/AuthStack";

import Fontisto from "@expo/vector-icons/Fontisto";

import AuthHeader from "../components/AuthHeader";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import AuthNavigate from "../components/AuthNavigate";
import AuthSocial from "../components/AuthSocial";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "The passwords you entered do not match."
      );
      return;
    }
    setLoading(true); // Bắt đầu loading
    const success = await register(email, password);
    setLoading(false);

    if (success) {
      // User đã được authenticate và tự động login, AuthContext sẽ navigate sang AppStack
      // Không cần navigate manually vì isAuthenticated đã true
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AuthHeader title="Sign up" />

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <AuthInput
          icon={<Fontisto name="email" size={18} color={Colors.black} />}
          placeholder="example@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Create a password</Text>
        <AuthInput
          icon={<Fontisto name="key" size={18} color={Colors.black} />}
          placeholder="Must be 8 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Confirm password</Text>
        <AuthInput
          icon={<Fontisto name="key" size={18} color={Colors.black} />}
          placeholder="Repeat password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <AuthButton
        title={loading ? "Creating account..." : "Sign up"}
        onPress={handleRegister}
        disabled={loading}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or Register with</Text>
        <View style={styles.line} />
      </View>

      <AuthSocial />

      <AuthNavigate
        text="Already have an account?"
        linkText="Log in"
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
