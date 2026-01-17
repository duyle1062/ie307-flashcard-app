import { Colors } from "@/shared/constants/Color";
import { View, Text, StyleSheet } from "react-native";

export default function AuthHeader({ title }: Readonly<{ title: string }>) {
  return (
    <View style={styles.logoContainer}>
      {/* <Image style={styles.logo} source={require("../assets/react-logo.png")} /> */}
      <Text style={styles.logoText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },

  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
    color: Colors.primary,
  },
});
