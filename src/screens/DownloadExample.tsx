import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../shared/constants/Color";
import { useLanguage } from "../shared/hooks/useLanguage";

export default function DownloadExample() {
  const { t } = useLanguage();

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
