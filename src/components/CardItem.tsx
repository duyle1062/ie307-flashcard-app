import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

import { useTranslation } from "react-i18next";

import Feather from "@expo/vector-icons/Feather";

import { Card } from "../shared/types";

import { Colors } from "../shared/constants/Color";

interface CardItemProps {
  item: Card;
  onPress: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardItem({ item, onPress, onDelete }: CardItemProps) {
  const { t, i18n } = useTranslation();

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

  const handleDeletePress = () => {
    Alert.alert(t("card.deleteCard"), t("card.deleteCardConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => onDelete(item.id),
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.cardItem} onPress={() => onPress(item)}>
      <View style={styles.cardContent}>
        <Text style={styles.cardFront} numberOfLines={1}>
          {item.front}
        </Text>
        <Text style={styles.cardBack} numberOfLines={1}>
          {item.back}
        </Text>
        <View style={styles.cardMeta}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
          <Text style={styles.dueDate}>{formatDate(item.due_date)}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={handleDeletePress} style={styles.actionBtn}>
          <Feather name="trash-2" size={18} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },

  cardContent: {
    flex: 1,
    gap: 4,
  },

  cardFront: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.title,
  },

  cardBack: {
    fontSize: 14,
    color: Colors.subText,
  },

  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },

  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: "bold",
  },

  dueDate: {
    fontSize: 12,
    color: Colors.title,
  },

  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },

  actionBtn: {
    padding: 8,
  },
});
