import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../shared/constants/Color";

export default function Statistical() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Statistical Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  text: {
    fontSize: 20,
    color: Colors.title,
    fontWeight: "bold",
  },
});
