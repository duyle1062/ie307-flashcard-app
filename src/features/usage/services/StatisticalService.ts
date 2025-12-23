import { 
    getUserReviewStats, 
    getTopCollectionsByReviews, 
    getTopCardsByReviews, 
    TopCollectionStat, 
    TopCardStat  
} from "../../../core/database/repositories/ReviewRepository";
import { getMostFrequentStudyHour } from "../../../core/database/repositories/UsageLogRepository";
import { ReviewStats } from "../../../shared/types";

export interface DashboardData {
  reviewStats: ReviewStats;
  mostFrequentHour: { hour: number; count: number } | null;
  topCollections: TopCollectionStat[];
  topCards: TopCardStat[];
}

export class StatisticalService {
  /**
   * Lấy toàn bộ dữ liệu thống kê cho màn hình Dashboard
   */
  static async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Chạy song song các query để tối ưu hiệu năng
      const [reviewStats, mostFrequentHour, topCollections, topCards] = await Promise.all([
        getUserReviewStats(userId),
        getMostFrequentStudyHour(userId),
        getTopCollectionsByReviews(userId),
        getTopCardsByReviews(userId)
      ]);

      return {
        reviewStats,
        mostFrequentHour,
        topCollections,
        topCards
      };
    } catch (error) {
      console.error("StatisticalService: Error getting dashboard data:", error);
      throw error;
    }
  }
}
