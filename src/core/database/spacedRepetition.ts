import { updateCardSRS } from "./repositories/CardRepository";
import {
  createReview,
  countNewCardsStudiedToday,
  countReviewCardsStudiedToday,
} from "./repositories/ReviewRepository";
import { getDueCards, getNewCards } from "./repositories/CardRepository";
import { Card, CardStatus, StudyQueue, DailyLimits } from "./types";
import { executeQuery } from "./database";
import i18next from "i18next";

// Helper: Chuyển đổi đơn vị thời gian sang hiển thị
export const formatInterval = (interval: number): string => {
  if (interval <= 0.02) return "1m"; // ~1 phút
  if (interval <= 0.06) return "6m"; // ~6 phút
  if (interval <= 0.1) return "10m"; // ~10 phút
  if (interval < 1) return `${Math.round(interval * 24 * 60)}m`;
  return `${Math.round(interval)}d`;
};

/**
 * Format interval cho button preview (hiển thị chính xác theo spec)
 * Dùng để hiển thị trên các nút Again, Hard, Good, Easy
 */
export const formatIntervalForButton = (
  card: Card,
  rating: 1 | 2 | 3 | 4
): string => {
  const currentStatus = (card.status || "new") as CardStatus;
  const interval = card.interval || 0;
  const ef = card.ef || 2.5;

  // NEW cards
  if (currentStatus === "new") {
    if (rating === 1) return i18next.t("study.time_1min"); // Again: 1 phút
    if (rating === 2) return i18next.t("study.time_6min"); // Hard: 6 phút
    if (rating === 3) return i18next.t("study.time_10min"); // Good: 10 phút
    if (rating === 4) return i18next.t("study.time_5d"); // Easy: 5 ngày
  }

  // LEARNING cards
  if (currentStatus === "learning") {
    if (rating === 1) return i18next.t("study.time_1min"); // Again: 1 phút
    if (rating === 2) return i18next.t("study.time_10min"); // Hard: 10 phút
    if (rating === 3) return i18next.t("study.time_1d"); // Good: 1 ngày
    if (rating === 4) return i18next.t("study.time_5d"); // Easy: 5 ngày
  }

  // REVIEW cards
  if (currentStatus === "review") {
    if (rating === 1) return i18next.t("study.time_1min"); // Again: 1 phút (quay lại Learning)
    if (rating === 2) {
      // Hard: interval × 1.2
      const newInterval = Math.round(interval * 1.2);
      return i18next.t("study.time_days", { count: newInterval });
    }
    if (rating === 3) {
      // Good: interval × EF
      const newInterval = Math.round(interval * ef);
      return i18next.t("study.time_days", { count: newInterval });
    }
    if (rating === 4) {
      // Easy: interval × EF × 1.3
      const newInterval = Math.round(interval * ef * 1.3);
      return i18next.t("study.time_days", { count: newInterval });
    }
  }

  return "-";
};

/**
 * Tính toán kết quả SRS (Preview) mà không lưu DB
 * Dùng để hiển thị lên nút bấm và xử lý logic
 */
