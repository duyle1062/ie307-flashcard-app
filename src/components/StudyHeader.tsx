import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";

import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";

import { Colors } from "../shared/constants/Color";

interface StudyStats {
  new: number;
  learning: number;
  review: number;
}

interface StudyHeaderProps {
  insets: EdgeInsets;
  onBack: () => void;
  counts: StudyStats;
  canUndo: boolean;
}

export default function StudyHeader({
  insets,
  onBack,
  counts,
}: StudyHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <Feather name="chevron-left" size={28} color={Colors.title} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.iconBtn}>
          <Entypo name="dots-three-vertical" size={20} color={Colors.title} />
        </TouchableOpacity>
      </View>
      <View style={styles.statusBarStripe}>
        <Text style={styles.statusLabel}>
          {t("study.newLabel")}:{" "}
          <Text style={{ color: Colors.blue }}>{counts.new}</Text>
        </Text>
        <Text style={styles.statusLabel}>
          {t("study.learnLabel")}:{" "}
          <Text style={{ color: Colors.red }}>{counts.learning}</Text>
        </Text>
        <Text style={styles.statusLabel}>
          {t("study.reviewLabel")}:{" "}
          <Text style={{ color: Colors.green }}>{counts.review}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tertiary,
    zIndex: 10,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 50,
  },

  iconBtn: {
    padding: 10,
  },

  statusBarStripe: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 20,
  },

  statusLabel: {
    fontSize: 14,
    color: Colors.subText,
    fontWeight: "bold",
  },
});
