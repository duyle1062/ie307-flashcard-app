import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Colors } from "../shared/constants/Color";
import DottedBackground from "../components/DottedBackground";
import { OCRStatsBar } from "../components/OCRStatsBar";
import { OCRImagePreview } from "../components/OCRImagePreview";
import { OCRTextEditor } from "../components/OCRTextEditor";
import { OCRActionBar } from "../components/OCRActionBar";
import { CardService } from "../features/card/services/CardService";
import { useSync } from "../features/sync/hooks";
import { AppStackParamList } from "../navigation/types";
import { useOCR } from "../features/ocr";

type Props = NativeStackScreenProps<AppStackParamList, "OCRCardCreator">;

export default function OCRCardCreator({ navigation, route }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { collectionId } = route.params;
  const { checkAndSyncIfNeeded } = useSync();

  const ocr = useOCR(() => navigation.goBack());

  useEffect(() => {
    ocr.promptImageSource();
  }, []);

  const handleCreateCard = async () => {
    const frontText = ocr.getFrontText();
    const backText = ocr.getBackText();

    if (!frontText || !backText) {
      Alert.alert("Error", "Please assign text to both Front and Back");
      return;
    }

    try {
      await CardService.createCard(collectionId, frontText, backText);
      await checkAndSyncIfNeeded();

      ocr.resetSelections();

      Alert.alert(
        "Success",
        "Card created successfully! You can continue creating more cards from this image.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Create card error:", error);
      Alert.alert("Error", "Failed to create card");
    }
  };

  return (
    <View style={styles.container}>
      <DottedBackground />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color={Colors.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card by Image</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={ocr.retakeImage} style={styles.headerButton}>
            <MaterialIcons name="photo-camera" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {ocr.isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
          {ocr.imageUri && (
            <OCRImagePreview
              imageUri={ocr.imageUri}
              imageDimensions={ocr.imageDimensions}
              textBlocks={ocr.textBlocks}
              selectedBlocks={ocr.selectedBlocks}
              onBlockPress={ocr.handleBlockPress}
            />
          )}

          <OCRStatsBar textBlocks={ocr.textBlocks} selectedBlocks={ocr.selectedBlocks} />

          <OCRTextEditor
            textBlocks={ocr.textBlocks}
            editingType={ocr.editingType}
            editedText={ocr.editedText}
            onEditedTextChange={ocr.setEditedText}
            onStartEditing={ocr.startEditingText}
            onSave={ocr.saveEditedText}
            onCancel={ocr.cancelEditing}
          />
        </ScrollView>
      )}

      {!ocr.isProcessing && (
        <OCRActionBar
          selectedBlocks={ocr.selectedBlocks}
          textBlocks={ocr.textBlocks}
          onAssignToFront={ocr.assignToFront}
          onAssignToBack={ocr.assignToBack}
          onCreateCard={handleCreateCard}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.title,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.subText,
  },
});
