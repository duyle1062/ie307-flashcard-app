import { SQLiteDatabase } from "expo-sqlite";

export const logTableData = async (db: SQLiteDatabase, tableName: string) => {
  try {
    // Lấy toàn bộ dữ liệu trong bảng
    const result = await db.getAllAsync(`SELECT * FROM ${tableName}`);

    console.log(`\n========== DATA IN TABLE: ${tableName} ==========`);
    if (result.length === 0) {
      console.log("(Bảng trống)");
    } else {
      // In ra dạng bảng JSON dễ nhìn
      console.log(JSON.stringify(result, null, 2));
    }
    console.log("===============================================\n");
  } catch (error) {
    console.error(`Lỗi khi đọc bảng ${tableName}:`, error);
  }
};
