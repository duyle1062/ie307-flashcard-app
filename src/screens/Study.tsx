import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { AppStackParamList } from "../navigation/types";

import { Colors } from "../shared/constants/Color";

import DottedBackground from "../components/DottedBackground";
import StudyHeader from "../components/StudyHeader";
import FlashCard from "../components/FlashCard";
import StudyActionButtons from "../components/StudyActionButtons";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAuth } from "../shared/context/AuthContext";

import { useStudy } from "../features/card/hooks/useStudy";

type Props = NativeStackScreenProps<AppStackParamList, "Study">;

export default function Study({ navigation, route }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { deckId } = route.params;
  const { user } = useAuth();
  const { t } = useTranslation();

  const {
    currentCard,
    isFlipped,
    isLoading,
    isFinished,
    isEmpty,
    stats,
    handleFlip,
    handleRate,
  } = useStudy({
    collectionId: deckId,
    userId: user?.uid || (user as any)?.id,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <DottedBackground />
        <Text style={styles.loadingText}>{t("study.loading")}</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <DottedBackground />
        <StudyHeader
          insets={insets}
          onBack={() => navigation.goBack()}
          counts={stats}
          canUndo={false}
        />
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>{t("study.allCaughtUp")}</Text>
          <Text style={styles.subText}>{t("study.noCardsInCollection")}</Text>
        </View>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <DottedBackground />

        <StudyHeader
          insets={insets}
          onBack={() => navigation.goBack()}
          counts={stats}
          canUndo={false}
        />
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="check-circle"
            size={80}
            color={Colors.green}
          />
          <Text style={styles.emptyTitle}>{t("study.congratulations")}</Text>
          <Text style={styles.subText}>{t("study.completedToday")}</Text>
          <Text style={[styles.subText, { marginTop: 8 }]}>
            {t("study.comeBackTomorrow")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DottedBackground />
      <StudyHeader
        insets={insets}
        onBack={() => navigation.goBack()}
        canUndo={false}
        counts={stats}
      />

      <View style={styles.cardArea}>
        {currentCard && (
          <FlashCard
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={isFlipped}
          />
        )}
      </View>

      <StudyActionButtons
        insets={insets}
        isFlipped={isFlipped}
        currentCard={currentCard}
        onFlip={handleFlip}
        onRate={(rating) => handleRate(rating)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.subText,
    marginTop: 20,
  },

  emptyTitle: {
    fontSize: 18,
    color: Colors.title,
    fontWeight: "bold",
  },

  subText: {
    fontSize: 14,
    color: Colors.subText,
    marginTop: 8,
  },

  cardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
});
