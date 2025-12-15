import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../shared/constants/Color";

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  label,
  onPress,
  isDestructive = false,
}) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text
      style={[
        styles.actionLabel,
        isDestructive && { color: Colors.red, fontWeight: "600" },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 10,
  },

  actionLabel: {
    fontSize: 16,
    color: Colors.title,
  },
});

export default ActionItem;
