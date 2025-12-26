import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import { TextBlock } from "../features/ocr/services";

interface OCRStatsBarProps {
  textBlocks: TextBlock[];
  selectedBlocks: string[];
}

export function OCRStatsBar({
  textBlocks,
  selectedBlocks,
}: Readonly<OCRStatsBarProps>) {
  const { t } = useTranslation();
  const frontBlocks = textBlocks.filter((b) => b.type === "front");
  const backBlocks = textBlocks.filter((b) => b.type === "back");

  return (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <View style={[styles.statBadge, { backgroundColor: Colors.green }]} />
        <Text style={styles.statText}>
          {t("ocr.front")}: {frontBlocks.length}
        </Text>
      </View>
      <View style={styles.statItem}>
        <View style={[styles.statBadge, { backgroundColor: Colors.blue }]} />
        <Text style={styles.statText}>
          {t("ocr.back")}: {backBlocks.length}
        </Text>
      </View>
      <View style={styles.statItem}>
        <View style={[styles.statBadge, { backgroundColor: Colors.primary }]} />
        <Text style={styles.statText}>
          {t("ocr.selected")}: {selectedBlocks.length}
        </Text>
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
    backgroundColor: Colors.surface,
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
    fontWeight: "bold",
    color: Colors.title,
  },
});
