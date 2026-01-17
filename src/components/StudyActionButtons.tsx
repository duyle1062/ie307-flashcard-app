import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import { Card } from "../shared/types";

import { formatIntervalForButton } from "../core/database/spacedRepetition";

import RatingButton from "./RatingButton";

interface StudyActionButtonsProps {
  insets: EdgeInsets;
  isFlipped: boolean;
  currentCard?: Card;
  onFlip: () => void;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

export default function StudyActionButtons({
  insets,
  isFlipped,
  currentCard,
  onFlip,
  onRate,
}: StudyActionButtonsProps) {
  const { t } = useTranslation();

  const getLabel = (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return "-";
    return formatIntervalForButton(currentCard, rating);
  };

  return (
    <View
      style={[
        styles.bottomContainer,
        { paddingBottom: (insets.bottom || 0) + 20 },
      ]}
    >
      {isFlipped && currentCard ? (
        <View style={styles.ratingContainer}>
          <RatingButton
            label={t("study.again")}
            time={getLabel(1)}
            color={Colors.red}
            onPress={() => onRate(1)}
          />
          <RatingButton
            label={t("study.hardDifficulty")}
            time={getLabel(2)}
            color={Colors.gray}
            onPress={() => onRate(2)}
          />
          <RatingButton
            label={t("study.good")}
            time={getLabel(3)}
            color={Colors.green}
            onPress={() => onRate(3)}
          />
          <RatingButton
            label={t("study.easy")}
            time={getLabel(4)}
            color={Colors.blue}
            onPress={() => onRate(4)}
          />
        </View>
      ) : (
        <TouchableOpacity style={styles.showAnswerBtn} onPress={onFlip}>
          <Text style={styles.showAnswerText}>
            {t("study.showAnswer").toUpperCase()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    paddingHorizontal: 20,
    justifyContent: "flex-end",
  },

  showAnswerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    ...Shadows.medium,
  },

  showAnswerText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
