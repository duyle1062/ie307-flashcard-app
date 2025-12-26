import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { Colors } from "../shared/constants/Color";

import { TextBlock } from "../features/ocr/services";

interface OCRActionBarProps {
  selectedBlocks: string[];
  textBlocks: TextBlock[];
  onAssignToFront: () => void;
  onAssignToBack: () => void;
  onCreateCard: () => void;
}

export function OCRActionBar({
  selectedBlocks,
  textBlocks,
  onAssignToFront,
  onAssignToBack,
  onCreateCard,
}: Readonly<OCRActionBarProps>) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const frontBlocks = textBlocks.filter((b) => b.type === "front");
  const backBlocks = textBlocks.filter((b) => b.type === "back");
  const canCreateCard = frontBlocks.length > 0 && backBlocks.length > 0;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      {selectedBlocks.length > 0 ? (
        <View style={styles.assignButtons}>
          <TouchableOpacity
            style={[styles.button, styles.frontButton]}
            onPress={onAssignToFront}
          >
            <Text style={styles.buttonText}>{t("ocr.toFront")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={onAssignToBack}
          >
            <Text style={styles.buttonText}>{t("ocr.toBack")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            styles.createButton,
            !canCreateCard && styles.buttonDisabled,
          ]}
          onPress={onCreateCard}
          disabled={!canCreateCard}
        >
          <Text style={styles.buttonText}>
            {t("components.createCard").toUpperCase()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    zIndex: 20,
  },

  assignButtons: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  frontButton: {
    flex: 1,
    backgroundColor: Colors.green,
  },

  backButton: {
    flex: 1,
    backgroundColor: Colors.blue,
  },

  createButton: {
    backgroundColor: Colors.primary,
  },

  buttonDisabled: {
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});
