import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "../shared/constants/Color";

type SortType = "due_date" | "created" | "status";

interface SortTabsProps {
  sortType: SortType;
  onSortChange: (sortType: SortType) => void;
}

export default function SortTabs({ sortType, onSortChange }: SortTabsProps) {
  const { t } = useTranslation();

  const sortOptions: { value: SortType; label: string }[] = [
    { value: "due_date", label: t("card.sortByDueDate") },
    { value: "created", label: t("card.sortByCreated") },
    { value: "status", label: t("card.sortByStatus") },
  ];

  return (
    <View style={styles.sortContainer}>
      {sortOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.sortBtn,
            sortType === option.value && styles.sortBtnActive,
          ]}
          onPress={() => onSortChange(option.value)}
        >
          <Text
            style={[
              styles.sortBtnText,
              sortType === option.value && styles.sortBtnTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },

  sortBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },

  sortBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  sortBtnText: {
    fontSize: 13,
    color: Colors.title,
    fontWeight: "500",
  },

  sortBtnTextActive: {
    color: Colors.white,
  },
});
