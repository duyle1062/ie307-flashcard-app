import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Colors } from "../shared/constants/Color";

export default function AuthButton({
  title,
  onPress,
  disabled = false,
}: Readonly<{
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}>) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {disabled ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.btnText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    backgroundColor: Colors.black,
    borderRadius: 10,
    paddingVertical: 10,
    marginVertical: 15,
    alignItems: "center",
  },

  btnDisabled: {
    opacity: 0.6,
  },

  btnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
