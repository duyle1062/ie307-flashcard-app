import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/types";
import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";
import DottedBackground from "../components/DottedBackground";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";
import { useAuth } from "../shared/context/AuthContext";
import { useStudy } from "../features/card/hooks/useStudy";
// Import helper để tính thời gian hiển thị
import { formatIntervalForButton } from "../core/database/spacedRepetition";
import { Card } from "../shared/types";

type Props = NativeStackScreenProps<AppStackParamList, "Study">;

export default function Study({ navigation, route }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { deckId } = route.params;
  const { user } = useAuth();

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

  // Không cần alert, UI sẽ hiển thị finish screen tự động

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <DottedBackground />
        <Text style={styles.loadingText}>Preparing session...</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <DottedBackground />
        <StudyHeader insets={insets} onBack={() => navigation.goBack()} counts={stats} canUndo={false} />
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>You are all caught up!</Text>
          <Text style={styles.subText}>No cards due for this collection.</Text>
        </View>
      </View>
    );
  }

  // Hiển thị finish screen khi học xong hết cards trong ngày
  if (isFinished) {
    return (
      <View style={styles.container}>
        <DottedBackground />
        <StudyHeader insets={insets} onBack={() => navigation.goBack()} counts={stats} canUndo={false} />
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="check-circle" size={80} color={Colors.green} />
          <Text style={styles.emptyTitle}>Congratulations!</Text>
          <Text style={styles.subText}>You've completed all cards for today.</Text>
          <Text style={[styles.subText, { marginTop: 8 }]}>
            Come back tomorrow for more reviews!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DottedBackground />
      <StudyHeader insets={insets} onBack={() => navigation.goBack()} canUndo={false} counts={stats} />
      
      <View style={styles.cardArea}>
        {currentCard && (
          <FlashCard front={currentCard.front} back={currentCard.back} isFlipped={isFlipped} />
        )}
      </View>

      <ActionButtons
        insets={insets}
        isFlipped={isFlipped}
        currentCard={currentCard} // Truyền card hiện tại xuống để tính giờ
        onFlip={handleFlip}
        onRate={(rating) => handleRate(rating)}
      />
    </View>
  );
}

// --- SUB COMPONENTS ---

const StudyHeader = ({ insets, onBack, counts }: any) => (
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
      <Text style={styles.statusLabel}>New: <Text style={{ color: Colors.blue }}>{counts.new}</Text></Text>
      <Text style={styles.statusLabel}>Learning: <Text style={{ color: Colors.red }}>{counts.learning}</Text></Text>
      <Text style={styles.statusLabel}>Review: <Text style={{ color: Colors.green }}>{counts.review}</Text></Text>
    </View>
  </View>
);

const FlashCard = ({ front, back, isFlipped }: any) => (
  <View style={styles.cardWrapper}>
    <ScrollView contentContainerStyle={styles.cardScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.textFront}>{front}</Text>
      {isFlipped && (
        <View style={styles.backContent}>
          <View style={styles.divider} />
          <Text style={styles.textBack}>{back}</Text>
        </View>
      )}
    </ScrollView>
  </View>
);

interface ActionButtonsProps {
  insets: any;
  isFlipped: boolean;
  currentCard?: Card;
  onFlip: () => void;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

const ActionButtons = ({ insets, isFlipped, currentCard, onFlip, onRate }: ActionButtonsProps) => {
  // Tính toán thời gian hiển thị động (sử dụng helper chuyên dụng)
  const getLabel = (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return "-";
    return formatIntervalForButton(currentCard, rating);
  };

  return (
    <View style={[styles.bottomContainer, { paddingBottom: (insets.bottom || 0) + 20 }]}>
      {isFlipped && currentCard ? (
        <View style={styles.ratingContainer}>
          <RatingButton label="Again" time={getLabel(1)} color={Colors.red} onPress={() => onRate(1)} />
          <RatingButton label="Hard" time={getLabel(2)} color={Colors.gray} onPress={() => onRate(2)} />
          <RatingButton label="Good" time={getLabel(3)} color={Colors.green} onPress={() => onRate(3)} />
          <RatingButton label="Easy" time={getLabel(4)} color={Colors.blue} onPress={() => onRate(4)} />
        </View>
      ) : (
        <TouchableOpacity style={styles.showAnswerBtn} onPress={onFlip}>
          <Text style={styles.showAnswerText}>SHOW ANSWER</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const RatingButton = ({ label, time, color, onPress }: any) => (
  <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.ratingLabel}>{label}</Text>
    <Text style={styles.ratingTime}>{time}</Text>
  </TouchableOpacity>
);

// --- STYLES ---
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
  headerContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    fontWeight: "600",
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: "100%",
    height: "100%",
    maxHeight: 600,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.gold,
    ...Shadows.medium,
    overflow: "hidden",
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  textFront: {
    fontSize: 42,
    color: Colors.title,
    textAlign: "center",
    fontWeight: "400",
  },
  backContent: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  textBack: {
    fontSize: 28,
    color: Colors.title,
    textAlign: "center",
    lineHeight: 40,
  },
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
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 2,
  },
});