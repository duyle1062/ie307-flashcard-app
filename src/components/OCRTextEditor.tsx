import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";

import { Colors } from "../shared/constants/Color";

import { TextBlock } from "../features/ocr/services";

interface OCRTextEditorProps {
  textBlocks: TextBlock[];
  editingType: "front" | "back" | null;
  editedText: string;
  onEditedTextChange: (text: string) => void;
  onStartEditing: (type: "front" | "back") => void;
  onSave: () => void;
  onCancel: () => void;
}

export function OCRTextEditor({
  textBlocks,
  editingType,
  editedText,
  onEditedTextChange,
  onStartEditing,
  onSave,
  onCancel,
}: Readonly<OCRTextEditorProps>) {
  const frontBlocks = textBlocks.filter((b) => b.type === "front");
  const backBlocks = textBlocks.filter((b) => b.type === "back");

  if (frontBlocks.length === 0 && backBlocks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {frontBlocks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.green }]}>
              Front Text
            </Text>
            {editingType !== "front" && (
              <TouchableOpacity
                onPress={() => onStartEditing("front")}
                style={styles.editButton}
              >
                <Feather name="edit-2" size={16} color={Colors.green} />
                <Text style={[styles.editButtonText, { color: Colors.green }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.previewCard, styles.frontCard]}>
            {editingType === "front" ? (
              <View>
                <TextInput
                  style={styles.textInput}
                  value={editedText}
                  onChangeText={onEditedTextChange}
                  multiline
                  autoFocus
                  placeholder="Enter front text..."
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={onCancel}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.previewText}>
                {frontBlocks.map((b) => b.text).join("\n")}
              </Text>
            )}
          </View>
        </View>
      )}

      {backBlocks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.blue }]}>
              Back Text
            </Text>
            {editingType !== "back" && (
              <TouchableOpacity
                onPress={() => onStartEditing("back")}
                style={styles.editButton}
              >
                <Feather name="edit-2" size={16} color={Colors.blue} />
                <Text style={[styles.editButtonText, { color: Colors.blue }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.previewCard, styles.backCard]}>
            {editingType === "back" ? (
              <View>
                <TextInput
                  style={styles.textInput}
                  value={editedText}
                  onChangeText={onEditedTextChange}
                  multiline
                  autoFocus
                  placeholder="Enter back text..."
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={onCancel}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.previewText}>
                {backBlocks.map((b) => b.text).join("\n")}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },

  section: {
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: Colors.background,
  },

  editButtonText: {
    fontSize: 13,
    fontWeight: "bold",
  },

  previewCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  frontCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.green,
  },

  backCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.blue,
  },

  previewText: {
    fontSize: 16,
    color: Colors.title,
    lineHeight: 24,
  },

  textInput: {
    fontSize: 16,
    color: Colors.title,
    lineHeight: 24,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },

  editActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },

  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.title,
  },

  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.white,
  },
});
