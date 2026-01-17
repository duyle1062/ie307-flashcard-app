import { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";

import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../shared/types";

import { useCards } from "../features/card";

import { Colors } from "../shared/constants/Color";

import DottedBackground from "../components/DottedBackground";
import CardItem from "../components/CardItem";
import SortTabs from "../components/SortTabs";
import PaginationControls from "../components/PaginationControls";
import CardDetailsModal from "../components/CardDetailsModal";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

const PAGE_SIZE = 30;

type SortType = "due_date" | "created" | "status";

interface ViewAllCardsProps {
  route: any;
  navigation: any;
}

export default function ViewAllCards({
  route,
  navigation,
}: Readonly<ViewAllCardsProps>) {
  const { t } = useTranslation();
  const { collectionId, collectionTitle } = route.params;

  const {
    cards,
    updateCard: updateCardHook,
    deleteCard: deleteCardHook,
  } = useCards({ collectionId });

  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState<SortType>("due_date");
  const [currentPage, setCurrentPage] = useState(0);

  const [detailsCard, setDetailsCard] = useState<Card | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const filteredAndSortedCards = useMemo(() => {
    let result = [...cards];

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (card) =>
          (card.front || "").toLowerCase().includes(query) ||
          (card.back || "").toLowerCase().includes(query)
      );
    }

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

  const paginatedCards = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredAndSortedCards.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedCards, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCards.length / PAGE_SIZE);

  const handleDeleteCard = async (cardId: string) => {
    const success = await deleteCardHook(cardId);
    if (success) {
      Alert.alert(t("common.success"), t("card.deleteSuccess"));
    }
  };

  const handleOpenDetails = (card: Card) => {
    setDetailsCard(card);
    setDetailsModalVisible(true);
  };

  const handleUpdateCard = async (
    cardId: string,
    front: string,
    back: string
  ) => {
    const success = await updateCardHook(cardId, front, back);
    return success;
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <CardItem
      item={item}
      onPress={handleOpenDetails}
      onDelete={handleDeleteCard}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <DottedBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{collectionTitle}</Text>
        <View style={styles.cardCountContainer}>
          <Text style={styles.cardCount}>{filteredAndSortedCards.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color={Colors.subText}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("card.searchPlaceholder")}
          placeholderTextColor={Colors.subText}
          value={searchText}
          onChangeText={setSearchText}
        />
        {Boolean(searchText) && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Feather name="x" size={18} color={Colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sorting Tabs */}
      <SortTabs
        sortType={sortType}
        onSortChange={(sort) => {
          setSortType(sort);
          setCurrentPage(0);
        }}
      />

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
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Details Modal */}
      <CardDetailsModal
        visible={detailsModalVisible}
        card={detailsCard}
        onClose={() => setDetailsModalVisible(false)}
        onUpdate={handleUpdateCard}
      />
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
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    flex: 1,
    marginLeft: 12,
  },

  cardCountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  cardCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.white,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: Colors.subText,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontWeight: "bold",
    color: Colors.title,
  },

  modalContent: {
    flex: 1,
    padding: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
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
    fontWeight: "bold",
    fontSize: 14,
  },
});
