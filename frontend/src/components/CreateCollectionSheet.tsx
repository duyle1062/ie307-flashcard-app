import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Colors } from "../const/Color";
import { Shadows } from "../const/Shadow";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateCollectionSheet: React.FC<Props> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [collectionName, setCollectionName] = useState("");

  const handleCreate = () => {
    if (collectionName.trim()) {
      onCreate(collectionName.trim());
      setCollectionName("");
    }
  };

  const handleClose = () => {
    setCollectionName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Collection</Text>

              <TextInput
                style={styles.input}
                placeholder="Collection Name"
                placeholderTextColor={Colors.gray}
                value={collectionName}
                onChangeText={setCollectionName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    !collectionName.trim() && styles.createButtonDisabled,
                  ]}
                  onPress={handleCreate}
                  disabled={!collectionName.trim()}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    ...Shadows.strong,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.title,
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: Colors.background,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.silver,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.title,
    fontSize: 17,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    backgroundColor: Colors.blue,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: Colors.blueLight,
    opacity: 0.6,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
});

export default CreateCollectionSheet;
