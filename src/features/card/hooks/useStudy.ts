import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { CardService } from "../services/CardService";
import { Card} from "../../../shared/types";
import { calculateSRSResult } from "../../../core/database/spacedRepetition";
import { UserService } from "../../../features/user/services/UserService";
import { useAuth } from "../../../shared/context/AuthContext";

export interface StudyStats {
  new: number;
  learning: number;
  review: number;
}

interface UseStudyParams {
  collectionId: string;
  userId: string | undefined;
}

interface UseStudyReturn {
  // State
  cards: Card[];
  currentCard: Card | undefined;
  stats: StudyStats;
  isFlipped: boolean;
  isLoading: boolean;
  // Computed Properties
  isFinished: boolean; // Đã học hết hàng đợi chưa
  isEmpty: boolean;    // Collection không có thẻ nào để học
  currentIndex: number;
  // Actions
  handleFlip: () => void;
  handleRate: (rating: 1 | 2 | 3 | 4) => Promise<void>;
  reload: () => Promise<void>;
}

export const useStudy = ({ collectionId, userId }: UseStudyParams): UseStudyReturn => {
  const [queueCards, setQueueCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // State thống kê (Hiển thị trên Header)
  const [stats, setStats] = useState<StudyStats>({ 
    new: 0, 
    learning: 0, 
    review: 0 
  });

  // Ref để đánh dấu đã cập nhật streak cho session này chưa
  const { refreshUser } = useAuth();
  const streakUpdatedRef = useRef(false);

  // --- ACTIONS ---

  /**
   * Load Session: Lấy hàng đợi từ DB dựa trên thuật toán SRS
   */
  const loadSession = useCallback(async () => {
    // Validate inputs
    if (!userId || !collectionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Gọi Service lấy hàng đợi (đã tính toán limit & due date)
      const queue = await CardService.getStudyQueue(userId, collectionId);
      
      // 2. Gộp Review và New thành 1 danh sách phẳng để chạy slide
      // Ưu tiên Review trước, New sau
      const combinedCards = [...queue.reviewCards, ...queue.newCards];
      setQueueCards(combinedCards);

      const countNew = queue.newCards.length;
      const countLearning = queue.reviewCards.filter(c => c.status === 'learning').length;
      const countReview = queue.reviewCards.filter(c => c.status === 'review').length;

      // 3. Cập nhật thống kê ban đầu từ DB trả về
     setStats({
        new: countNew,
        learning: countLearning,
        review: countReview
      });

      // Reset vị trí
      setCurrentIndex(0);
      setIsFlipped(false);

    } catch (error) {
      console.error("Error loading study session:", error);
      Alert.alert("Error", "Failed to load study session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, collectionId]);

  /**
   * Initial load
   */
  useEffect(() => { loadSession();}, [loadSession]);

  /**
   * Handle flip card
   */
  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  /**
   * Handle Rate Card (Logic quan trọng nhất)
   * @param rating 1: Again, 2: Hard, 3: Good, 4: Easy
   */
  const handleRate = useCallback(async (rating: 1 | 2 | 3 | 4) => {
    const currentCard = queueCards[currentIndex];

    if (!currentCard || !userId) return;

    try {
      // 1. Tính toán trước kết quả để quyết định re-queue
      const srsResult = calculateSRSResult(currentCard, rating);
      
      // 2. Lưu xuống DB
      await CardService.answerCard(userId, currentCard, rating);

      // 3. Xử lý Re-queue (Học lại trong phiên)
      // Nếu interval < 1 ngày (ví dụ 10 phút), thẻ cần xuất hiện lại.
      const shouldRequeue = srsResult.newInterval < 1;

      setQueueCards(prev => {
        const nextQueue = [...prev];
        if (shouldRequeue) {
          // Clone thẻ và cập nhật trạng thái tạm thời để hiển thị lại
          const requeuedCard = { 
            ...currentCard, 
            status: srsResult.newStatus, 
            interval: srsResult.newInterval,
            ef: srsResult.newEf
          };
          // Đẩy xuống cuối hàng đợi
          nextQueue.push(requeuedCard);
        }
        return nextQueue;
      });
      // 2. OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
      setStats((prev) => {
        const newStats = { ...prev };
        const oldType = currentCard.status || 'new';
        
        // Giảm count cũ
        if (oldType === 'new') newStats.new = Math.max(0, newStats.new - 1);
        else if (oldType === 'learning') newStats.learning = Math.max(0, newStats.learning - 1);
        else if (oldType === 'review') newStats.review = Math.max(0, newStats.review - 1);

        // Nếu requeue -> Nó trở thành thẻ Learning (đang học dở)
        if (shouldRequeue) {
          newStats.learning++;
        }
        // Nếu không requeue -> Đã graduate/review xong -> Không cộng lại vào queue hiện tại
        
        return newStats;
      });

      // 3. NEXT CARD: Chuyển sang thẻ tiếp theo
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);

    } catch (error) {
      console.error("Error answering card:", error);
      Alert.alert("Error", "Failed to save progress. Please try again.");
    }
  }, [queueCards, currentIndex, userId]);
  
  // Kiểm tra đã học hết cards trong queue ngày hôm nay chưa
  // Finish khi: đã học hết queue HOẶC queue rỗng nhưng collection có cards (nghĩa là hết hạn ngạch ngày)
  const isFinished = !isLoading && (
    (currentIndex >= queueCards.length && queueCards.length > 0) || 
    (queueCards.length === 0 && (stats.new > 0 || stats.learning > 0 || stats.review > 0))
  );
  
  // Kiểm tra collection có trống trơn không (chưa có thẻ nào được tạo)
  // isEmpty chỉ khi: không có queue VÀ stats = 0 (nghĩa là collection thực sự rỗng)
  const isEmpty = !isLoading && queueCards.length === 0 && stats.new === 0 && stats.learning === 0 && stats.review === 0;

  useEffect(() => {
    const updateStreak = async () => {
      // Chỉ chạy khi đã finish, có userId và chưa chạy lần nào trong session này
      if (isFinished && userId && !streakUpdatedRef.current) {
        streakUpdatedRef.current = true; // Mark as done immediately
        
        try {
          console.log("🎓 Session finished! Checking streak...");
          const updatedUser = await UserService.updateDailyStreak(userId);
          
          if (updatedUser) {
             await refreshUser();
             console.log("✅ Global User State refreshed with new streak:", updatedUser.streak_days);
          }
        } catch (error) {
          console.error("Failed to update streak:", error);
        }
      }
    };

    updateStreak();
  }, [isFinished, userId, refreshUser]);

  return {
    currentCard: queueCards[currentIndex],
    cards: queueCards,
    stats,
    isFlipped,
    isLoading,
    isFinished,
    isEmpty,
    currentIndex,
    handleFlip,
    handleRate,
    reload: loadSession
  };
};
