import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

// ActionItem nội bộ
const ActionItem = ({ icon, label, description, onPress }: any) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={styles.actionIcon}>{icon}</View>
    <View style={styles.actionContent}>
      <Text style={styles.actionLabel}>{label}</Text>
      {description && <Text style={styles.actionDescription}>{description}</Text>}
    </View>
    <Feather name="chevron-right" size={16} color={Colors.subText} />
  </TouchableOpacity>
);

interface ImportActionModalProps {
  visible: boolean;
  onClose: () => void;
  onImportCSV: () => void;
  onImportJSON: () => void;
}

const ImportActionModal: React.FC<ImportActionModalProps> = ({
  visible,
  onClose,
  onImportCSV,
  onImportJSON,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >                
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>  
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Import Collection</Text>
              </View>

              {/* Options */}
              <View style={styles.content}>
                <ActionItem
                  icon={
                    <MaterialCommunityIcons
                      name="file-delimited-outline"
                      size={24}
                      color={Colors.secondary}
                    />
                  }
                  label="Import from CSV"
                  description="Standard CSV (front, back)"
                  onPress={onImportCSV}
                />

                <View style={styles.divider} />

                <ActionItem
                  icon={
                    <MaterialCommunityIcons
                      name="code-json"
                      size={24}
                      color={Colors.secondary}
                    />
                  }
                  label="Import from JSON"
                  description="Restore backup file"
                  onPress={onImportJSON}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalbg,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 15,
    ...Shadows.medium,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.silver,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold", 
    color: Colors.title,
    marginBottom: 4,
    textAlign: "center",
  },
  content: {
    paddingVertical: 0,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.silver,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.title,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.subText,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.silver,
    marginVertical: 5,
    marginHorizontal: 20,
  },
});

export default ImportActionModal;