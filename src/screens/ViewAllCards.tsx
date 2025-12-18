import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";

import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../shared/types";
import { useCards } from "../features/card";
import { Colors } from "../shared/constants/Color";
import DottedBackground from "../components/DottedBackground";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const PAGE_SIZE = 30;

type SortType = "due_date" | "created" | "status";

interface ViewAllCardsProps {
  route: any;
  navigation: any;
}

// MOCK DATA
const MOCK_CARDS: Card[] = [
  {
    id: "1",
    collection_id: "1",
    front: "What is the capital of France?",
    back: "Paris",
    created_at: "2025-11-01T10:00:00Z",
    updated_at: "2025-12-05T15:30:00Z",
    due_date: "2025-12-08T00:00:00Z",
    interval: 3,
    ef: 2.5,
    status: "review",
    is_deleted: 0,
  },
  {
    id: "2",
    collection_id: "1",
    front: "What is 2 + 2?",
    back: "4",
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    due_date: "2025-12-12T00:00:00Z",
    interval: 0,
    ef: 2.5,
    status: "new",
    is_deleted: 0,
  },
  {
    id: "3",
    collection_id: "1",
    front: "What is the largest planet?",
    back: "Jupiter",
    created_at: "2025-11-15T10:00:00Z",
    updated_at: "2025-12-04T12:00:00Z",
    due_date: "2025-12-10T00:00:00Z",
    interval: 1,
    ef: 2.3,
    status: "learning",
    is_deleted: 0,
  },
  {
    id: "4",
    collection_id: "1",
    front: "What is photosynthesis?",
    back: "Process by which plants convert light to chemical energy",
    created_at: "2025-10-20T10:00:00Z",
    updated_at: "2025-12-03T14:00:00Z",
    due_date: "2025-12-15T00:00:00Z",
    interval: 5,
    ef: 2.6,
    status: "review",
    is_deleted: 0,
  },
  {
    id: "5",
    collection_id: "1",
    front: "What is the chemical symbol for Gold?",
    back: "Au",
    created_at: "2025-12-02T10:00:00Z",
    updated_at: "2025-12-02T10:00:00Z",
    due_date: "2025-12-11T00:00:00Z",
    interval: 0,
    ef: 2.5,
    status: "new",
    is_deleted: 0,
  },
];

