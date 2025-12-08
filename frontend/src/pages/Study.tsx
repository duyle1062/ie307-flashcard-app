import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Insets,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/types";

import { Colors } from "../const/Color";
import { Shadows } from "../const/Shadow";

import DottedBackground from "../components/DottedBackground";

import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";

type CardData = {
  id: string;
  frontText: string;
  backText: string;
  type: "new" | "learning" | "review";
};

type Counts = {
  new: number;
  learning: number;
  review: number;
};

interface StudyHeaderProps {
  insets: Insets;
  counts: Counts;
  canUndo: boolean;
  onBack: () => void;
  onUndo: () => void;
}

interface ActionButtonsProps {
  insets: Insets;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (difficulty: "again" | "hard" | "good" | "easy") => void;
}

const MOCK_CARDS: CardData[] = [
  {
    id: "1",
    frontText: "身体",
    backText: "しんたい\n(thân thể)\n\nTHÂN THỂ",
    type: "new",
  },
  {
    id: "2",
    frontText: "Hello",
    backText: "Xin chào\n(Lời chào thông thường)",
    type: "learning",
  },
  {
    id: "3",
    frontText: "Multi-line Test",
    // Test trường hợp text dài và nhiều dòng
    backText:
      "Dòng 1: Ví dụ về xuống dòng.\nDòng 2: React Native tự render cái này.\n\nDòng 4: Cách một dòng trống cũng ok. aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    type: "review",
  },
];

type Props = NativeStackScreenProps<AppStackParamList, "Study">;

export default function Study({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [counts, setCounts] = useState({ new: 20, learning: 15, review: 50 });
  const [history, setHistory] = useState<
    { index: number; counts: typeof counts }[]
  >([]);

  const currentCard = MOCK_CARDS[currentIndex % MOCK_CARDS.length];
  const isFirstCard = history.length === 0 && currentIndex === 0;

  // --- LOGIC HANDLERS ---
  const handleFlip = () => setIsFlipped(true);

  const handleNextCard = (difficulty: "again" | "hard" | "good" | "easy") => {
    // 1. Save History
    setHistory((prev) => [
      ...prev,
      { index: currentIndex, counts: { ...counts } },
    ]);

    // 2. Update Counts (Mock Logic)
    setCounts((prev) => {
      const newCounts = { ...prev };
      if (currentCard.type === "new" && newCounts.new > 0) newCounts.new--;
      else if (currentCard.type === "learning" && newCounts.learning > 0)
        newCounts.learning--;
      else if (currentCard.type === "review" && newCounts.review > 0)
        newCounts.review--;

      if (difficulty === "again") newCounts.learning++;
      return newCounts;
    });

    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setCurrentIndex(lastState.index);
    setCounts(lastState.counts);
    setIsFlipped(false);
    setHistory((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <DottedBackground />

      {/* 1. Header Section */}
      <StudyHeader
        insets={insets}
        onBack={() => navigation.goBack()}
        onUndo={handleUndo}
        canUndo={!isFirstCard}
        counts={counts}
      />

      {/* 2. Main Card Area (Responsive) */}
      <View style={styles.cardArea}>
        <FlashCard data={currentCard} isFlipped={isFlipped} />
      </View>

      {/* 3. Bottom Actions */}
      <ActionButtons
        insets={insets}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        onRate={handleNextCard}
      />
    </View>
  );
}

// ======================= SUB COMPONENTS =======================

// --- HEADER COMPONENT ---
const StudyHeader = ({ insets, onBack, onUndo, canUndo, counts }: any) => (
  <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
        <Feather name="chevron-left" size={28} color={Colors.title} />
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={onUndo}
        disabled={!canUndo}
        style={[styles.iconBtn, !canUndo && { opacity: 0.3 }]}
      >
        <MaterialCommunityIcons
          name="arrow-u-left-top"
          size={24}
          color={Colors.title}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconBtn}>
        <Entypo name="dots-three-vertical" size={20} color={Colors.title} />
      </TouchableOpacity>
    </View>

    <View style={styles.statusBarStripe}>
      <Text style={styles.statusLabel}>
        New: <Text style={{ color: Colors.blue }}>{counts.new}</Text>
      </Text>
      <Text style={styles.statusLabel}>
        Learn: <Text style={{ color: Colors.red }}>{counts.learning}</Text>
      </Text>
      <Text style={styles.statusLabel}>
        Review: <Text style={{ color: Colors.green }}>{counts.review}</Text>
      </Text>
    </View>
  </View>
);

// --- FLASH CARD COMPONENT ---
const FlashCard = ({
  data,
  isFlipped,
}: {
  data: CardData;
  isFlipped: boolean;
}) => (
  <View style={styles.cardWrapper}>
    {/* ScrollView allows content to be larger than the card height */}
    <ScrollView
      contentContainerStyle={styles.cardScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.textFront}>{data.frontText}</Text>

      {isFlipped && (
        <View style={styles.backContent}>
          <View style={styles.divider} />
          <Text style={styles.textBack}>{data.backText}</Text>
        </View>
      )}
    </ScrollView>
  </View>
);

// --- ACTION BUTTONS COMPONENT ---
const ActionButtons = ({ insets, isFlipped, onFlip, onRate }: any) => (
  <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
    {!isFlipped ? (
      <TouchableOpacity style={styles.showAnswerBtn} onPress={onFlip}>
        <Text style={styles.showAnswerText}>SHOW ANSWER</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.ratingContainer}>
        <RatingButton
          label="Again"
          time="< 1m"
          color={Colors.red}
          onPress={() => onRate("again")}
        />
        <RatingButton
          label="Hard"
          time="2d"
          color={Colors.gray}
          onPress={() => onRate("hard")}
        />
        <RatingButton
          label="Good"
          time="4d"
          color={Colors.green}
          onPress={() => onRate("good")}
        />
        <RatingButton
          label="Easy"
          time="7d"
          color={Colors.blue}
          onPress={() => onRate("easy")}
        />
      </View>
    )}
  </View>
);

const RatingButton = ({ label, time, color, onPress }: any) => (
  <TouchableOpacity
    style={[styles.ratingBtn, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.ratingLabel}>{label}</Text>
    <Text style={styles.ratingTime}>{time}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
