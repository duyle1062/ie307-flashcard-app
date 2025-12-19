// components/StreakModal.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  addDays,
  subDays,
} from "date-fns";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

const { width } = Dimensions.get("window");
const CELL_SIZE = (width - 100) / 7;

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
  studyDays?: Date[];
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

const calculateStreaks = (studyDays: Date[]): StreakResult => {
  if (studyDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDays = [...studyDays]
    .map((d) => {
      const normalized = new Date(d);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    })
    .sort((a, b) => a.getTime() - b.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const lastStudyDay = sortedDays[sortedDays.length - 1];
  const daysSinceLastStudy =
    (today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLastStudy > 1) {
    currentStreak = 0;
  } else {
    currentStreak = 1;
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const prev = sortedDays[i];
      const next = sortedDays[i + 1];
      const diff = (next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = sortedDays[i - 1];
    const curr = sortedDays[i];
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
};

const StreakModal: React.FC<StreakModalProps> = ({
  visible,
  onClose,
  studyDays,
}) => {
  const mockStudyDays: Date[] = [
    new Date(2025, 10, 19),
    new Date(2025, 10, 20),
    new Date(2025, 10, 21),
    new Date(2025, 10, 22),
    new Date(2025, 10, 23),
    new Date(2025, 10, 24),
    new Date(2025, 10, 25),
    new Date(2025, 10, 26),
    new Date(2025, 10, 27),
    new Date(2025, 10, 28),
    new Date(2025, 10, 29),
    new Date(2025, 10, 30),

    new Date(2025, 9, 5),
    new Date(2025, 9, 6),
    new Date(2025, 9, 7),
    new Date(2025, 9, 8),

    new Date(2025, 11, 10),
    new Date(2025, 11, 11),
    new Date(2025, 11, 12),
    new Date(2025, 11, 13),
    new Date(2025, 11, 14),
    new Date(2025, 11, 15),

    new Date(2025, 11, 17),
  ];

  const daysToUse =
    studyDays && studyDays.length > 0 ? studyDays : mockStudyDays;

  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { currentStreak, longestStreak } = calculateStreaks(daysToUse);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const leadingEmptyDays = (firstDayOfWeek + 6) % 7;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isStudyDay = (day: Date): boolean => {
    const normalized = new Date(day);
    normalized.setHours(0, 0, 0, 0);
    return daysToUse.some((d) => {
      const studyNormalized = new Date(d);
      studyNormalized.setHours(0, 0, 0, 0);
      return studyNormalized.getTime() === normalized.getTime();
    });
  };

  const getStreakPosition = (
    day: Date
  ): "single" | "start" | "middle" | "end" | null => {
    if (!isStudyDay(day)) return null;

    let start = new Date(day);
    let end = new Date(day);

    while (isStudyDay(subDays(start, 1))) {
      start = subDays(start, 1);
    }

    while (isStudyDay(addDays(end, 1))) {
      end = addDays(end, 1);
    }

    const length =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;

    if (length === 1) return "single";
    if (isSameDay(day, start)) return "start";
    if (isSameDay(day, end)) return "end";
    return "middle";
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.mainFireIcon}>
              <Text style={styles.streakTitle}>STREAK</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={28} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* 2 Ô STREAK */}
          <View style={styles.streakRows}>
            <View style={styles.streakBox}>
              <View style={styles.streakContent}>
                <AntDesign name="fire" size={32} color={Colors.redLight} />
                <Text style={styles.streakNumber}>{currentStreak}</Text>
              </View>
              <Text style={styles.streakLabel}>Current streak</Text>
            </View>

            <View style={styles.streakBox}>
              <View style={styles.streakContent}>
                <Feather name="award" size={30} color={Colors.secondary} />
                <Text style={styles.streakNumber}>{longestStreak}</Text>
              </View>
              <Text style={styles.streakLabel}>Longest streak</Text>
            </View>
          </View>

          {/* CALENDAR */}
          <View style={[styles.calendarCard, Shadows.medium]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth}>
                <Feather name="chevron-left" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {format(currentMonth, "MMMM yyyy").toUpperCase()}
              </Text>
              <TouchableOpacity onPress={nextMonth}>
                <Feather
                  name="chevron-right"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: leadingEmptyDays }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}

              {days.map((day) => {
                const studied = isStudyDay(day);
                const today = isToday(day);
                const position = getStreakPosition(day);

                let cellStyles: ViewStyle[] = [];

                if (studied && position) {
                  const isPrevStudied =
                    isStudyDay(subDays(day, 1)) &&
                    isSameMonth(subDays(day, 1), currentMonth);
                  const isNextStudied =
                    isStudyDay(addDays(day, 1)) &&
                    isSameMonth(addDays(day, 1), currentMonth);

                  if (position === "single") {
                    cellStyles = [styles.studiedDay];
                  } else {
                    cellStyles = [styles.streakBar];

                    if (!isPrevStudied) {
                      cellStyles.push(styles.streakStart);
                    }
                    if (!isNextStudied) {
                      cellStyles.push(styles.streakEnd);
                    }

                    if (position === "start" || position === "end") {
                      cellStyles.push(styles.studiedDayOverride);
                    }
                  }
                }

                return (
                  <View
                    key={day.toString()}
                    style={[
                      styles.dayCell,
                      ...cellStyles,
                      today && styles.todayHighlight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !isSameMonth(day, currentMonth) && styles.outsideMonth,
                        studied && styles.studiedText,
                        today && styles.todayText,
                      ]}
                    >
                      {format(day, "d")}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.motivationText}>Keep the streak going! 🔥</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalbg,
    justifyContent: "flex-start",
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    ...Shadows.strong,
  },
  header: {
    backgroundColor: Colors.header,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tertiary,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  mainFireIcon: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  streakTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  streakRows: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 25,
    ...Shadows.strong,
  },
  streakBox: {
    flex: 1,
    alignItems: "center",
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginLeft: 10,
  },
  streakLabel: {
    fontSize: 14,
    color: Colors.title,
    textAlign: "center",
  },
  calendarCard: {
    backgroundColor: Colors.white,
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    paddingVertical: 20,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.title,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  weekDayText: {
    width: CELL_SIZE,
    textAlign: "center",
    color: Colors.subText,
    fontSize: 16,
    fontWeight: "600",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  streakBar: {
    backgroundColor: `${Colors.tertiary}80`, // Nhạt 50%
  },
  studiedDay: {
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
  },
  studiedDayOverride: {
    backgroundColor: Colors.tertiary,
  },
  streakStart: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  streakEnd: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  todayHighlight: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  dayText: {
    fontSize: 14,
    color: Colors.title,
  },
  outsideMonth: {
    color: Colors.subText,
    opacity: 0.4,
  },
  studiedText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  todayText: {
    color: Colors.secondary,
    fontWeight: "bold",
  },
  motivationText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.primary,
    fontStyle: "italic",
    paddingBottom: 30,
  },
});

export default StreakModal;