export const calculateSRSResult = (card: Card, rating: 1 | 2 | 3 | 4) => {
  const currentStatus = (card.status || "new") as CardStatus;
  const oldInterval = card.interval || 0;
  const oldEf = card.ef || 2.5;

  let newInterval = oldInterval;
  let newStatus: CardStatus = currentStatus;
  let newEf = oldEf;

  // --- 1. LOGIC NEW ---
  if (currentStatus === "new") {
    if (rating === 1) {
      // Again
      newInterval = 0.02; // 1 phút (~0.02 ngày)
      newStatus = "learning";
    } else if (rating === 2) {
      // Hard
      newInterval = 0.06; // 6 phút (~0.06 ngày)
      newStatus = "learning";
    } else if (rating === 3) {
      // Good
      newInterval = 0.1; // 10 phút (~0.1 ngày)
      newStatus = "learning"; // Vẫn ở LEARNING theo spec
    } else if (rating === 4) {
      // Easy
      newInterval = 5; // 5 ngày
      newStatus = "review"; // Chỉ Easy mới chuyển sang review
    }
  }
  // --- 2. LOGIC LEARNING ---
  else if (currentStatus === "learning") {
    if (rating === 1) {
      // Again
      newInterval = 0.02; // 1 phút
      newStatus = "learning";
    } else if (rating === 2) {
      // Hard
      newInterval = 0.1; // 10 phút
      newStatus = "learning";
    } else if (rating === 3) {
      // Good
      newInterval = 1; // 1 ngày -> Graduate
      newStatus = "review";
    } else if (rating === 4) {
      // Easy
      newInterval = 5; // 5 ngày -> Graduate
      newStatus = "review";
    }
  }
  // --- 3. LOGIC REVIEW ---
  else if (currentStatus === "review") {
    if (rating === 1) {
      // Again
      newInterval = 0.02; // 1 phút (~0.02 ngày)
      newStatus = "learning"; // Lapse
      // EF giảm (bên dưới)
    } else if (rating === 2) {
      // Hard
      newInterval = oldInterval * 1.2;
      newStatus = "review";
    } else if (rating === 3) {
      // Good
      newInterval = oldInterval * oldEf;
      newStatus = "review";
    } else if (rating === 4) {
      // Easy
      newInterval = oldInterval * oldEf * 1.3;
      newStatus = "review";
    }

    // Cập nhật EF (Chỉ áp dụng khi ở Review hoặc Lapse từ Review)
    // Công thức: EF' = EF + (0.1 - (3-q)*(0.08+(3-q)*0.02))
    // q: 1=Again, 2=Hard, 3=Good, 4=Easy
    const modifier = 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02);
    newEf = Math.max(1.3, oldEf + modifier);
  }

  return { newInterval, newStatus, newEf };
};

/**
 * Tính Due Date từ interval
 */
const calculateDueDate = (interval: number): string => {
  const now = new Date();
  if (interval < 1) {
    // Nếu < 1 ngày: Cộng phút (để học lại ngay trong ngày)
    now.setMinutes(now.getMinutes() + Math.round(interval * 24 * 60));
  } else {
    // Nếu >= 1 ngày: Cộng ngày
    now.setDate(now.getDate() + Math.round(interval));
  }
  return now.toISOString(); // Format đầy đủ để so sánh chính xác
};

/**
 * Xử lý khi trả lời thẻ (Lưu DB)
 */
export const onAnswer = async (
  userId: string,
  card: Card,
  rating: 1 | 2 | 3 | 4
): Promise<Card> => {
  try {
    // 1. Tính toán
    const { newInterval, newStatus, newEf } = calculateSRSResult(card, rating);
    const newDueDate = calculateDueDate(newInterval);

    // 2. Cập nhật Card
    const updatedCard = await updateCardSRS(
      card.id,
      newStatus,
      newInterval,
      newEf,
      newDueDate
    );

    // 3. Log Review
    if (updatedCard) {
      await createReview(
        userId,
        card.id,
        rating,
        card.interval || 0,
        newInterval,
        card.ef || 2.5,
        newEf
      );
    }

    return updatedCard || card;
  } catch (error) {
    console.error("Error processing card answer:", error);
    throw error;
  }
};

/**
 * Tính Ease Factor (EF) mới dựa trên công thức SM-2
 * Chỉ cập nhật khi thẻ đang ở trạng thái REVIEW
 */
const calculateNewEf = (oldEf: number, rating: number): number => {
  // Công thức: EF' = EF + (0.1 - (5-q)*(0.08+(5-q)*0.02))
  // Mapping rating của ta: 1(Again) -> q=?
  // Pseudo-code của bạn: EF' = EF + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
  // Rating: 1=Again, 2=Hard, 3=Good, 4=Easy

  const modifier = 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02);
  const newEf = oldEf + modifier;

  // EF không bao giờ giảm dưới 1.3
  return Math.max(1.3, newEf);
};

/**
 * Lấy hàng đợi học tập cho ngày hôm nay
 * Logic: Independent Queues (New limit độc lập với Review limit)
 */
