import { updateCardSRS } from "./repositories/CardRepository";
import {
  createReview,
  countNewCardsStudiedToday,
  countReviewCardsStudiedToday,
} from "./repositories/ReviewRepository";
import { getDueCards, getNewCards } from "./repositories/CardRepository";
import { Card, CardStatus, StudyQueue, DailyLimits } from "./types";

/**
 * Spaced Repetition System (SM-2 Algorithm)
 * Implements the SuperMemo-2 algorithm for optimal card scheduling
 *
 * Rating system:
 * 1 - Again (wrong): Reset card, show again soon
 * 2 - Hard (barely remembered): Reduce interval slightly
 * 3 - Good (correct with effort): Normal progression
 * 4 - Easy (perfect recall): Increase interval significantly
 *
 * Status transitions:
 * new -> learning (after first review)
 * learning -> learning (if rating < 3)
 * learning -> review (if rating >= 3 and interval >= 1 day)
 * review -> review (continue with longer intervals)
 * review -> learning (if rating = 1, reset)
 */

/**
 * Calculate new interval based on SM-2 algorithm
 */
const calculateInterval = (
  oldInterval: number,
  ef: number,
  rating: number
): number => {
  if (rating === 1) {
    // Again - reset to 0 (will be shown in learning queue)
    return 0;
  }

  if (oldInterval === 0) {
    // First review
    if (rating === 2) return 0.1; // 2.4 hours (hard)
    if (rating === 3) return 0.5; // 12 hours (good)
    if (rating === 4) return 1; // 1 day (easy)
  }

  if (oldInterval < 1) {
    // Learning phase (< 1 day)
    if (rating === 2) return oldInterval; // Same interval
    if (rating === 3) return 1; // Graduate to 1 day
    if (rating === 4) return 4; // Skip to 4 days
  }

  // Review phase (>= 1 day)
  let newInterval: number;

  if (rating === 2) {
    // Hard - multiply by 1.2
    newInterval = oldInterval * 1.2;
  } else if (rating === 3) {
    // Good - multiply by EF
    newInterval = oldInterval * ef;
  } else if (rating === 4) {
    // Easy - multiply by EF * 1.3
    newInterval = oldInterval * ef * 1.3;
  } else {
    newInterval = oldInterval;
  }

  // Round to nearest day
  return Math.round(newInterval);
};

/**
 * Calculate new Ease Factor based on SM-2 algorithm
 */
const calculateEaseFactor = (oldEf: number, rating: number): number => {
  // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Where q is quality (0-5), we map our rating (1-4) to quality (1-5)
  const quality = rating + 1; // 1->2, 2->3, 3->4, 4->5

  const newEf = oldEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // EF should never go below 1.3
  return Math.max(1.3, newEf);
};

/**
 * Determine new card status based on interval and rating
 */
const calculateStatus = (
  currentStatus: CardStatus,
  newInterval: number,
  rating: number
): CardStatus => {
  if (rating === 1) {
    // Failed - back to learning
    return "learning";
  }

  if (currentStatus === "new") {
    // First review - move to learning
    return "learning";
  }

  if (newInterval >= 1) {
    // Graduated to review (1 day or more)
    return "review";
  }

  // Still in learning phase
  return "learning";
};

/**
 * Calculate due date based on current date and interval
 */
const calculateDueDate = (interval: number): string => {
  const now = new Date();

  if (interval < 1) {
    // For intervals less than 1 day, add hours
    const hours = interval * 24;
    now.setHours(now.getHours() + hours);
  } else {
    // For intervals >= 1 day, add days
    now.setDate(now.getDate() + interval);
  }

  // Return in YYYY-MM-DD format
  return now.toISOString().split("T")[0];
};

/**
 * Process a card answer and update SRS fields
 */
export const onAnswer = async (
  userId: string,
  card: Card,
  rating: number
): Promise<Card | null> => {
  try {
    // Validate rating
    if (rating < 1 || rating > 4) {
      throw new Error("Rating must be between 1 and 4");
    }

    // Store old values for review record
    const oldInterval = card.interval || 0;
    const oldEf = card.ef || 2.5;
    const oldStatus = card.status || "new";

    // Calculate new values
    const newInterval = calculateInterval(oldInterval, oldEf, rating);
    const newEf = calculateEaseFactor(oldEf, rating);
    const newStatus = calculateStatus(oldStatus, newInterval, rating);
    const dueDate = calculateDueDate(newInterval);

    // Update card in database
    const updatedCard = await updateCardSRS(
      card.id,
      newStatus,
      newInterval,
      newEf,
      dueDate
    );

    // Create review record
    await createReview(
      userId,
      card.id,
      rating,
      oldInterval,
      newInterval,
      oldEf,
      newEf
    );

    console.log("Card answered successfully:", {
      cardId: card.id,
      rating,
      oldInterval,
      newInterval,
      oldEf,
      newEf,
      oldStatus,
      newStatus,
      dueDate,
    });

    return updatedCard;
  } catch (error) {
    console.error("Error processing card answer:", error);
    throw error;
  }
};

/**
 * Get today's study queue with daily limits applied
 */
export const getTodaysQueue = async (
  userId: string,
  dailyNewLimit: number = 25,
  dailyReviewLimit: number = 50,
  collectionId?: string
): Promise<StudyQueue> => {
  try {
    // Count cards already studied today
    const newCardsStudied = await countNewCardsStudiedToday(userId);
    const reviewCardsStudied = await countReviewCardsStudiedToday(userId);

    // Calculate remaining limits
    const remainingNewCards = Math.max(0, dailyNewLimit - newCardsStudied);
    const remainingReviewCards = Math.max(
      0,
      dailyReviewLimit - reviewCardsStudied
    );

    // Get due cards (review cards)
    let reviewCards: Card[] = [];
    if (remainingReviewCards > 0) {
      const allDueCards = await getDueCards(collectionId);
      // Filter out new cards (only want cards with interval > 0)
      reviewCards = allDueCards
        .filter((card) => card.interval > 0)
        .slice(0, remainingReviewCards);
    }

    // Get new cards
    let newCards: Card[] = [];
    if (remainingNewCards > 0) {
      newCards = await getNewCards(collectionId, remainingNewCards);
    }

    return {
      newCards,
      reviewCards,
      stats: {
        newCardsStudied,
        newCardsRemaining: remainingNewCards,
        reviewCardsStudied,
        reviewCardsRemaining: remainingReviewCards,
        totalCardsToday: newCardsStudied + reviewCardsStudied,
        totalCardsRemaining: remainingNewCards + remainingReviewCards,
      },
    };
  } catch (error) {
    console.error("Error getting today's queue:", error);
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
