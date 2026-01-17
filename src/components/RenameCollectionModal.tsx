import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

interface RenameCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
}

const RenameCollectionModal: React.FC<RenameCollectionModalProps> = ({
  visible,
  onClose,
  currentName,
  onRename,
}) => {
  const { t } = useTranslation();
  const [newName, setNewName] = useState(currentName);

  // Update local state when currentName changes
  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  const handleRename = () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      return;
    }
    if (trimmedName === currentName) {
      onClose();
      return;
    }
    onRename(trimmedName);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.title}>{t("collection.renameTitle")}</Text>

                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder={t("collection.collectionName")}
                  placeholderTextColor={Colors.subText}
                  autoFocus
                  selectTextOnFocus
                  maxLength={100}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                      !newName.trim() && styles.buttonDisabled,
                    ]}
                    onPress={handleRename}
                    disabled={!newName.trim()}
                  >
                    <Text style={styles.confirmButtonText}>
                      {t("common.rename")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: Colors.modalbg,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    ...Shadows.strong,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.title,
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.title,
    marginBottom: 24,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButton: {
    backgroundColor: Colors.silver,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.title,
  },

  confirmButton: {
    backgroundColor: Colors.primary,
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});

export default RenameCollectionModal;
