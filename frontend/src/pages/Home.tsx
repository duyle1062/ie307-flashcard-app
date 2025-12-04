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

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../const/Color";
import { Shadows } from "../const/Shadow";

import DottedBackground from "../components/DottedBackground";
import UserMenuModal from "../components/UserMenuModal";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppStack";

type Collection = {
  id: string;
  title: string;
  new: number;
  learning: number;
  review: number;
};

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export default function Home({ navigation }: Props) {
  const { logout } = useAuth();
  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  // Lấy thông số tai thỏ (notch)
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<any>();

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
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("Study", { 
        deckId: item.id, 
        title: item.title 
      })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.statusRow}>
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.new, "new") },
          ]}
        >
        <Text style={[ styles.statusText, { color: getStatusColor(item.new, "new") }, ]}>
          {item.new}
        </Text>
        <Text style={[ styles.statusText, { color: getStatusColor(item.learning, "learning") }, ]}>
          {item.learning}
        </Text>
        <Text style={[ styles.statusText, { color: getStatusColor(item.review, "review") }, ]}>
          {item.review}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <DottedBackground />
      <View
        style={[
          styles.headerSection,
          { paddingTop: insets.top + 10 }, // Cộng thêm 10px cho thoáng
        ]}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.topHeaderRow}>
            <TouchableOpacity>
              <Feather name="menu" size={26} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.streak}>
              <AntDesign name="fire" size={24} color="orange" />
              <Text style={styles.streakText}>3</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={{ marginRight: 18 }}>
                <Feather name="refresh-ccw" size={22} color={Colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowMenu(true)}>
                <FontAwesome
                  name="user-circle"
                  size={26}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <UserMenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onLogout={logout}
        onAccountPress={() => navigation.navigate("UserProfile")}
      />

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
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      />

      <TouchableOpacity style={styles.addButton}>
        <AntDesign name="plus" size={26} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  safeArea: {
    flex: 1,
    paddingTop: 10,
  },

  headerSection: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E0C09E",
    paddingBottom: 15,
    zIndex: 1,
  },

  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
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
    color: Colors.primary,
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
    marginHorizontal: 20,
    ...Shadows.medium,
  },

  searchInput: {
    flex: 1,
    marginLeft: 6,
    color: Colors.black,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.medium,
  },

  cardTitle: {
    color: Colors.title,
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
    bottom: 30,
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
    zIndex: 10,
  },
});
