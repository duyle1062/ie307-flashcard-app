import { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../shared/constants/Color";

interface TextBlock {
  id: string;
  text: string;
  type: "front" | "back" | null;
  selected: boolean;
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ImageWithOverlayProps {
  imageUri: string;
  textBlocks: TextBlock[];
  selectedBlocks: string[];
  imageDimensions: { width: number; height: number };
  containerWidth: number;
  containerHeight: number;
  onBlockPress: (blockId: string) => void;
}

export const ImageWithOverlay: React.FC<ImageWithOverlayProps> = ({
  imageUri,
  textBlocks,
  selectedBlocks,
  imageDimensions,
  containerWidth,
  containerHeight,
  onBlockPress,
}) => {
  const [actualImageDimensions, setActualImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const scaleX =
    actualImageDimensions.width > 0 && imageDimensions.width > 0
      ? actualImageDimensions.width / imageDimensions.width
      : 0;

  const scaleY =
    actualImageDimensions.height > 0 && imageDimensions.height > 0
      ? actualImageDimensions.height / imageDimensions.height
      : 0;

  console.log("ImageWithOverlay render:", {
    imageDimensions,
    actualImageDimensions,
    containerWidth,
    containerHeight,
    scaleX,
    scaleY,
  });

  return (
    <View
      style={[
        styles.container,
        { width: containerWidth, height: containerHeight },
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
        onLoad={(event) => {
          const { width, height } = event.nativeEvent.source;
          console.log("Image onLoad:", {
            width,
            height,
            container: { containerWidth, containerHeight },
          });
          setActualImageDimensions({
            width: containerWidth,
            height: containerHeight,
          });
        }}
        resizeMode="contain"
      />

      {/* Overlays */}
      {actualImageDimensions.width > 0 && (
        <View style={StyleSheet.absoluteFill}>
          {textBlocks.map((block) => {
            const left = block.frame.x * scaleX;
            const top = block.frame.y * scaleY;
            const width = block.frame.width * scaleX;
            const height = block.frame.height * scaleY;

            const isSelected = selectedBlocks.includes(block.id);
            const isFront = block.type === "front";
            const isBack = block.type === "back";

            const backgroundColor = isSelected
              ? Colors.primary + "66"
              : isFront
              ? Colors.green + "66"
              : isBack
              ? Colors.blue + "66"
              : Colors.black + "1A";

            const borderColor = isSelected
              ? Colors.primary
              : isFront
              ? Colors.green
              : isBack
              ? Colors.blue
              : Colors.white + "80";

            const borderWidth = isSelected || isFront || isBack ? 2 : 1;

            return (
              <TouchableOpacity
                key={block.id}
                onPress={() => onBlockPress(block.id)}
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
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: Colors.gray,
  },

  overlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
