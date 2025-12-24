import { executeQuery } from "../database";
import { insertWithSync, generateUUID } from "../helpers";

/**
 * Log a user action
 */
export const logUserAction = async (
  userId: string,
  action: string,
  details?: string
): Promise<void> => {
  try {
    const id = generateUUID();
    const timestamp = new Date().toISOString();
    
    // Sử dụng insertWithSync để log này cũng được sync lên cloud nếu cần
    await insertWithSync("usage_logs", {
      id,
      user_id: userId,
      action,
      timestamp
    });
    
  } catch (error) {
    console.error("Error logging user action:", error);
    // Log lỗi không nên làm crash app
  }
};

/**
 * Get the most frequent study hour
 * Returns the hour (0-23) and the count
 */
export const getMostFrequentStudyHour = async (
  userId: string
): Promise<{ hour: number; count: number } | null> => {
  try {
    // SQLite strftime('%H', timestamp) returns string '00' to '23'
    const result = await executeQuery(
      `SELECT strftime('%H', timestamp, 'localtime') AS hour, COUNT(*) AS count
       FROM usage_logs
       WHERE action = 'start_review' AND user_id = ?
       GROUP BY hour
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      const row = result.rows.item(0);
      return {
        hour: parseInt(row.hour, 10),
        count: row.count
      };
    }
    return null;
  } catch (error) {
    console.error("Error analyzing study hour:", error);
    return null;
  }
};