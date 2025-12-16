import { useState } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Colors } from "../shared/constants/Color";
import type { DrawerParamList, AppStackParamList } from "../navigation/types";

import DottedBackground from "../components/DottedBackground";
import Header from "../components/Header";
import UserMenuModal from "../components/UserMenuModal";
import SearchBar from "../components/SearchBar";
import CollectionList from "../components/CollectionList";
import FloatingAddButton from "../components/FloatingAddButton";
import CollectionActionModal from "../components/CollectionActionModal";

import { useAuth } from "../shared/context/AuthContext";
import { useSync } from "../shared/context/SyncContext";
import { useCollections, Collection } from "../features/collection";
import { CardService } from "../features/card/services/CardService";

type Props = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, "Home">,
  NativeStackScreenProps<AppStackParamList>
>;

export default function Home({ navigation }: Readonly<Props>) {
  const { user, logout } = useAuth();
  const { forceSync, syncStatus, checkAndSyncIfNeeded } = useSync();

  // Use custom hook for collections management
  const {
    collections,
    createCollection: createCollectionHook,
    deleteCollection: deleteCollectionHook,
  } = useCollections();

  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  /**
   * Handle manual sync (triggered by refresh button)
   */
  const handleManualSync = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (syncStatus.isRunning) {
      console.log("⏳ Sync already in progress, skipping...");
      return;
    }

    try {
      console.log("🔄 Manual sync triggered by user");
      const result = await forceSync();

      if (result?.success) {
        Alert.alert(
          "Sync Complete",
          `Synced ${result.pushedCount} local changes and pulled ${result.pulledCount} updates from cloud`
        );
      } else if (result) {
        Alert.alert(
          "Sync Failed",
          result.errors.length > 0 ? result.errors[0] : "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error during manual sync:", error);
      Alert.alert("Sync Error", "Failed to sync data");
    }
  };

  /**
   * Handle create collection
   */
  const handleCreateCollection = async (name: string) => {
    const success = await createCollectionHook(name);
    if (success) {
      Alert.alert("Success", `Collection "${name}" created successfully`);
    }
  };

  /**
   * Handle delete collection (soft delete)
   */
  const handleDeleteCollection = async (
    collectionId: string,
    collectionName: string
  ) => {
    const success = await deleteCollectionHook(collectionId);
    if (success) {
      Alert.alert("Success", `Collection "${collectionName}" deleted`);
    }
  };

  const handlePressCollection = (item: Collection) => {
    navigation.navigate("Study", {
      deckId: item.id,
      title: item.title,
    });
  };

  const handleLongPressCollection = (item: Collection) => {
    setSelectedCollection(item);
    setActionModalVisible(true);
  };

  const handleCloseActionModal = () => {
    setActionModalVisible(false);
    setSelectedCollection(null);
  };

  /**
   * Handle create card
   */
  const handleCreateCard = async (data: {
    collectionId: string;
    front: string;
    back: string;
  }) => {
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      const card = await CardService.createCard(
        data.collectionId,
        data.front,
        data.back
      );

      if (card) {
        console.log("Card created:", card.id);

        // ✅ Check if queue threshold reached and auto-sync if needed
        await checkAndSyncIfNeeded();

        Alert.alert("Success", "Card created successfully");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      Alert.alert("Error", "Failed to create card");
    }
  };

  const onAddCard = () => {
    handleCloseActionModal();
    console.log("Add card to:", selectedCollection?.title);
  };

  const onViewCards = () => {
    handleCloseActionModal();
    if (selectedCollection) {
      navigation.navigate("ViewAllCards", {
        collectionId: selectedCollection.id,
        collectionTitle: selectedCollection.title,
      });
    }
  };

  const onRename = () => {
    handleCloseActionModal();
    console.log("Rename:", selectedCollection?.title);
  };

  const onExport = () => {
    handleCloseActionModal();
    console.log("Export CSV:", selectedCollection?.title);
  };

  const onDelete = () => {
    handleCloseActionModal();

    if (!selectedCollection) return;

    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete "${selectedCollection.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            handleDeleteCollection(
              selectedCollection.id,
              selectedCollection.title
            );
          },
        },
      ]
    );
  };

  const filteredCollections = collections.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <DottedBackground />

      <Header
        streak={3}
        onAvatarPress={() => setShowMenu(true)}
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        onRefreshPress={handleManualSync}
        isSyncing={syncStatus.isRunning}
        pendingChanges={syncStatus.pendingChanges}
      />

      <UserMenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onLogout={logout}
        onAccountPress={() => navigation.navigate("UserProfile")}
        onChangePassword={() => navigation.navigate("ChangePassword")}
      />

      <CollectionActionModal
        visible={actionModalVisible}
        onClose={handleCloseActionModal}
        collection={selectedCollection}
        onAddCard={onAddCard}
        onViewCards={onViewCards}
        onRename={onRename}
        onExport={onExport}
        onDelete={onDelete}
      />

      <SearchBar value={search} onChangeText={setSearch} />

      {filteredCollections.length > 0 ? (
        <CollectionList
          data={filteredCollections}
          onPressItem={handlePressCollection}
          onLongPressItem={handleLongPressCollection}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No collection found</Text>
        </View>
      )}

      <FloatingAddButton
        onCreateCollection={handleCreateCollection}
        onCreateCard={handleCreateCard}
        onImport={() => console.log("Import Collection")}
        collections={collections.map((col) => ({
          id: col.id,
          name: col.title,
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    fontSize: 16,
    color: Colors.subText,
    fontStyle: "italic",
  },
});
