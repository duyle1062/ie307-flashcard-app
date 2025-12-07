import { TouchableOpacity, StyleSheet } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";

import { Colors } from "../const/Color";
import { Shadows } from "@/const/Shadow";

interface FloatingAddButtonProps {
  onPress?: () => void;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <AntDesign name="plus" size={26} color={Colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 40,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...Shadows.strong,
  },
});

export default FloatingAddButton;
