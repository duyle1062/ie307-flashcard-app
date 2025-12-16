import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../const/Color";

export default function DownloadExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Download file CSV example</Text>
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
