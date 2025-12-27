import { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from "react-native";

import { Colors } from "../shared/constants/Color";

import { Ionicons } from "@expo/vector-icons";

interface AuthInputProps extends TextInputProps {
  icon: React.ReactNode;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

export default function AuthInput({
  icon,
  secureTextEntry,
  ...props
}: Readonly<AuthInputProps>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((current) => !current);
  };

  const showToggleIcon = secureTextEntry;

  return (
    <View style={styles.inputContainer}>
      <View style={styles.iconWrapper}>{icon}</View>

      <TextInput
        style={styles.input}
        {...props}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        placeholderTextColor={Colors.gray}
      />

      {showToggleIcon && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Ionicons
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={20}
            color={Colors.title}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    backgroundColor: Colors.silver,
    paddingHorizontal: 15,
    marginVertical: 8,
  },

  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.subText,
  },
});
