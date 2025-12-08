import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../const/Color";

import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface HeaderProps {
  onMenuPress?: () => void;
  onAvatarPress: () => void;
  streak?: number;
}

const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onAvatarPress,
  streak = 3,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerSection, { paddingTop: insets.top + 10 }]}>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.topHeaderRow}>
          {/* Menu Button */}
          <TouchableOpacity onPress={onMenuPress}>
            <Feather name="menu" size={26} color={Colors.primary} />
          </TouchableOpacity>

          {/* Streak Section */}
          <View style={styles.streak}>
            <AntDesign name="fire" size={24} color="orange" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>

          {/* Right Section: Refresh & User Avatar */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={{ marginRight: 18 }}>
              <Feather name="refresh-ccw" size={22} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onAvatarPress}>
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
  );
};

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tertiary,
    paddingBottom: 15,
    zIndex: 1,
  },

  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
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
});

export default Header;
