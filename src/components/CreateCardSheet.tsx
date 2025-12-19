import { useState, useEffect } from "react";
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
  FlatList,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

interface Collection {
  id: string;
  name: string;
}

// Props interface
interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: {
    collectionId: string;
    front: string;
    back: string;
  }) => void;
  collections?: Collection[];
  preSelectedCollectionId?: string; // Auto-select collection
}

const CreateCardSheet: React.FC<Props> = ({
  visible,
  onClose,
  onCreate,
  collections: externalCollections,
  preSelectedCollectionId,
}) => {
 const collections = externalCollections || [];

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [showCollectionPopup, setShowCollectionPopup] = useState(false);

  // Auto-select collection khi mở sheet với preSelectedCollectionId
  useEffect(() => {
    if (visible && preSelectedCollectionId) {
      const preSelected = collections.find(c => c.id === preSelectedCollectionId);
      if (preSelected) {
        setSelectedCollection(preSelected);
      }
    }
  }, [visible, preSelectedCollectionId, collections]);

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
    setShowCollectionPopup(false);
    onClose();
  };

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setShowCollectionPopup(false);
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}
      >
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
                  <Text style={styles.label}>Card Collection</Text>
                  <TouchableOpacity
                    style={styles.cardCollection}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowCollectionPopup(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.collectionText,
                        !selectedCollection && styles.placeholder,
                      ]}
                    >
                      {selectedCollection?.name || "Choose a collection"}
                    </Text>
                    <AntDesign
                      name={showCollectionPopup ? "down" : "right"}
                      size={18}
                      color={Colors.title}
                    />
                  </TouchableOpacity>
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
                    placeholder="Example: Hán tự"
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

      <Modal
        visible={showCollectionPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCollectionPopup(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.popupOverlay}
          onPress={() => setShowCollectionPopup(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.popupContainer}>
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>Select Collection</Text>
                <TouchableOpacity
                  onPress={() => setShowCollectionPopup(false)}
                  style={styles.closePopupButton}
                >
                  <AntDesign name="close" size={24} color={Colors.title} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={collections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.popupItem,
                      item.id === selectedCollection?.id &&
                        styles.popupItemSelected,
                    ]}
                    onPress={() => handleSelectCollection(item)}
                  >
                    <Text
                      style={[
                        styles.popupItemText,
                        item.id === selectedCollection?.id &&
                          styles.popupItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.id === selectedCollection?.id && (
                      <AntDesign
                        name="check"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 20 }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

import { TouchableWithoutFeedback } from "react-native";

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
    backgroundColor: Colors.white,
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
  cardCollection: {
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
  collectionText: {
    fontSize: 17,
    color: Colors.title,
  },
  placeholder: {
    color: Colors.gray,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: Colors.background,
    minHeight: 120,
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

  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    marginTop: 30,
    width: "80%",
    maxHeight: "50%",
    backgroundColor: Colors.white,
    borderRadius: 24,
    ...Shadows.strong,
    overflow: "hidden",
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popupTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.title,
  },
  closePopupButton: {
    padding: 4,
  },
  popupItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  popupItemSelected: {
    backgroundColor: `${Colors.primary}10`,
  },
  popupItemText: {
    fontSize: 17,
    color: Colors.title,
  },
  popupItemTextSelected: {
    fontWeight: "600",
    color: Colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
});

export default CreateCardSheet;
