import { useState } from "react";
import { View, StyleSheet, Alert, Text, ActivityIndicator } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { Colors } from "../shared/constants/Color";
import type { DrawerParamList, AppStackParamList } from "../navigation/types";

import DottedBackground from "../components/DottedBackground";
import Header from "../components/Header";
import UserMenuModal from "../components/UserMenuModal";
import SearchBar from "../components/SearchBar";
import CollectionList from "../components/CollectionList";
import FloatingAddButton from "../components/FloatingAddButton";
import CollectionActionModal from "../components/CollectionActionModal";
import CreateCardSheet from "../components/CreateCardSheet";
import RenameCollectionModal from "../components/RenameCollectionModal";

import { useAuth } from "../shared/context/AuthContext";
import { useSync } from "../shared/context/SyncContext";

import { useCollections, Collection } from "../features/collection";
import { CardService } from "../features/card/services/CardService";
import { ExportService } from "../features/collection/services/ExportService";
import { ImportService } from "../features/collection/services/ImportService";

type Props = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, "Home">,
  NativeStackScreenProps<AppStackParamList>
>;

export default function Home({ navigation }: Readonly<Props>) {
  const { user, logout } = useAuth();
  const { forceSync, syncStatus, checkAndSyncIfNeeded } = useSync();
  const { t } = useTranslation();

  const {
    collections,
    createCollection: createCollectionHook,
    renameCollection: renameCollectionHook,
    deleteCollection: deleteCollectionHook,
    refreshCollections,
    isLoading,
  } = useCollections();

  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const [isImporting, setIsImporting] = useState(false);

  const [showCreateCardFromModal, setShowCreateCardFromModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const handleManualSync = async () => {
    if (!user) {
      Alert.alert(t("common.error"), t("alerts.userNotAuthenticated"));
      return;
    }

    if (syncStatus.isRunning) {
      console.log("Sync already in progress, skipping...");
      return;
    }

    try {
      console.log("Manual sync triggered by user");
      const result = await forceSync();

      if (result?.success) {
        Alert.alert(
          t("alerts.syncComplete"),
          t("alerts.syncInfo", {
            pushedCount: result.pushedCount,
            pulledCount: result.pulledCount,
          })
        );
      } else if (result) {
        Alert.alert(
          t("alerts.syncFailed"),
          result.errors.length > 0 ? result.errors[0] : t("alerts.unknownError")
        );
      }
    } catch (error) {
      console.error("Error during manual sync:", error);
      Alert.alert(t("alerts.syncError"), t("alerts.failedToSyncData"));
    }
  };

  const handleCreateCollection = async (name: string) => {
    const success = await createCollectionHook(name);
    if (success) {
      Alert.alert(t("common.success"), t("collection.createSuccess"));
    }
  };

  const handleDeleteCollection = async (
    collectionId: string,
    collectionName: string
  ) => {
    const success = await deleteCollectionHook(collectionId);
    if (success) {
      Alert.alert(t("common.success"), t("collection.deleteSuccess"));
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

  const handleCreateCard = async (data: {
    collectionId: string;
    front: string;
    back: string;
  }) => {
    if (!user) {
      Alert.alert(t("common.error"), t("alerts.userNotAuthenticated"));
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

        await checkAndSyncIfNeeded();

        await refreshCollections();

        Alert.alert(t("common.success"), t("card.createSuccess"));
      }
    } catch (error) {
      console.error("Error creating card:", error);
      Alert.alert(t("common.error"), t("alerts.failedToCreateCard"));
    }
  };

  const onAddCard = () => {
    setActionModalVisible(false);
    setShowCreateCardFromModal(true);
  };

  const onAddCardByImage = () => {
    handleCloseActionModal();
    if (selectedCollection) {
      navigation.navigate("OCRCardCreator", {
        collectionId: selectedCollection.id,
        collectionTitle: selectedCollection.title,
      });
    }
  };

  const onAddCardByImageOnline = () => {
    handleCloseActionModal();
    if (selectedCollection) {
      navigation.navigate("VisionOCRCardCreator", {
        collectionId: selectedCollection.id,
        collectionTitle: selectedCollection.title,
      });
    }
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
    setActionModalVisible(false);
    setShowRenameModal(true);
  };

  const handleRename = async (newName: string) => {
    if (!selectedCollection) return;

    const success = await renameCollectionHook(selectedCollection.id, newName);
    if (success) {
      Alert.alert(t("common.success"), t("collection.renameSuccess"));
      setShowRenameModal(false);
      setSelectedCollection(null);
    }
  };

  const handleCloseRenameModal = () => {
    setShowRenameModal(false);
    setSelectedCollection(null);
  };

  const onExportCSV = async () => {
    handleCloseActionModal();
    if (selectedCollection) {
      const collectionToExport = {
        ...selectedCollection,
        name: selectedCollection.title,
      };

      await ExportService.exportToCSV(collectionToExport as any);
    }
  };

  const onExportJSON = async () => {
    handleCloseActionModal();
    if (selectedCollection) {
      const collectionToExport = {
        ...selectedCollection,
        name: selectedCollection.title,
      };

      await ExportService.exportToJSON(collectionToExport as any);
    }
  };

  const handleImport = async (type: "csv" | "json") => {
    if (!user) {
      Alert.alert(t("common.error"), t("alerts.userNotAuthenticated"));
      return;
    }

    try {
      setIsImporting(true);
      const result = await ImportService.pickAndImport(user.uid, type);

      if (result && result.success) {
        await refreshCollections();
        setTimeout(() => {
          Alert.alert(
            t("common.success"),
            t("alerts.importSuccess", {
              collectionName: result.collectionName,
              count: result.count,
            })
          );
        }, 500);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t("common.error"), t("alerts.importFailed"));
    } finally {
      setIsImporting(false);
    }
  };

  const onDelete = () => {
    handleCloseActionModal();

    if (!selectedCollection) return;

    Alert.alert(
      t("alerts.deleteCollection"),
      t("alerts.deleteCollectionConfirm", {
        collectionName: selectedCollection.title,
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
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
    (item.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <DottedBackground />

      <Header
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

      <SearchBar value={search} onChangeText={setSearch} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.subText} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : filteredCollections.length > 0 ? (
        <CollectionList
          data={filteredCollections}
          onPressItem={handlePressCollection}
          onLongPressItem={handleLongPressCollection}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t("home.noCollectionsFound")}</Text>
        </View>
      )}

      <FloatingAddButton
        onCreateCollection={handleCreateCollection}
        onCreateCard={handleCreateCard}
        onImport={handleImport}
        collections={collections.map((col) => ({
          id: col.id,
          name: col.title,
        }))}
      />

      {selectedCollection && (
        <CreateCardSheet
          visible={showCreateCardFromModal}
          onClose={() => {
            setShowCreateCardFromModal(false);
            setSelectedCollection(null);
          }}
          onCreate={async (data) => {
            await handleCreateCard(data);
            setShowCreateCardFromModal(false);
            setSelectedCollection(null);
          }}
          collections={[
            {
              id: selectedCollection.id,
              name: selectedCollection.title,
            },
          ]}
          preSelectedCollectionId={selectedCollection.id}
        />
      )}

      <CollectionActionModal
        visible={actionModalVisible}
        onClose={handleCloseActionModal}
        collection={selectedCollection}
        onAddCard={onAddCard}
        onAddCardByImage={onAddCardByImage}
        onAddCardByImageOnline={onAddCardByImageOnline}
        onViewCards={onViewCards}
        onRename={onRename}
        onExportCSV={onExportCSV}
        onExportJSON={onExportJSON}
        onDelete={onDelete}
      />

      <RenameCollectionModal
        visible={showRenameModal}
        onClose={handleCloseRenameModal}
        currentName={selectedCollection?.title || ""}
        onRename={handleRename}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: Colors.subText,
    fontSize: 16,
    marginTop: 12,
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
