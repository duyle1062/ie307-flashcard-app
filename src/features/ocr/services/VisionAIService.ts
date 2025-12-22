import * as FileSystem from "expo-file-system/legacy";
import { Alert, Image } from "react-native";
import { TextBlock, ImageDimensions } from "./OCRService";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;

export interface VisionOCRResult {
  blocks: TextBlock[];
  imageDimensions: ImageDimensions;
}

/**
 * Vision AI Service - Handles text recognition using Google Cloud Vision API
 */
export class VisionAIService {
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
          console.warn("Could not get image dimensions:", err);
          resolve({ width: 0, height: 0 });
        }
      );
    });
  }

  /**
   * Convert Google Vision vertices to frame coordinates
   */
  private static convertVerticesToFrame(vertices: any[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const xValues = vertices.map((v: any) => v.x || 0);
    const yValues = vertices.map((v: any) => v.y || 0);

    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    const maxX = Math.max(...xValues);
    const maxY = Math.max(...yValues);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Map Google Vision annotations to TextBlock format
   */
  private static mapAnnotationsToBlocks(annotations: any[]): TextBlock[] {
    return annotations.map((annotation, index) => {
      const frame = this.convertVerticesToFrame(annotation.boundingPoly.vertices);

      return {
        id: `vision-block-${index}`,
        text: annotation.description,
        selected: false,
        type: null,
        frame,
      };
    });
  }

  /**
   * Detect and normalize Vision API coordinate space to image space.
   * This fixes issues where Vision API processes the full resolution image
   * but React Native reports different logical dimensions (e.g. density scaling).
   */
  private static normalizeVisionCoordinates(
    blocks: TextBlock[],
    imageDimensions: ImageDimensions
  ): void {
    if (blocks.length === 0 || imageDimensions.width === 0 || imageDimensions.height === 0) return;

    // Calculate Vision API bounding box (maximum extent of all blocks)
    let visionMaxX = 0;
    let visionMaxY = 0;
    
    blocks.forEach((block) => {
      const rightEdge = block.frame.x + block.frame.width;
      const bottomEdge = block.frame.y + block.frame.height;
      if (rightEdge > visionMaxX) visionMaxX = rightEdge;
      if (bottomEdge > visionMaxY) visionMaxY = bottomEdge;
    });

    if (visionMaxX === 0 || visionMaxY === 0) return;

    // Calculate ratios
    const ratioX = imageDimensions.width / visionMaxX;
    const ratioY = imageDimensions.height / visionMaxY;

    // Check if normalization is needed (if discrepancy is > 10%)
    // Or if the Vision coordinates are significantly larger than the Image dimensions
    const needsNormalization =
      Math.abs(ratioX - 1) > 0.1 || Math.abs(ratioY - 1) > 0.1;

    console.log("=== VISION API COORDINATE ANALYSIS ===");
    console.log("Local Image dimensions:", imageDimensions);
    console.log("Vision API Max Bounds:", { width: visionMaxX, height: visionMaxY });
    console.log("Ratios:", { x: ratioX.toFixed(3), y: ratioY.toFixed(3) });
    console.log("Needs normalization:", needsNormalization);
    console.log("=======================================");

    if (needsNormalization) {
      console.log("Normalizing Vision coordinates to match local image space...");
      blocks.forEach((block) => {
        block.frame.x *= ratioX;
        block.frame.y *= ratioY;
        block.frame.width *= ratioX;
        block.frame.height *= ratioY;
      });
    }
  }

  /**
   * Perform OCR using Google Cloud Vision API
   */
  static async recognizeText(uri: string): Promise<VisionOCRResult> {
    try {
      // Get image dimensions first
      const imageDimensions = await this.getImageDimensions(uri);

      if (imageDimensions.width === 0) {
        throw new Error("Could not get image dimensions");
      }

      // Convert image to Base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      console.log("Sending image to Google Cloud Vision API...");

      // Prepare request body
      const body = JSON.stringify({
        requests: [
          {
            image: {
              content: base64,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 100,
              },
            ],
          },
        ],
      });

      // Call Google Cloud Vision API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Vision API Error:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const json = await response.json();

      console.log("Vision API Response:", {
        hasResponses: !!json.responses,
        hasAnnotations: !!json.responses?.[0]?.textAnnotations,
        annotationCount: json.responses?.[0]?.textAnnotations?.length || 0,
      });

      // Check for errors in response
      if (json.responses?.[0]?.error) {
        const error = json.responses[0].error;
        throw new Error(`Vision API Error: ${error.message}`);
      }

      // Extract text annotations
      if (json.responses && json.responses[0]?.textAnnotations) {
        // textAnnotations[0] is the full text, we skip it and use individual blocks from [1]
        const annotations = json.responses[0].textAnnotations.slice(1);
        const blocks = this.mapAnnotationsToBlocks(annotations);

        console.log(`Successfully processed ${blocks.length} text blocks from Vision API`);

        // 5. NORMALIZE COORDINATES (Fix for misaligned blocks)
        this.normalizeVisionCoordinates(blocks, imageDimensions);

        return { blocks, imageDimensions };
      }

      // No text found
      console.log("No text detected in image");
      return { blocks: [], imageDimensions };
    } catch (error) {
      console.error("Vision AI Error:", error);
      Alert.alert(
        "Vision AI Error",
        error instanceof Error ? error.message : "Failed to connect to Google Cloud Vision API"
      );
      throw error;
    }
  }

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return GOOGLE_API_KEY !== "YOUR_GOOGLE_CLOUD_VISION_API_KEY";
  }
}
