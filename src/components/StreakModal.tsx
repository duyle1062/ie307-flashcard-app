import { useState, useMemo } from "react";
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
import { useTranslation } from "react-i18next";

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
  parseISO,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import { vi, enUS } from "date-fns/locale";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

const { width } = Dimensions.get("window");
const CELL_SIZE = (width - 100) / 7;

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
  currentStreak: number;
  studyHistory: string[];
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

const calculateStats = (dates: string[], currentVal: number) => {
  if (!dates || dates.length === 0)
    return { current: currentVal, longest: currentVal };

  const sortedDates = Array.from(new Set(dates))
    .map((d) => startOfDay(parseISO(d)))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length === 0)
    return { current: currentVal, longest: currentVal };

  let maxStreak = 1;
  let tempStreak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDay = sortedDates[i];
    const nextDay = sortedDates[i + 1];

    const diff = differenceInCalendarDays(nextDay, currentDay);

    if (diff === 1) {
      tempStreak++;
    } else {
      maxStreak = Math.max(maxStreak, tempStreak);
      tempStreak = 1;
    }
  }

  maxStreak = Math.max(maxStreak, tempStreak);

  return {
    current: currentVal,
    longest: Math.max(maxStreak, currentVal),
  };
};

const StreakModal: React.FC<StreakModalProps> = ({
  visible,
  onClose,
  currentStreak = 0,
  studyHistory = [],
}) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dateLocale = i18n.language === "vi" ? vi : enUS;

  const stats = useMemo(() => {
    return calculateStats(studyHistory, currentStreak);
  }, [studyHistory, currentStreak]);

  const studyDaysSet = useMemo(() => new Set(studyHistory), [studyHistory]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const leadingEmptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isStudyDay = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return studyDaysSet.has(dateStr);
  };

  const getStreakPosition = (
    day: Date
  ): "single" | "start" | "middle" | "end" | null => {
    if (!isStudyDay(day)) return null;

    const prevDate = subDays(day, 1);
    const nextDate = addDays(day, 1);
    const hasPrev = isStudyDay(prevDate);
    const hasNext = isStudyDay(nextDate);

    if (hasPrev && hasNext) return "middle";
    if (!hasPrev && hasNext) return "start";
    if (hasPrev && !hasNext) return "end";
    return "single";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.modalContainer, { marginTop: insets.top + 40 }]}
        >
          {/* --- HEADER (STYLE CŨ) --- */}
          <View style={styles.header}>
            <View style={styles.mainFireIcon}>
              <Text style={styles.streakTitle}>{t("components.streak")}</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={28} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* --- 2 Ô STREAK (STYLE CŨ) --- */}
          <View style={styles.streakRows}>
            <View style={styles.streakBox}>
              <View style={styles.streakContent}>
                <AntDesign name="fire" size={32} color="orange" />
                <Text style={styles.streakNumber}>{stats.current}</Text>
              </View>
              <Text style={styles.streakLabel}>
                {t("components.currentStreak")}
              </Text>
            </View>

            <View style={styles.streakBox}>
              <View style={styles.streakContent}>
                <Feather name="award" size={30} color={Colors.secondary} />
                <Text style={styles.streakNumber}>{stats.longest}</Text>
              </View>
              <Text style={styles.streakLabel}>
                {t("components.longestStreak")}
              </Text>
            </View>
          </View>

          {/* --- CALENDAR CARD (STYLE CŨ) --- */}
          <View style={[styles.calendarCard, Shadows.medium]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth}>
                <Feather name="chevron-left" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {format(currentMonth, "MMMM yyyy", {
                  locale: dateLocale,
                }).toUpperCase()}
              </Text>
              <TouchableOpacity onPress={nextMonth}>
                <Feather
                  name="chevron-right"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Week Headers: Mon, Tue, Wed... */}
            <View style={styles.weekDays}>
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {t(`components.${day}`)}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: leadingEmptyDays }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}

              {daysInMonth.map((day) => {
                const studied = isStudyDay(day);
                const today = isToday(day);
                const position = getStreakPosition(day);

                // --- LOGIC STYLE CŨ ---
                let cellStyles: ViewStyle[] = [];

                if (studied && position) {
                  const isPrevStudied = isStudyDay(subDays(day, 1));
                  const isNextStudied = isStudyDay(addDays(day, 1));

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

          <Text style={styles.motivationText}>
            {t("components.keepStreakGoing")}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
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
    fontWeight: "bold",
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
    backgroundColor: Colors.tertiary + "80",
    borderRadius: 0,
  },

  studiedDay: {
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
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
    borderRadius: 12,
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
