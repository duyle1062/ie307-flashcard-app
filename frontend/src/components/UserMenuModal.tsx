import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";

import { Colors } from "../const/Color";

interface UserMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onAccountPress: () => void;
}

const UserMenuModal: React.FC<UserMenuModalProps> = ({
  visible,
  onClose,
  onLogout,
  onAccountPress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.popupMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onAccountPress();
            }}
          >
            <Feather name="user" size={18} color={Colors.black} />
            <Text style={styles.menuText}>Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="lock" size={18} color={Colors.black} />
            <Text style={styles.menuText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onLogout();
              onClose();
            }}
          >
            <AntDesign name="logout" size={18} color={Colors.black} />
            <Text style={styles.menuText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalbg,
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
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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

export default UserMenuModal;
