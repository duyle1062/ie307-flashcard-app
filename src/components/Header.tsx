import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../shared/constants/Color";

import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface HeaderProps {
  onMenuPress?: () => void;
  onAvatarPress: () => void;
  onRefreshPress?: () => void;
  streak?: number;
  isSyncing?: boolean;
  pendingChanges?: number;
}

const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onAvatarPress,
  onRefreshPress,
  streak = 3,
  isSyncing = false,
  pendingChanges = 0,
}) => {
  const insets = useSafeAreaInsets();

  // Animation for pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pendingChanges > 0 && !isSyncing) {
      // Pulse animation when có pending changes
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pendingChanges, isSyncing, pulseAnim]);

  const handleRefreshPress = () => {
    if (onRefreshPress) {
      onRefreshPress();
    }
  };

  const handleRefreshLongPress = () => {
    if (pendingChanges > 0) {
      Alert.alert(
        "Pending Changes",
        `You have ${pendingChanges} change${
          pendingChanges > 1 ? "s" : ""
        } waiting to sync.\n\nTap to sync now!`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("All Synced", "All your changes are synced to cloud", [
        { text: "OK" },
      ]);
    }
  };

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
            {/* Sync Button with Badge */}
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleRefreshPress}
              onLongPress={handleRefreshLongPress}
              disabled={isSyncing}
              delayLongPress={500}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Feather
                    name="refresh-ccw"
                    size={22}
                    color={
                      pendingChanges > 0
                        ? Colors.redLight // Red when có pending
                        : Colors.primary
                    }
                  />
                </Animated.View>
              )}

              {/* Badge with pending count */}
              {pendingChanges > 0 && !isSyncing && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingChanges > 99 ? "99+" : pendingChanges}
                  </Text>
                </View>
              )}

              {/* Syncing indicator dot */}
              {isSyncing && <View style={styles.syncingDot} />}
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
    gap: 18,
  },

  syncButton: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.redLight,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },

  syncingDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lime,
  },
});

export default Header;
