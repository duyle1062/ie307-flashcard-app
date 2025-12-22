import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy"; 
import { CollectionService } from "./CollectionService";
import { CardService } from "../../card/services/CardService";
import { Alert } from "react-native";

export const ImportService = {
  pickAndImport: async (userId: string, type: "csv" | "json") => {
    try {
      // 1. Mở trình chọn file
      const result = await DocumentPicker.getDocumentAsync({
        type: type === "csv" ? ["text/csv", "text/comma-separated-values", "application/csv"] : "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return false;

      const file = result.assets[0];
      const fileUri = file.uri;
      const fileName = file.name.split(".")[0]; // Lấy tên file làm tên Collection
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' });

      // 3. Tạo Collection mới
      // Tái sử dụng CollectionService để đảm bảo logic (sync, default values)
      const newCollection = await CollectionService.createCollection(userId, fileName);
      
      if (!newCollection) throw new Error("Could not create collection");

      // 4. Parse dữ liệu và tạo Cards
      let cardCount = 0;
      if (type === "json") {
        cardCount = await processJSON(content, newCollection.id);
      } else {
        cardCount = await processCSV(content, newCollection.id);
      }

      return { success: true, collectionName: fileName, count: cardCount };
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert("Import Error", "Failed to parse the file. Please check the format.");
      return { success: false };
    }
  },
};

// --- Helper Functions ---

const processJSON = async (content: string, collectionId: string) => {
  try {
    const data = JSON.parse(content);
    // Hỗ trợ cả 2 format: Array trực tiếp hoặc Object có key 'cards'
    const cards = Array.isArray(data) ? data : (data.cards || []);
    
    let count = 0;
    for (const card of cards) {
      if (card.front && card.back) {
        await CardService.createCard(collectionId, card.front, card.back);
        count++;
      }
    }
    return count;
  } catch (e) {
    throw new Error("Invalid JSON format");
  }
};

const processCSV = async (content: string, collectionId: string) => {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
  let count = 0;

  // Bỏ qua dòng header nếu có (kiểm tra dòng đầu có chứa "front,back" không)
  const startIndex = lines[0].toLowerCase().includes("front,back") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    // Regex đơn giản để tách CSV: Tách bằng dấu phẩy, nhưng bỏ qua dấu phẩy trong ngoặc kép
    // Tuy nhiên, với định dạng "Flatten CSV" ta đã thống nhất: "front","back"
    // Ta có thể parse thủ công an toàn hơn:
    
    const parts = parseCSVLine(line);
    if (parts.length >= 2) {
      const front = unescapeCSV(parts[0]);
      const back = unescapeCSV(parts[1]);
      
      if (front && back) {
        await CardService.createCard(collectionId, front, back);
        count++;
      }
    }
  }
  return count;
};

// Hàm decode CSV (ngược lại với hàm escapeCSV trong ExportService)
const unescapeCSV = (str: string) => {
  if (!str) return "";
  // 1. Xóa ngoặc kép bao quanh (nếu có)
  let content = str.replace(/^"|"$/g, '');
  // 2. Unescape dấu ngoặc kép ("" -> ")
  content = content.replace(/""/g, '"');
  // 3. Đổi chữ "\n" thành xuống dòng thật (Logic Flatten CSV)
  content = content.replace(/\\n/g, '\n'); 
  return content;
};

// Hàm tách dòng CSV an toàn
const parseCSVLine = (text: string) => {
  // Logic tách dựa trên dấu phẩy, có xử lý ngoặc kép
  // Với format chuẩn export của chúng ta: "Data 1","Data 2"
  const result = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') { inQuote = !inQuote; }
    else if (char === ',' && !inQuote) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
};
