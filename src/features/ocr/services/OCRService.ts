import { Image } from "react-native";
import TextRecognition from "@react-native-ml-kit/text-recognition";

export interface TextBlock {
  text: string;
  id: string;
  selected: boolean;
  type: "front" | "back" | null;
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OCRResult {
  blocks: TextBlock[];
  imageDimensions: ImageDimensions;
}

/**
 * OCR Service - Handles text recognition and image processing
 */
export class OCRService {
  /**
   * Get image dimensions from URI
   */
  static async getImageDimensions(uri: string): Promise<ImageDimensions> {
    return new Promise((resolve) => {
      Image.getSize(
        uri,
        (width, height) => {
          resolve({ width, height });
        },
        (err) => {
          console.error("Get size error", err);
          resolve({ width: 0, height: 0 });
        }
      );
    });
  }

  /**
   * Extract frame coordinates from ML Kit frame object
   */
  private static extractFrameCoordinates(frame: any, index: number): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    let x: number, y: number, width: number, height: number;

    if (frame.boundingCenterX !== undefined && frame.boundingCenterY !== undefined) {
      // Center-based format (most common)
      const centerX = frame.boundingCenterX || 0;
      const centerY = frame.boundingCenterY || 0;
      width = frame.width || 0;
      height = frame.height || 0;
      x = centerX - width / 2;
      y = centerY - height / 2;
    } else if (frame.left !== undefined && frame.top !== undefined) {
      // Top-left format
      x = frame.left || 0;
      y = frame.top || 0;
      width = frame.width || 0;
      height = frame.height || 0;
    } else if (frame.x !== undefined && frame.y !== undefined) {
      // Alternative top-left format
      x = frame.x || 0;
      y = frame.y || 0;
      width = frame.width || 0;
      height = frame.height || 0;
    } else {
      console.warn(`Block ${index}: Unknown frame format`, frame);
      return null;
    }

    // Validate dimensions
    if (width === 0 || height === 0) {
      console.warn(`Block ${index}: Invalid dimensions`);
      return null;
    }

    return { x, y, width, height };
  }

  /**
   * Detect and normalize ML Kit coordinate space to image space
   */
  private static normalizeMLKitCoordinates(
    blocks: TextBlock[],
    imageDimensions: ImageDimensions
  ): void {
    if (blocks.length === 0) return;

    // Calculate ML Kit bounding box
    let mlKitMaxX = 0;
    let mlKitMaxY = 0;
    blocks.forEach((block) => {
      const rightEdge = block.frame.x + block.frame.width;
      const bottomEdge = block.frame.y + block.frame.height;
      if (rightEdge > mlKitMaxX) mlKitMaxX = rightEdge;
      if (bottomEdge > mlKitMaxY) mlKitMaxY = bottomEdge;
    });

    // Check if ML Kit space differs significantly from image dimensions
    const mlKitToImageRatioX = imageDimensions.width / mlKitMaxX;
    const mlKitToImageRatioY = imageDimensions.height / mlKitMaxY;
    const needsNormalization =
      Math.abs(mlKitToImageRatioX - 1) > 0.1 || Math.abs(mlKitToImageRatioY - 1) > 0.1;

    console.log("=== ML KIT COORDINATE ANALYSIS ===");
    console.log("Image dimensions:", imageDimensions);
    console.log("ML Kit space (max bounds):", { width: mlKitMaxX, height: mlKitMaxY });
    console.log("ML Kit to Image ratio:", {
      x: mlKitToImageRatioX.toFixed(3),
      y: mlKitToImageRatioY.toFixed(3),
    });
    console.log("Needs normalization:", needsNormalization);
    console.log("===================================");

    // Normalize coordinates if needed
    if (needsNormalization) {
      console.log("Normalizing ML Kit coordinates to image space...");
      blocks.forEach((block) => {
        block.frame.x *= mlKitToImageRatioX;
        block.frame.y *= mlKitToImageRatioY;
        block.frame.width *= mlKitToImageRatioX;
        block.frame.height *= mlKitToImageRatioY;
      });
      console.log("Normalization complete");
    }
  }

  /**
   * Perform OCR on image and return text blocks
   */
  static async recognizeText(uri: string): Promise<OCRResult> {
    const imageDimensions = await this.getImageDimensions(uri);

    if (imageDimensions.width === 0) {
      throw new Error("Failed to get image dimensions");
    }

    // Recognize text with ML Kit
    const result = await TextRecognition.recognize(uri);

    console.log("OCR Result:", {
      blockCount: result.blocks.length,
      imageDimensions,
      sampleBlocks: result.blocks.slice(0, 3).map((b, i) => ({
        index: i,
        text: b.text.substring(0, 20),
        frame: b.frame,
      })),
    });

    // Convert blocks to our format
    const blocks: TextBlock[] = result.blocks
      .map((block, index) => {
        const frame = block.frame;

        if (!frame) {
          console.warn(`Block ${index} has no frame, skipping`);
          return null;
        }

        const coordinates = this.extractFrameCoordinates(frame, index);
        if (!coordinates) return null;

        return {
          id: `block-${index}`,
          text: block.text.trim(),
          selected: false,
          type: null as "front" | "back" | null,
          frame: coordinates,
        };
      })
      .filter((block): block is TextBlock => block !== null);

    // Normalize ML Kit coordinates to image space
    this.normalizeMLKitCoordinates(blocks, imageDimensions);

    console.log(`Successfully processed ${blocks.length} text blocks`);

    return { blocks, imageDimensions };
  }
}
