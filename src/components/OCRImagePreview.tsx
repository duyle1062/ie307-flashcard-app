import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Shadows } from "../shared/constants/Shadow";
import { Colors } from "../shared/constants/Color";
import { TextBlock, ImageDimensions } from "../features/ocr/services";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_PADDING = 32;
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.65;

interface OCRImagePreviewProps {
  imageUri: string;
  imageDimensions: ImageDimensions;
  textBlocks: TextBlock[];
  selectedBlocks: string[];
  onBlockPress: (blockId: string) => void;
}

/**
 * OCR Image Preview - Displays image with text block overlays
 */
export function OCRImagePreview({
  imageUri,
  imageDimensions,
  textBlocks,
  selectedBlocks,
  onBlockPress,
}: Readonly<OCRImagePreviewProps>) {
  const calculateRenderDimensions = () => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      return { width: 0, height: 0 };
    }

    const availableWidth = SCREEN_WIDTH - SCREEN_PADDING;
    const aspectRatio = imageDimensions.width / imageDimensions.height;

    let renderWidth = availableWidth;
    let renderHeight = availableWidth / aspectRatio;

    if (renderHeight > MAX_IMAGE_HEIGHT) {
      renderHeight = MAX_IMAGE_HEIGHT;
      renderWidth = renderHeight * aspectRatio;
    }

    return { width: renderWidth, height: renderHeight };
  };

  const renderDimensions = calculateRenderDimensions();
  const scale =
    renderDimensions.width > 0 && imageDimensions.width > 0
      ? renderDimensions.width / imageDimensions.width
      : 0;

  if (renderDimensions.width === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            width: renderDimensions.width,
            height: renderDimensions.height,
          },
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="stretch"
          onLoad={() => {
            console.log("=== COORDINATE MAPPING DEBUG ===");
            console.log("Image dimensions:", imageDimensions);
            console.log("Render dimensions:", renderDimensions);
            console.log("Scale factor:", scale.toFixed(4));
            console.log(
              "Aspect ratio preserved:",
              Math.abs(
                renderDimensions.width / renderDimensions.height -
                  imageDimensions.width / imageDimensions.height
              ) < 0.01
            );
            console.log("================================");
          }}
        />

        {scale > 0 && (
          <View style={styles.overlayContainer}>
            {textBlocks.map((block) => {
              const left = block.frame.x * scale;
              const top = block.frame.y * scale;
              const width = block.frame.width * scale;
              const height = block.frame.height * scale;

              const isSelected = selectedBlocks.includes(block.id);
              const isFront = block.type === "front";
              const isBack = block.type === "back";

              let backgroundColor = "rgba(0, 0, 0, 0.1)";
              let borderColor = "rgba(255, 255, 255, 0.5)";
              let borderWidth = 1;

              if (isSelected) {
                backgroundColor = "rgba(230, 126, 34, 0.4)";
                borderColor = Colors.primary;
                borderWidth = 2;
              } else if (isFront) {
                backgroundColor = "rgba(46, 204, 113, 0.4)";
                borderColor = Colors.green;
                borderWidth = 2;
              } else if (isBack) {
                backgroundColor = "rgba(52, 152, 219, 0.4)";
                borderColor = Colors.blue;
                borderWidth = 2;
              }

              return (
                <TouchableOpacity
                  key={block.id}
                  style={[
                    styles.overlay,
                    {
                      left,
                      top,
                      width,
                      height,
                      backgroundColor,
                      borderColor,
                      borderWidth,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => onBlockPress(block.id)}
                />
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    width: "100%",
  },
  container: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333",
    ...Shadows.medium,
    position: "relative",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  overlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
