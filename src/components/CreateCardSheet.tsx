import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

interface Collection {
  id: string;
  name: string;
}

// sau này thay để truyền data thật vào
interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: {
    collectionId: string;
    front: string;
    back: string;
  }) => void;
  collections?: Collection[];
}

const CreateCardSheet: React.FC<Props> = ({
  visible,
  onClose,
  onCreate,
  collections: externalCollections,
}) => {
  const mockCollections: Collection[] = [
    { id: "1", name: "N3" },
    { id: "2", name: "N2" },
    { id: "3", name: "N1" },
  ];

  // Ưu tiên dùng data từ props, nếu không có thì dùng mock
  const collections =
    externalCollections && externalCollections.length > 0
      ? externalCollections
      : mockCollections;

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const canCreate = selectedCollection && frontText.trim() && backText.trim();

  const handleCreate = () => {
    if (canCreate && selectedCollection) {
      onCreate({
        collectionId: selectedCollection.id,
        front: frontText.trim(),
        back: backText.trim(),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCollection(null);
    setFrontText("");
    setBackText("");
    setShowDropdown(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <AntDesign name="left" size={24} color={Colors.title} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Card</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Card Collections</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !selectedCollection && styles.placeholder,
                    ]}
                  >
                    {selectedCollection?.name || "Choose a collection"}
                  </Text>
                  <AntDesign
                    name={showDropdown ? "up" : "down"}
                    size={20}
                    color={Colors.subText}
                  />
                </TouchableOpacity>

                {showDropdown && (
                  <View style={styles.dropdownList}>
                    {collections.map((col) => (
                      <TouchableOpacity
                        key={col.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedCollection(col);
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{col.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Front Text</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Example: 漢字"
                  placeholderTextColor={Colors.gray}
                  value={frontText}
                  onChangeText={setFrontText}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Back Text</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Hán tự"
                  placeholderTextColor={Colors.gray}
                  value={backText}
                  onChangeText={setBackText}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !canCreate && styles.createButtonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!canCreate}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  backButton: {
    padding: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.title,
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: -1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    ...Shadows.medium,
  },

  fieldContainer: {
    marginBottom: 24,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.title,
    marginBottom: 8,
  },

  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },

  dropdownText: {
    fontSize: 17,
    color: Colors.title,
  },

  placeholder: {
    color: Colors.gray,
  },

  dropdownList: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.white,
    maxHeight: 200,
    ...Shadows.light,
  },

  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  dropdownItemText: {
    fontSize: 16,
    color: Colors.title,
  },

  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: Colors.background,
    minHeight: 100,
  },

  createButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },

  createButtonDisabled: {
    backgroundColor: Colors.blueLight,
    opacity: 0.6,
  },

  createButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CreateCardSheet;