export const getTodaysQueue = async (
  userId: string,
  collectionId: string
): Promise<StudyQueue> => {
  try {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const nowISO = new Date().toISOString(); // Full timestamp cho so sánh chính xác

    // 1. Lấy giới hạn (Settings) từ User
    const userRes = await executeQuery(
      "SELECT daily_new_cards_limit, daily_review_cards_limit FROM users WHERE id = ?",
      [userId]
    );

    if (userRes.rows.length === 0) throw new Error("User not found");

    const settings = userRes.rows.item(0);
    const limitNew = settings.daily_new_cards_limit || 25; // Default 25 theo spec
    const limitReview = settings.daily_review_cards_limit || 50;

    // 2. Đếm số lượng đã học hôm nay (Từ bảng reviews)
    // QUAN TRỌNG: Chỉ đếm New và Review, KHÔNG đếm Learning
    // Learning là KẾT QUẢ của việc học New/Review, không phải input
    const countNewDone = await countNewCardsStudiedToday(userId);
    const countReviewDone = await countReviewCardsStudiedToday(userId);

    // 3. Tính Quota còn lại
    // New limit: Giới hạn số new cards được giới thiệu
    // Review limit: Giới hạn số review cards due
    // Learning: KHÔNG GIỚI HẠN (theo chuẩn Anki)
    const remainingNew = Math.max(0, limitNew - countNewDone);
    const remainingReview = Math.max(0, limitReview - countReviewDone);

    // 4. Query lấy thẻ
    let reviewCards: Card[] = [];
    let learningCards: Card[] = [];
    let newCards: Card[] = [];

    // 4.1 Get Learning Cards (KHÔNG GIỚI HẠN - theo chuẩn Anki)
    // Learning là cards đang học dở, cần xuất hiện lại trong session
    const learningRes = await executeQuery(
      `SELECT * FROM cards 
       WHERE collection_id = ? 
       AND status = 'learning' 
       AND due_date <= ? 
       AND is_deleted = 0
       ORDER BY due_date ASC`,
      [collectionId, nowISO]
    );

    for (let i = 0; i < learningRes.rows.length; i++) {
      learningCards.push(learningRes.rows.item(i));
    }

    // 4.2 Get Review Cards (CÓ GIỚI HẠN)
    // Chỉ lấy review cards, không bao gồm learning
    if (remainingReview > 0) {
      const reviewRes = await executeQuery(
        `SELECT * FROM cards 
         WHERE collection_id = ? 
         AND status = 'review' 
         AND due_date <= ? 
         AND is_deleted = 0
         ORDER BY due_date ASC 
         LIMIT ?`,
        [collectionId, nowISO, remainingReview]
      );

      for (let i = 0; i < reviewRes.rows.length; i++) {
        reviewCards.push(reviewRes.rows.item(i));
      }
    }

    // 4.3 Get New Cards (CÓ GIỚI HẠN)
    if (remainingNew > 0) {
      const newRes = await executeQuery(
        `SELECT * FROM cards 
         WHERE collection_id = ? 
         AND status = 'new' 
         AND is_deleted = 0
         ORDER BY created_at ASC 
         LIMIT ?`,
        [collectionId, remainingNew]
      );

      for (let i = 0; i < newRes.rows.length; i++) {
        newCards.push(newRes.rows.item(i));
      }
    }

    // 5. Trả về cấu trúc StudyQueue
    // reviewCards bây giờ bao gồm: Learning (không giới hạn) + Review (có giới hạn)
    return {
      reviewCards: [...learningCards, ...reviewCards], // Learning ưu tiên trước
      newCards,
      stats: {
        newCardsStudied: countNewDone,
        newCardsRemaining: remainingNew,
        reviewCardsStudied: countReviewDone,
        reviewCardsRemaining: remainingReview,
        totalCardsToday: countNewDone + countReviewDone,
        totalCardsRemaining:
          remainingNew + remainingReview + learningCards.length,
      },
    };
  } catch (error) {
    console.error("Queue Error:", error);
    throw error;
  }
};

/**
 * Check if user has reached daily limits
 */
export const checkDailyLimits = async (
  userId: string,
  dailyNewLimit: number = 25,
  dailyReviewLimit: number = 50
): Promise<DailyLimits> => {
  try {
    const newCardsStudied = await countNewCardsStudiedToday(userId);
    const reviewCardsStudied = await countReviewCardsStudiedToday(userId);

    return {
      newCards: {
        studied: newCardsStudied,
        limit: dailyNewLimit,
        remaining: Math.max(0, dailyNewLimit - newCardsStudied),
        reachedLimit: newCardsStudied >= dailyNewLimit,
      },
      reviewCards: {
        studied: reviewCardsStudied,
        limit: dailyReviewLimit,
        remaining: Math.max(0, dailyReviewLimit - reviewCardsStudied),
        reachedLimit: reviewCardsStudied >= dailyReviewLimit,
      },
      allLimitsReached:
        newCardsStudied >= dailyNewLimit &&
        reviewCardsStudied >= dailyReviewLimit,
    };
  } catch (error) {
    console.error("Error checking daily limits:", error);
    throw error;
  }
};
