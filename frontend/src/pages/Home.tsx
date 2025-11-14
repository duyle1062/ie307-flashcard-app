import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from "react-native";

import { Colors } from "../const/Color";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

import { useAuth } from "../context/AuthContext";

type Collection = {
  id: string;
  title: string;
  new: number;
  learning: number;
  review: number;
};

export default function Home() {
  const { logout } = useAuth();
  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const [collections, setCollections] = useState<Collection[]>([
    { id: "1", title: "Text A", new: 0, learning: 0, review: 0 },
    { id: "2", title: "Text B", new: 25, learning: 0, review: 50 },
    { id: "3", title: "Text C", new: 25, learning: 25, review: 50 },
  ]);

  const getStatusColor = (
    value: number,
    type: "new" | "learning" | "review"
  ) => {
    if (value === 0) return Colors.gray;
    if (type === "new") return Colors.blue;
    if (type === "learning") return Colors.red;
    if (type === "review") return Colors.green;
  };

  const renderItem = ({ item }: { item: Collection }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>

      <View style={styles.statusRow}>
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.new, "new") },
          ]}
        >
          {item.new}
        </Text>
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.learning, "learning") },
          ]}
        >
          {item.learning}
        </Text>
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.review, "review") },
          ]}
        >
          {item.review}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="menu" size={26} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.streak}>
          <AntDesign name="fire" size={24} color="orange" />
          <Text style={styles.streakText}>3</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={{ marginRight: 18 }}>
            <Feather name="refresh-ccw" size={22} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <FontAwesome name="user-circle" size={26} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setShowMenu(false)}
        >
          <View style={styles.popupMenu}>
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="user" size={18} color={Colors.black} />
              <Text style={styles.menuText}>Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialIcons name="lock-reset" size={18} color={Colors.black} />
              <Text style={styles.menuText}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                logout();
                setShowMenu(false);
              }}
            >
              <AntDesign name="logout" size={18} color={Colors.black} />
              <Text style={styles.menuText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.searchBar}>
        <Feather name="search" size={18} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity style={styles.addButton}>
        <AntDesign name="plus" size={26} color={Colors.button} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  streak: {
    flexDirection: "row",
    alignItems: "center",
  },

  streakText: {
    color: Colors.white,
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 16,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 20,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    marginLeft: 6,
    color: Colors.black,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "500",
  },

  statusRow: {
    flexDirection: "row",
    gap: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },

  cardStatus: {
    color: Colors.gray,
    fontSize: 14,
  },

  addButton: {
    position: "absolute",
    bottom: 100,
    right: 25,
    backgroundColor: Colors.white,
    borderRadius: 40,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },

  popupMenu: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },

  menuText: {
    marginLeft: 10,
    fontSize: 15,
    color: Colors.black,
  },
});
