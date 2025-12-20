import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Colors } from "../shared/constants/Color";
import DottedBackground from "../components/DottedBackground";
import { OCRImagePreview } from "../components/OCRImagePreview";
import { OCRStatsBar } from "../components/OCRStatsBar";
import { OCRTextEditor } from "../components/OCRTextEditor";
import { OCRActionBar } from "../components/OCRActionBar";
import { AppStackParamList } from "../navigation/types";
import { useVisionOCR } from "../features/ocr/hooks/useVisionOCR";
import { CardService } from "../features/card/services";
import { useSync } from "../shared/context/SyncContext";

type Props = NativeStackScreenProps<AppStackParamList, "VisionOCRCardCreator">;

export default function VisionOCRCardCreator({ navigation, route }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { collectionId } = route.params;
  const { checkAndSyncIfNeeded } = useSync();

  const visionOCR = useVisionOCR(() => navigation.goBack());

  useEffect(() => {
    visionOCR.promptImageSource();
  }, []);

  const handleCreateCard = async () => {
    const frontText = visionOCR.getFrontText();
    const backText = visionOCR.getBackText();

    if (!frontText || !backText) {
      Alert.alert("Error", "Please assign text to both Front and Back");
      return;
    }

    try {
      await CardService.createCard(collectionId, frontText, backText);
      await checkAndSyncIfNeeded();

      visionOCR.resetSelections();

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Add Card by Image</Text>
          <View style={styles.badge}>
            <Feather name="cloud" size={12} color={Colors.white} />
            <Text style={styles.badgeText}>ONLINE</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={visionOCR.retakeImage} style={styles.headerButton}>
            <MaterialIcons name="photo-camera" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {visionOCR.isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Processing image with Vision AI...</Text>
          <Text style={styles.loadingSubText}>This may take a few seconds</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
          {visionOCR.imageUri && (
            <OCRImagePreview
              imageUri={visionOCR.imageUri}
              imageDimensions={visionOCR.imageDimensions}
              textBlocks={visionOCR.textBlocks}
              selectedBlocks={visionOCR.selectedBlocks}
              onBlockPress={visionOCR.handleBlockPress}
            />
          )}

          <OCRStatsBar textBlocks={visionOCR.textBlocks} selectedBlocks={visionOCR.selectedBlocks} />

          <OCRTextEditor
            textBlocks={visionOCR.textBlocks}
            editingType={visionOCR.editingType}
            editedText={visionOCR.editedText}
            onEditedTextChange={visionOCR.setEditedText}
            onStartEditing={visionOCR.startEditingText}
            onSave={visionOCR.saveEditedText}
            onCancel={visionOCR.cancelEditing}
          />
        </ScrollView>
      )}

      {!visionOCR.isProcessing && (
        <OCRActionBar
          selectedBlocks={visionOCR.selectedBlocks}
          textBlocks={visionOCR.textBlocks}
          onAssignToFront={visionOCR.assignToFront}
          onAssignToBack={visionOCR.assignToBack}
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
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.title,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.white,
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
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.title,
    textAlign: "center",
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.subText,
    textAlign: "center",
  },
});