export default function ViewAllCards({
  route,
  navigation,
}: Readonly<ViewAllCardsProps>) {
  const { collectionId, collectionTitle } = route.params;
  const { t } = useTranslation();

  // Use custom hook for cards management
  const {
    cards,
    updateCard: updateCardHook,
    deleteCard: deleteCardHook,
  } = useCards({ collectionId });

  // State
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState<SortType>("due_date");
  const [currentPage, setCurrentPage] = useState(0);

  const [detailsCard, setDetailsCard] = useState<Card | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  // Filter and sort
  const filteredAndSortedCards = useMemo(() => {
    let result = [...cards];

    // Search filter
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (card) =>
          card.front.toLowerCase().includes(query) ||
          card.back.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortType) {
      case "due_date":
        result.sort(
          (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        break;
      case "created":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "status": {
        const statusOrder = { new: 0, learning: 1, review: 2 };
        result.sort(
          (a, b) =>
            (statusOrder[a.status as keyof typeof statusOrder] || 999) -
            (statusOrder[b.status as keyof typeof statusOrder] || 999)
        );
        break;
      }
    }

    return result;
  }, [cards, searchText, sortType]);

  // Pagination
  const paginatedCards = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredAndSortedCards.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedCards, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCards.length / PAGE_SIZE);
  // Handlers
  const handleDeleteCard = async (cardId: string) => {
    const success = await deleteCardHook(cardId);
    if (success) {
      Alert.alert(t("common.success"), t("card.deleteSuccess"));
    }
  };

  const handleOpenDetails = (card: any) => {
    setDetailsCard(card);
    setEditFront(card.front);
    setEditBack(card.back);
    setDetailsModalVisible(true);
  };

  const handleUpdateCard = async () => {
    if (!detailsCard || !editFront.trim() || !editBack.trim()) {
      return;
    }

    const success = await updateCardHook(
      detailsCard.id,
      editFront.trim(),
      editBack.trim()
    );

    if (success) {
      // Update local modal state
      setDetailsCard({
        ...detailsCard,
        front: editFront.trim(),
        back: editBack.trim(),
      });
      setDetailsModalVisible(false);
      Alert.alert(t("common.success"), t("card.updateSuccess"));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
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

  // Card item renderer
  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => handleOpenDetails(item)}
    >
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
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.dueDate}>{formatDate(item.due_date)}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(t("card.deleteCard"), t("card.deleteCardConfirm"), [
              { text: t("common.cancel"), style: "cancel" },
              {
                text: t("common.delete"),
                style: "destructive",
                onPress: () => {
                  handleDeleteCard(item.id);
                },
              },
            ]);
          }}
          style={styles.actionBtn}
        >
          <Feather name="trash-2" size={18} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DottedBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{collectionTitle}</Text>
        <Text style={styles.cardCount}>{filteredAndSortedCards.length}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color={Colors.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("card.searchPlaceholder")}
          placeholderTextColor={Colors.gray}
          value={searchText}
          onChangeText={setSearchText}
        />
        {Boolean(searchText) && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Feather name="x" size={18} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sorting Tabs */}
      <View style={styles.sortContainer}>
        {(["due_date", "created", "status"] as SortType[]).map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[styles.sortBtn, sortType === sort && styles.sortBtnActive]}
            onPress={() => {
              setSortType(sort);
              setCurrentPage(0);
            }}
          >
            <Text
              style={[
                styles.sortBtnText,
                sortType === sort && styles.sortBtnTextActive,
              ]}
            >
              {sort === "due_date"
                ? t("card.sortByDueDate")
                : sort === "created"
                ? t("card.sortByCreated")
                : t("card.sortByStatus")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards List */}
      {filteredAndSortedCards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="inbox"
            size={48}
            color={Colors.gray}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyText}>
            {searchText ? t("card.noCardsFound") : t("card.noCards")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={paginatedCards}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 0}
            onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
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
            onPress={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            style={[
              styles.paginationBtn,
              currentPage === totalPages - 1 && styles.paginationBtnDisabled,
            ]}
          >
            <Feather name="chevron-right" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsModal}>
            {detailsCard && (
              <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsTitle}>
                    {t("card.cardDetails")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDetailsModalVisible(false)}
                  >
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
                    <Text style={styles.detailLabel}>
                      {t("card.frontText")}
                    </Text>
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
                              backgroundColor: getStatusColor(
                                detailsCard.status
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {detailsCard.status}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>
                          {t("card.dueDate")}
                        </Text>
                        <Text style={styles.statValue}>
                          {formatDate(detailsCard.due_date)}
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>
                          {t("card.intervalLabel")}
                        </Text>
                        <Text style={styles.statValue}>
                          {t("card.daysInterval", {
                            count: detailsCard.interval,
                          })}
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>
                          {t("card.easeFactorLabel")}
                        </Text>
                        <Text style={styles.statValue}>
                          {detailsCard.ef.toFixed(2)}
                        </Text>
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
                    <Text style={styles.updateButtonText}>
                      {t("card.update")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.header,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.title,
    flex: 1,
    marginLeft: 12,
  },
  cardCount: {
    fontSize: 14,
    color: Colors.subText,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.background,
    borderRadius: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: Colors.title,
  },
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: 12,
    color: Colors.title,
    fontWeight: "500",
  },
  sortBtnTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardFront: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.title,
  },
  cardBack: {
    fontSize: 13,
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
    fontSize: 11,
    color: Colors.white,
    fontWeight: "600",
  },
  dueDate: {
    fontSize: 11,
    color: Colors.gray,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.subText,
  },
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
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.title,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.title,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.title,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: "center",
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  detailsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  detailsModal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%",
    maxHeight: "85%",
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
  detailValueBox: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 60,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.title,
    lineHeight: 24,
  },
  editFieldInput: {
    backgroundColor: "#fff",
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
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#fff",
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
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subText,
    marginBottom: 6,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.title,
  },
});
