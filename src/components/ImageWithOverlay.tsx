import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface TextBlock {
  id: string;
  text: string;
  type: 'front' | 'back' | null;
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
  colors: {
    primary: string;
    green: string;
    blue: string;
  };
}

/**
 * Component hiển thị ảnh với text block overlays
 * Sử dụng Image.onLoad để đảm bảo dimensions chính xác
 */
export const ImageWithOverlay: React.FC<ImageWithOverlayProps> = ({
  imageUri,
  textBlocks,
  selectedBlocks,
  imageDimensions,
  containerWidth,
  containerHeight,
  onBlockPress,
  colors,
}) => {
  const [actualImageDimensions, setActualImageDimensions] = useState({ width: 0, height: 0 });

  // Calculate scale factors based on actual rendered image size
  const scaleX = actualImageDimensions.width > 0 && imageDimensions.width > 0
    ? actualImageDimensions.width / imageDimensions.width
    : 0;

  const scaleY = actualImageDimensions.height > 0 && imageDimensions.height > 0
    ? actualImageDimensions.height / imageDimensions.height
    : 0;

  console.log('ImageWithOverlay render:', {
    imageDimensions,
    actualImageDimensions,
    containerWidth,
    containerHeight,
    scaleX,
    scaleY,
  });

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      <Image
        source={{ uri: imageUri }}
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
        onLoad={(event) => {
          const { width, height } = event.nativeEvent.source;
          console.log('Image onLoad:', { width, height, container: { containerWidth, containerHeight } });
          // onLoad gives us the actual image dimensions, which should match imageDimensions
          // The container dimensions are what we calculate to display
          setActualImageDimensions({ width: containerWidth, height: containerHeight });
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
            const isFront = block.type === 'front';
            const isBack = block.type === 'back';

            let backgroundColor = 'rgba(0, 0, 0, 0.1)';
            let borderColor = 'rgba(255, 255, 255, 0.5)';
            let borderWidth = 1;

            if (isSelected) {
              backgroundColor = 'rgba(230, 126, 34, 0.4)';
              borderColor = colors.primary;
              borderWidth = 2;
            } else if (isFront) {
              backgroundColor = 'rgba(46, 204, 113, 0.4)';
              borderColor = colors.green;
              borderWidth = 2;
            } else if (isBack) {
              backgroundColor = 'rgba(52, 152, 219, 0.4)';
              borderColor = colors.blue;
              borderWidth = 2;
            }

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
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#333',
  },
  overlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
