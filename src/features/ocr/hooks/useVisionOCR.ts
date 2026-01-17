import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { TextBlock, ImageDimensions } from "../services/OCRService";
import { VisionAIService } from "../services/VisionAIService";

interface UseVisionOCRReturn {
  imageUri: string | null;
  imageDimensions: ImageDimensions;
  textBlocks: TextBlock[];
  isProcessing: boolean;
  selectedBlocks: string[];
  editingType: "front" | "back" | null;
  editedText: string;
  promptImageSource: () => void;
  retakeImage: () => void;
  handleBlockPress: (blockId: string) => void;
  assignToFront: () => void;
  assignToBack: () => void;
  startEditingText: (type: "front" | "back") => void;
  saveEditedText: () => void;
  cancelEditing: () => void;
  resetSelections: () => void;
  getFrontText: () => string;
  getBackText: () => string;
  setTextBlocks: React.Dispatch<React.SetStateAction<TextBlock[]>>;
  setEditedText: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Custom hook to manage Vision AI OCR state and operations
 */
export function useVisionOCR(onCancel?: () => void): UseVisionOCRReturn {
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
  });
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [editingType, setEditingType] = useState<"front" | "back" | null>(null);
  const [editedText, setEditedText] = useState("");

  const promptImageSource = () => {
    // Check if API key is configured
    if (!VisionAIService.isConfigured()) {
      Alert.alert(
        t("ocr.configurationRequired"),
        t("ocr.visionApiKeyNotConfigured"),
        [{ text: t("common.ok"), onPress: onCancel }]
      );
      return;
    }

    Alert.alert(t("ocr.chooseImageSource"), t("ocr.selectImageSource"), [
      {
        text: t("ocr.camera"),
        onPress: () => {
          openCamera();
        },
      },
      {
        text: t("ocr.gallery"),
        onPress: () => {
          openGallery();
        },
      },
      {
        text: t("common.cancel"),
        style: "cancel",
        onPress: onCancel,
      },
    ]);
  };

  const openCamera = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          t("ocr.permissionRequired"),
          t("ocr.cameraPermissionRequired")
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(t("common.error"), t("ocr.failedToOpenCamera"));
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert(t("common.error"), t("ocr.failedToOpenGallery"));
    }
  };

  const processImage = async (uri: string) => {
    try {
      setIsProcessing(true);
      setImageUri(uri);
      setTextBlocks([]);
      setSelectedBlocks([]);

      console.log("Processing image with Vision AI:", uri);

      const result = await VisionAIService.recognizeText(uri);

      setImageDimensions(result.imageDimensions);
      setTextBlocks(result.blocks);

      if (result.blocks.length === 0) {
        Alert.alert(t("ocr.noTextFound"), t("ocr.noTextFoundMessage"));
      } else {
        Alert.alert(
          t("common.success"),
          t("ocr.detectedTextBlocks", { count: result.blocks.length })
        );
      }
    } catch (error) {
      console.error("Process image error:", error);
      setImageUri(null);
      setTextBlocks([]);
      Alert.alert(t("ocr.processingFailed"), t("ocr.processingFailedMessage"));
    } finally {
      setIsProcessing(false);
    }
  };

  const retakeImage = () => {
    setImageUri(null);
    setTextBlocks([]);
    setSelectedBlocks([]);
    setEditingType(null);
    setEditedText("");
    promptImageSource();
  };

  const handleBlockPress = (blockId: string) => {
    setSelectedBlocks((prev) =>
      prev.includes(blockId)
        ? prev.filter((id) => id !== blockId)
        : [...prev, blockId]
    );
  };

  const assignToFront = () => {
    setTextBlocks((prev) =>
      prev.map((block) =>
        selectedBlocks.includes(block.id)
          ? { ...block, type: "front", selected: false }
          : block
      )
    );
    setSelectedBlocks([]);
  };

  const assignToBack = () => {
    setTextBlocks((prev) =>
      prev.map((block) =>
        selectedBlocks.includes(block.id)
          ? { ...block, type: "back", selected: false }
          : block
      )
    );
    setSelectedBlocks([]);
  };

  const startEditingText = (type: "front" | "back") => {
    const currentText = textBlocks
      .filter((b) => b.type === type)
      .map((b) => b.text)
      .join("\n");
    setEditedText(currentText);
    setEditingType(type);
  };

  const saveEditedText = () => {
    if (!editingType) return;

    const lines = editedText.split("\n").filter((line) => line.trim());
    const blocksToUpdate = textBlocks.filter((b) => b.type === editingType);

    setTextBlocks((prev) => {
      const updated = prev.map((block) =>
        block.type === editingType ? { ...block, type: null } : block
      );
      const newBlocks = lines.map((line, index) => ({
        ...(blocksToUpdate[index] || blocksToUpdate[0]),
        text: line,
        type: editingType,
      }));
      return [...updated.filter((b) => b.type !== null), ...newBlocks];
    });

    setEditingType(null);
    setEditedText("");
  };

  const cancelEditing = () => {
    setEditingType(null);
    setEditedText("");
  };

  const resetSelections = () => {
    setTextBlocks((prev) =>
      prev.map((block) => ({ ...block, type: null, selected: false }))
    );
    setSelectedBlocks([]);
  };

  const getFrontText = () => {
    return textBlocks
      .filter((b) => b.type === "front")
      .map((b) => b.text)
      .join("\n");
  };

  const getBackText = () => {
    return textBlocks
      .filter((b) => b.type === "back")
      .map((b) => b.text)
      .join("\n");
  };

  return {
    imageUri,
    imageDimensions,
    textBlocks,
    isProcessing,
    selectedBlocks,
    editingType,
    editedText,
    promptImageSource,
    retakeImage,
    handleBlockPress,
    assignToFront,
    assignToBack,
    startEditingText,
    saveEditedText,
    cancelEditing,
    resetSelections,
    getFrontText,
    getBackText,
    setTextBlocks,
    setEditedText,
  };
}
