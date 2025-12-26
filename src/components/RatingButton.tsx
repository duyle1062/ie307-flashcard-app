import { Text, StyleSheet, TouchableOpacity } from "react-native";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

interface RatingButtonProps {
  label: string;
  time: string;
  color: string;
  onPress: () => void;
}

export default function RatingButton({
  label,
  time,
  color,
  onPress,
}: RatingButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.ratingBtn, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.ratingLabel}>{label}</Text>
      <Text style={styles.ratingTime}>{time}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ratingBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.light,
  },

  ratingLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  ratingTime: {
    color: Colors.white,
    fontSize: 11,
    marginTop: 2,
  },
});
