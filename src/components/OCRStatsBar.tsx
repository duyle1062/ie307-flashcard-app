import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";
import { TextBlock } from "../features/ocr/services";

interface OCRStatsBarProps {
  textBlocks: TextBlock[];
  selectedBlocks: string[];
}

/**
 * OCR Stats Bar - Shows count of Front, Back, and Selected blocks
 */
export function OCRStatsBar({ textBlocks, selectedBlocks }: Readonly<OCRStatsBarProps>) {
  const frontBlocks = textBlocks.filter((b) => b.type === "front");
  const backBlocks = textBlocks.filter((b) => b.type === "back");

  return (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <View style={[styles.statBadge, { backgroundColor: Colors.green }]} />
        <Text style={styles.statText}>Front: {frontBlocks.length}</Text>
      </View>
      <View style={styles.statItem}>
        <View style={[styles.statBadge, { backgroundColor: Colors.blue }]} />
        <Text style={styles.statText}>Back: {backBlocks.length}</Text>
      </View>
      <View style={styles.statItem}>
        <View style={[styles.statBadge, { backgroundColor: Colors.primary }]} />
        <Text style={styles.statText}>Selected: {selectedBlocks.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    ...Shadows.light,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.title,
  },
});
