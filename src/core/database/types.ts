/**
 * Database Type Definitions
 */

// Card status enum
export type CardStatus = 'new' | 'learning' | 'review';

// Sync queue operation enum
export type SyncOperation = "INSERT" | "UPDATE" | "DELETE";

// User model (matches SQLite schema)
export interface User {
  id: string;
  email: string;
  display_name?: string;
  picture?: string;
  password_hash?: string;
  streak_days: number;
  last_active_date?: string;
  daily_new_cards_limit: number;
  daily_review_cards_limit: number;
  created_at: string;
  updated_at: string;
}

// Collection model
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  count_new?: number;
  count_learning?: number;
  count_review?: number;
  is_deleted: number; // SQLite uses 0/1 for boolean
  created_at: string;
  updated_at: string;
}

// Collection with statistics
export interface CollectionWithStats extends Collection {
  total_cards: number;
  new_cards: number;
  learning_cards: number;
  review_cards: number;
  due_cards: number;
}

// Card model
export interface Card {
  id: string;
  user_id: string;
  collection_id: string;
  front: string;
  back: string;
  status: CardStatus;
  interval: number;
  ef: number;
  due_date: string;
  is_deleted: number; // SQLite uses 0/1 for boolean
  created_at: string;
  updated_at: string;
}

// Review model
export interface Review {
  id: string;
  user_id: string;
  card_id: string;
  rating: number; // 1-4
  old_interval: number;
  new_interval: number;
  old_ef: number;
  new_ef: number;
  reviewed_at: string;
}

// Usage log model
export interface UsageLog {
  id: string;
  user_id: string;
  action_type: string;
  details?: string;
  created_at: string;
}

// Sync queue model
export interface SyncQueue {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: SyncOperation;
  data: string; // JSON string
  created_at: string;
}

// SQL result row
export interface SQLResultSetRowList {
  length: number;
  item(index: number): any;
}

export interface SQLResultSet {
  insertId?: number;
  rowsAffected: number;
  rows: SQLResultSetRowList;
}

export interface SQLTransaction {
  executeSql(
    sqlStatement: string,
    args?: any[],
    callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
    errorCallback?: (transaction: SQLTransaction, error: SQLError) => boolean
  ): void;
}

export interface SQLError {
  code: number;
  message: string;
}

// Study queue result
export interface StudyQueue {
  newCards: Card[];
  reviewCards: Card[];
  stats: {
    newCardsStudied: number;
    newCardsRemaining: number;
    reviewCardsStudied: number;
    reviewCardsRemaining: number;
    totalCardsToday: number;
    totalCardsRemaining: number;
  };
}

// Study statistics
export interface StudyStats {
  newCardsStudied: number;
  newCardsRemaining: number;
  reviewCardsStudied: number;
  reviewCardsRemaining: number;
  totalCardsToday: number;
  totalCardsRemaining: number;
}

// Daily limits check result
export interface DailyLimits {
  newCards: {
    studied: number;
    limit: number;
    remaining: number;
    reachedLimit: boolean;
  };
  reviewCards: {
    studied: number;
    limit: number;
    remaining: number;
    reachedLimit: boolean;
  };
  allLimitsReached: boolean;
}

// Review statistics
export interface ReviewStats {
  today_count: number;
  week_count: number;
  month_count: number;
  total_count: number;
  avg_rating: number;
}

// Storage keys
export interface StorageKeys {
  LAST_SYNC_TIMESTAMP: string;
  USER_ID: string;
  AUTH_TOKEN: string;
  USER_DATA: string;
}

// Database configuration
export interface DatabaseConfig {
  name: string;
  version: string;
  description: string;
  size: number;
  location: string;
}
