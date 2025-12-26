import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import Feather from "@expo/vector-icons/Feather";
import { Card } from "../shared/types";
import { Colors } from "../shared/constants/Color";

interface CardDetailsModalProps {
  visible: boolean;
  card: Card | null;
  onClose: () => void;
  onUpdate: (cardId: string, front: string, back: string) => Promise<boolean>;
}

export default function CardDetailsModal({
  visible,
  card,
  onClose,
  onUpdate,
}: CardDetailsModalProps) {
  const { t, i18n } = useTranslation();
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  useEffect(() => {
    if (card) {
      setEditFront(card.front);
      setEditBack(card.back);
    }
  }, [card]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(i18n.language, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return Colors.blue;
      case "learning":
        return Colors.gold;
      case "review":
        return Colors.green;
      default:
        return Colors.gray;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return t("study.newLabel");
      case "learning":
        return t("study.learnLabel");
      case "review":
        return t("study.reviewLabel");
      default:
        return status;
    }
  };

  const handleUpdateCard = async () => {
    if (!card || !editFront.trim() || !editBack.trim()) {
      return;
    }

    const success = await onUpdate(card.id, editFront.trim(), editBack.trim());

    if (success) {
      onClose();
      Alert.alert(t("common.success"), t("card.updateSuccess"));
    }
  };

  if (!card) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.detailsOverlay}>
        <View style={styles.detailsModal}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>{t("card.cardDetails")}</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
              bounces={false}
            >
              {/* Front Field */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>{t("card.frontText")}</Text>
                <TextInput
                  style={styles.editFieldInput}
                  value={editFront}
                  onChangeText={setEditFront}
                  multiline
                  maxLength={500}
                  placeholderTextColor={Colors.gray}
                  placeholder={t("card.enterFront")}
                />
              </View>

              {/* Back Field */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>{t("card.backText")}</Text>
                <TextInput
                  style={styles.editFieldInput}
                  value={editBack}
                  onChangeText={setEditBack}
                  multiline
                  maxLength={500}
                  placeholderTextColor={Colors.gray}
                  placeholder={t("card.enterBack")}
                />
              </View>

              {/* Stats Section */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>
                  {t("card.cardStatistics")}
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>
                      {t("card.statusLabel")}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(card.status),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(card.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{t("card.dueDate")}</Text>
                    <Text style={styles.statValue}>
                      {formatDate(card.due_date)}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>
                      {t("card.intervalLabel")}
                    </Text>
                    <Text style={styles.statValue}>
                      {t("card.daysInterval", { count: card.interval })}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>
                      {t("card.easeFactorLabel")}
                    </Text>
                    <Text style={styles.statValue}>{card.ef.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Update Button */}
            <View style={styles.updateButtonContainer}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateCard}
              >
                <Text style={styles.updateButtonText}>{t("card.update")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  detailsOverlay: {
    flex: 1,
    backgroundColor: Colors.modalbg,
    justifyContent: "flex-end",
  },

  detailsModal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%",
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.title,
  },

  detailSection: {
    marginBottom: 24,
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.subText,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  editFieldInput: {
    backgroundColor: Colors.white,
    padding: 16,
    color: Colors.title,
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    minHeight: 60,
    maxHeight: 200,
    textAlignVertical: "top",
  },

  updateButtonContainer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingBottom: 60,
  },

  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  statsSection: {
    marginTop: 8,
  },

  statsSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.subText,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.subText,
    marginBottom: 6,
    fontWeight: "bold",
  },

  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.title,
  },

  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: "bold",
  },
});
