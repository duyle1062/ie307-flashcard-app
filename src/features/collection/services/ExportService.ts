import { 
  documentDirectory, 
  cacheDirectory, 
  writeAsStringAsync, 
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { CardService } from "../../card/services/CardService";
import { Collection } from "../../../core/database/types";
import { act } from "react";

export const ExportService = {
  /**
   * Xuất collection ra file JSON
   * Cấu trúc: { name: "Deck Name", cards: [{ front: "...", back: "..." }] }
   */
  exportToJSON: async (collection: Collection) => {
    try {
      // 1. Lấy tất cả cards của collection
      const cards = await CardService.getCardsByCollectionId(collection.id);

      // 2. Format dữ liệu (chỉ lấy front, back)
      const exportData = {
        name: collection.name,
        cards: cards.map((card) => ({
          front: card.front,
          back: card.back,
        })),
      };

      // 3. Tạo file
      const fileName = `${sanitizeFileName(collection.name)}.json`;
      const directory = documentDirectory || cacheDirectory;
      const filePath = `${directory}${fileName}`;
      
      await writeAsStringAsync(
        filePath,
        JSON.stringify(exportData, null, 2),
        { encoding: 'utf8' }
      );

      // 4. Chia sẻ file
      await shareFile(filePath);
    } catch (error) {
      console.error("Export JSON failed:", error);
      Alert.alert("Error", "Failed to export JSON file");
    }
  },

  /**
   * Xuất collection ra file CSV
   * Cấu trúc: front,back (Header)
   */
  exportToCSV: async (collection: Collection) => {
    try {
      // 1. Lấy cards
      const cards = await CardService.getCardsByCollectionId(collection.id);

      // 2. Tạo nội dung CSV
      // Header
      let csvContent = "front,back\n";

      // Rows: Cần escape dấu phẩy và xuống dòng trong nội dung thẻ
      cards.forEach((card) => {
        // biến đổi xuống dòng thành \n
        const front = escapeCSV(card.front);
        const back = escapeCSV(card.back);
        csvContent += `${front},${back}\n`;
      });

      // 3. Tạo file
      const fileName = `${sanitizeFileName(collection.name)}.csv`;
      const directory = documentDirectory || cacheDirectory;
      const filePath = `${directory}${fileName}`;

      await writeAsStringAsync(filePath, csvContent, {
        encoding: 'utf8',
      });

      // 4. Chia sẻ file
      await shareFile(filePath);
    } catch (error) {
      console.error("Export CSV failed:", error);
      Alert.alert("Error", "Failed to export CSV file");
    }
  },
};

// --- Helpers ---

// Chia sẻ file qua OS dialog (Save to Files, AirDrop, Zalo...)
const shareFile = async (filePath: string) => {
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert("Error", "Sharing is not available on this device");
    return;
  }
  await Sharing.shareAsync(filePath);
};

// Làm sạch tên file (xóa ký tự đặc biệt)
const sanitizeFileName = (name: string) => {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
};

// Xử lý chuỗi cho CSV (bọc ngoặc kép nếu có dấu phẩy hoặc xuống dòng)
const escapeCSV = (str: string) => {
  if (!str) return "";
  // 1. Thay thế xuống dòng thật bằng ký tự \n (để giống JSON)
  // Logic: Tìm ký tự newline (\n hoặc \r\n) và thay bằng chuỗi literal "\n"
  let cleanStr = str.replace(/\r?\n/g, "\\n");

  // 2. Nếu có dấu ngoặc kép hoặc dấu phẩy, bọc trong ngoặc kép
  if (cleanStr.includes('"') || cleanStr.includes(",")) {
    // Escape dấu ngoặc kép: " -> ""
    return `"${cleanStr.replace(/"/g, '""')}"`;
  }
  return cleanStr;
};
