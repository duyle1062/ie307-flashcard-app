import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import { Colors } from "../const/Color";

import DottedBackground from "../components/DottedBackground";
import Header from "../components/Header";
import UserMenuModal from "../components/UserMenuModal";
import SearchBar from "../components/SearchBar";
import CollectionList, { Collection } from "../components/CollectionList";
import FloatingAddButton from "../components/FloatingAddButton";

import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<AppStackParamList, "Drawer">;

export default function Home({ navigation }: any) {
  const { logout } = useAuth();
  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handlePressCollection = (item: Collection) => {
    navigation.navigate("Study", {
      deckId: item.id,
      title: item.title,
    });
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

      <SearchBar value={search} onChangeText={setSearch} />

      <CollectionList data={collections} onPressItem={handlePressCollection} />

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
