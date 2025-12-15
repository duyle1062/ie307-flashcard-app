import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import { DrawerActions } from "@react-navigation/native";

import { Colors } from "../const/Color";

import DottedBackground from "../components/DottedBackground";
import Header from "../components/Header";
import UserMenuModal from "../components/UserMenuModal";
import SearchBar from "../components/SearchBar";
import CollectionList, { Collection } from "../components/CollectionList";
import FloatingAddButton from "../components/FloatingAddButton";
import CollectionActionModal from "../components/CollectionActionModal";

import { useAuth } from "../context/AuthContext";

import { useSync } from "../hooks/useSync";

import {
  getCollectionsByUserId,
  createCollection,
  deleteCollection,
} from "../database/repositories/CollectionRepository";
import { createCard } from "../database/repositories/CardRepository";

export default function Home({ navigation }: any) {
  const { user, logout } = useAuth();
  const { checkAndSyncIfNeeded, forceSync, syncStatus } = useSync();
  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  // Collections state - will be loaded from local DB
  const [collections, setCollections] = useState<Collection[]>([]);

  /**
   * Load collections from local DB
   */
  const loadCollections = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const dbCollections = await getCollectionsByUserId(user.uid);

      // Transform to UI format with mock status values for now
      const transformedCollections: Collection[] = dbCollections.map((col) => ({
        id: col.id,
        title: col.name,
        new: 0, // TODO: Calculate from cards
        learning: 0, // TODO: Calculate from cards
        review: 0, // TODO: Calculate from cards
      }));

      setCollections(transformedCollections);
    } catch (error) {
      console.error("Error loading collections:", error);
      Alert.alert("Error", "Failed to load collections");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Load collections on mount
   */
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

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
        // Reload collections after sync
        await loadCollections();

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
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      // Create collection in local DB (will auto-add to sync_queue)
      const newCollection = await createCollection(user.uid, name);

      if (newCollection) {
        console.log("Collection created:", newCollection.name);

        // Reload collections to show the new one
        await loadCollections();

        // ✅ Check if queue threshold reached and auto-sync if needed
        await checkAndSyncIfNeeded();

        Alert.alert("Success", `Collection "${name}" created successfully`);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      Alert.alert("Error", "Failed to create collection");
    }
  };

  /**
   * Handle delete collection (soft delete)
   */
  const handleDeleteCollection = async (
    collectionId: string,
    collectionName: string
  ) => {
    try {
      // Soft delete in local DB (will auto-add to sync_queue)
      const success = await deleteCollection(collectionId);

      if (success) {
        console.log("Collection soft-deleted:", collectionName);

        // Reload collections to remove the deleted one
        await loadCollections();

        // ✅ Check if queue threshold reached and auto-sync if needed
        await checkAndSyncIfNeeded();

        Alert.alert("Success", `Collection "${collectionName}" deleted`);
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      Alert.alert("Error", "Failed to delete collection");
    }
  };

  /**
   * Handle create card
   */
  const handleCreateCard = async (data: {
    collectionId: string;
    front: string;
    back: string;
  }) => {
    try {
      const card = await createCard(data.collectionId, data.front, data.back);

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

  const onAddCard = () => {
    handleCloseActionModal();
    console.log("Add card to:", selectedCollection?.title);
    // navigation.navigate("AddCard", { id: selectedCollection?.id });
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
