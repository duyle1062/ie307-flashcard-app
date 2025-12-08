import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
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
import { AppStackParamList } from "../navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<AppStackParamList, "Drawer">;

export default function Home({ navigation }: any) {
  const { logout } = useAuth();
  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

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
    console.log("View cards of:", selectedCollection?.title);
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
    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete "${selectedCollection?.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setCollections((prev) =>
              prev.filter((c) => c.id !== selectedCollection?.id)
            );
          },
        },
      ]
    );
  };

  const [collections, setCollections] = useState<Collection[]>([
    { id: "1", title: "Text A", new: 0, learning: 0, review: 0 },
    { id: "2", title: "Text B", new: 25, learning: 0, review: 50 },
    { id: "3", title: "Text C", new: 25, learning: 25, review: 50 },
    { id: "4", title: "Text A", new: 0, learning: 0, review: 0 },
    { id: "5", title: "Text B", new: 25, learning: 0, review: 50 },
    { id: "6", title: "Text C", new: 25, learning: 25, review: 50 },
    { id: "7", title: "Text A", new: 0, learning: 0, review: 0 },
    { id: "8", title: "Text B", new: 25, learning: 0, review: 50 },
    { id: "9", title: "Text C", new: 25, learning: 25, review: 50 },
    { id: "10", title: "Text A", new: 0, learning: 0, review: 0 },
    { id: "11", title: "Text B", new: 25, learning: 0, review: 50 },
    { id: "12", title: "Text C", new: 25, learning: 25, review: 50 },
  ]);

  return (
    <View style={styles.container}>
      <DottedBackground />

      <Header
        streak={3}
        onAvatarPress={() => setShowMenu(true)}
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
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

      <CollectionList
        data={collections}
        onPressItem={handlePressCollection}
        onLongPressItem={handleLongPressCollection}
      />

      <FloatingAddButton onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
