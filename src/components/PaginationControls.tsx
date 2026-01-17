import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";

import { Colors } from "../shared/constants/Color";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        disabled={currentPage === 0}
        onPress={() => onPageChange(Math.max(0, currentPage - 1))}
        style={[
          styles.paginationBtn,
          currentPage === 0 && styles.paginationBtnDisabled,
        ]}
      >
        <Feather name="chevron-left" size={20} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.paginationText}>
        {currentPage + 1} / {totalPages}
      </Text>
      <TouchableOpacity
        disabled={currentPage === totalPages - 1}
        onPress={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        style={[
          styles.paginationBtn,
          currentPage === totalPages - 1 && styles.paginationBtnDisabled,
        ]}
      >
        <Feather name="chevron-right" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },

  paginationBtn: {
    padding: 8,
  },

  paginationBtnDisabled: {
    opacity: 0.5,
  },

  paginationText: {
    fontSize: 12,
    color: Colors.title,
    fontWeight: "bold",
  },
});
