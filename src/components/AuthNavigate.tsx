import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Colors } from "../shared/constants/Color";

type AuthNavigateProps = {
  text: string;
  linkText: string;
  onPress: () => void;
};

export default function AuthNavigate({
  text,
  linkText,
  onPress,
}: Readonly<AuthNavigateProps>) {
  return (
    <View style={styles.navigate}>
      <Text style={styles.text}>{text} </Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.link}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    fontSize: 16,
  },

  link: {
    fontSize: 16,
    color: Colors.midnightBlue,
    fontWeight: "bold",
  },
});
