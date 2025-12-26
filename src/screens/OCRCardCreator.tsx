import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Colors } from "../shared/constants/Color";

import DottedBackground from "../components/DottedBackground";
import { OCRStatsBar } from "../components/OCRStatsBar";
import { OCRImagePreview } from "../components/OCRImagePreview";
import { OCRTextEditor } from "../components/OCRTextEditor";
import { OCRActionBar } from "../components/OCRActionBar";

import { CardService } from "../features/card/services/CardService";
import { useSync } from "../features/sync/hooks";
import { useOCR } from "../features/ocr";

import { AppStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "OCRCardCreator">;

export default function OCRCardCreator({ navigation, route }: Readonly<Props>) {
  const { t } = useTranslation();
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
      Alert.alert(t("common.error"), t("ocr.assignTextError"));
      return;
    }

    try {
      await CardService.createCard(collectionId, frontText, backText);
      await checkAndSyncIfNeeded();

      ocr.resetSelections();

      Alert.alert(t("common.success"), t("ocr.cardCreatedSuccess"), [
        { text: t("common.ok") },
      ]);
    } catch (error) {
      console.error("Create card error:", error);
      Alert.alert(t("common.error"), t("alerts.failedToCreateCard"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DottedBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("ocr.addCardByImage")}</Text>
        <TouchableOpacity onPress={ocr.retakeImage} style={styles.headerButton}>
          <MaterialIcons name="photo-camera" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {ocr.isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t("ocr.processingImage")}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {ocr.imageUri && (
            <OCRImagePreview
              imageUri={ocr.imageUri}
              imageDimensions={ocr.imageDimensions}
              textBlocks={ocr.textBlocks}
              selectedBlocks={ocr.selectedBlocks}
              onBlockPress={ocr.handleBlockPress}
            />
          )}

          <OCRStatsBar
            textBlocks={ocr.textBlocks}
            selectedBlocks={ocr.selectedBlocks}
          />

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
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
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
