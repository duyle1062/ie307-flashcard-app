import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import { Collection } from "./CollectionList";

interface CollectionActionModalProps {
  visible: boolean;
  onClose: () => void;
  collection: Collection | null;
  onAddCard: () => void;
  onAddCardByImage: () => void;
  onAddCardByImageOnline: () => void;
  onViewCards: () => void;
  onRename: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onDelete: () => void;
}

const CollectionActionModal: React.FC<CollectionActionModalProps> = ({
  visible,
  onClose,
  collection,
  onAddCard,
  onAddCardByImage,
  onAddCardByImageOnline,
  onViewCards,
  onRename,
  onExportCSV,
  onExportJSON,
  onDelete,
}) => {
  if (!collection) return null;

  const ActionItem = ({
    icon,
    label,
    onPress,
    isDestructive = false,
  }: {
    icon: any;
    label: string;
    onPress: () => void;
    isDestructive?: boolean;
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.collectionTitle} numberOfLines={1}>
                  {collection.title}
                </Text>
                <Text style={styles.subText}>Select an action</Text>
              </View>

              <View style={styles.divider} />

              <ActionItem
                icon={
                  <Feather
                    name="plus-circle"
                    size={20}
                    color={Colors.primary}
                  />
                }
                label="Add card"
                onPress={onAddCard}
              />
              <ActionItem
                icon={
                  <Feather name="image" size={20} color={Colors.primary} />
                }
                label="Add card by image (offline)"
                onPress={onAddCardByImage}
              />
              <ActionItem
                icon={
                  <Feather name="cloud" size={20} color={Colors.primary} />
                }
                label="Add card by image (Google Vision)"
                onPress={onAddCardByImageOnline}
              />
              <ActionItem
                icon={
                  <Feather name="layers" size={20} color={Colors.primary} />
                }
                label="View all cards"
                onPress={onViewCards}
              />
              <ActionItem
                icon={
                  <Feather name="edit-2" size={20} color={Colors.primary} />
                }
                label="Rename"
                onPress={onRename}
              />
              <ActionItem
                icon={
                  <MaterialCommunityIcons name="file-delimited-outline" size={20} color={Colors.primary} />
                }
                label="Export as CSV"
                onPress={onExportCSV}
              />
              <ActionItem
                icon={
                  <MaterialCommunityIcons name="code-json" size={20} color={Colors.primary} />
                }
                label="Export as JSON"
                onPress={onExportJSON}
              />

              <View style={styles.divider} />

              <ActionItem
                icon={<Feather name="trash-2" size={20} color={Colors.red} />}
                label="Delete collection"
                onPress={onDelete}
                isDestructive
              />
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
    ...Shadows.strong,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
  },

  collectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.title,
    marginBottom: 4,
    textAlign: "center",
  },

  subText: {
    fontSize: 14,
    color: Colors.gray,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.silver,
    marginVertical: 5,
  },

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

export default CollectionActionModal;
