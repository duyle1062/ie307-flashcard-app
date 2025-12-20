import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { OCRService, TextBlock, ImageDimensions } from "../services";

interface UseOCRReturn {
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
 * Custom hook to manage OCR state and operations
 */
export function useOCR(onCancel?: () => void): UseOCRReturn {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [editingType, setEditingType] = useState<"front" | "back" | null>(null);
  const [editedText, setEditedText] = useState("");

  const promptImageSource = () => {
    Alert.alert("Choose Image Source", "Select where to get the image from", [
      {
        text: "Camera",
        onPress: () => {
          void openCamera();
        },
      },
      {
        text: "Gallery",
        onPress: () => {
          void openGallery();
        },
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: onCancel,
      },
    ]);
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera permission is required to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  const processImage = async (uri: string) => {
    try {
      setIsProcessing(true);
      setImageUri(uri);

      const result = await OCRService.recognizeText(uri);

      setImageDimensions(result.imageDimensions);
      setTextBlocks(result.blocks);

      if (result.blocks.length === 0) {
        Alert.alert(
          "No Text Detected",
          "No text was found in the image. Tips:\n" +
            "• Ensure good lighting\n" +
            "• Hold camera steady\n" +
            "• Use high contrast text\n" +
            "• Avoid blurry images",
          [{ text: "Retry", onPress: retakeImage }]
        );
      }
    } catch (error) {
      console.error("OCR error:", error);
      Alert.alert(
        "Error",
        "Failed to recognize text from image. Please try again with a clearer photo.",
        [
          { text: "Retry", onPress: retakeImage },
          { text: "Cancel", style: "cancel" },
        ]
      );
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
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const assignToFront = () => {
    setTextBlocks((prev) =>
      prev.map((block) =>
        selectedBlocks.includes(block.id) ? { ...block, type: "front", selected: false } : block
      )
    );
    setSelectedBlocks([]);
  };

  const assignToBack = () => {
    setTextBlocks((prev) =>
      prev.map((block) =>
        selectedBlocks.includes(block.id) ? { ...block, type: "back", selected: false } : block
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
      const otherBlocks = prev.filter((b) => b.type !== editingType);
      const updatedBlocks = blocksToUpdate.map((block, index) => ({
        ...block,
        text: lines[index] || block.text,
      }));
      return [...otherBlocks, ...updatedBlocks];
    });

    setEditingType(null);
    setEditedText("");
  };

  const cancelEditing = () => {
    setEditingType(null);
    setEditedText("");
  };

  const resetSelections = () => {
    setTextBlocks((prev) => prev.map((block) => ({ ...block, type: null, selected: false })));
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
