import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "../const/Color";
import { Shadows } from "../const/Shadow";
import DottedBackground from "@/components/DottedBackground";

export default function UserProfile() {
  const navigation = useNavigation();

  const [name, setName] = useState("Nguyen Van A");
  const [email, setEmail] = useState("nguyenvana@example.com");
  const [showCollections, setShowCollections] = useState(false);

  const mockCollections = [
    "Collection A - Basic",
    "Collection B - Intermediate",
    "Collection C - Advanced",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <DottedBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Information</Text>
        <View style={{ width: 100 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Avatar & Streak Section */}
            <View style={styles.topSection}>
              <View style={styles.avatarContainer}>
                <FontAwesome name="user" size={50} color={Colors.white} />
              </View>

              <View style={styles.streakContainer}>
                <Text style={styles.streakLabel}>Streak: 128 days</Text>
                <AntDesign name="fire" size={24} color="orange" />
              </View>
            </View>

            {/* Form Fields */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Collection Dropdown */}
            <TouchableOpacity
              style={styles.collectionButton}
              onPress={() => setShowCollections(!showCollections)}
            >
              <Text style={styles.collectionButtonText}>Collection</Text>
              <Feather
                name={showCollections ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.black}
              />
            </TouchableOpacity>

            {showCollections && (
              <View style={styles.dropdownList}>
                {mockCollections.map((col, index) => (
                  <View key={index} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>{col}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Chart Section */}
            <Text style={styles.label}>Chart / Progress</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={{ color: Colors.subText }}>Biểu đồ .....</Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>UPDATE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    ...Shadows.medium,
    borderColor: Colors.primary,
    borderWidth: 1,
  },

  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.silver,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    gap: 8,
  },

  streakLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.subText,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.title,
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.subText,
  },

  collectionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 25,
  },

  collectionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.title,
  },

  dropdownList: {
    marginTop: 10,
    backgroundColor: Colors.silver,
    borderRadius: 10,
    padding: 10,
  },

  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  dropdownText: {
    fontSize: 15,
    color: Colors.subText,
  },

  chartPlaceholder: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    marginTop: 5,
    padding: 10,
  },

  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },

  updateButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
