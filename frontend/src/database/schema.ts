// SQLite Database Schema for Offline Storage
// Note: SQLite uses TEXT for UUID

export const DB_NAME = "flashcard.db";
export const DB_VERSION = "1.0";

// SQL statements to create all tables
export const CREATE_TABLES = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      picture TEXT,
      streak_days INTEGER DEFAULT 0,
      last_active_date TEXT,
      daily_new_cards_limit INTEGER DEFAULT 25,
      daily_review_cards_limit INTEGER DEFAULT 50,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,

  collections: `
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  cards: `
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      collection_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review')),
      interval INTEGER DEFAULT 0,
      ef REAL DEFAULT 2.5,
      due_date TEXT,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  reviews: `
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER CHECK (rating BETWEEN 1 AND 4),
      old_interval INTEGER,
      new_interval INTEGER,
      old_ef REAL,
      new_ef REAL,
      reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  usage_logs: `
    CREATE TABLE IF NOT EXISTS usage_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  // Table to track what needs to be synced
  sync_queue: `
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
      data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

// Create indexes for better query performance
export const CREATE_INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);",
  "CREATE INDEX IF NOT EXISTS idx_collections_is_deleted ON collections(is_deleted);",
  "CREATE INDEX IF NOT EXISTS idx_cards_collection_id ON cards(collection_id);",
  "CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);",
  "CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);",
  "CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);",
  "CREATE INDEX IF NOT EXISTS idx_cards_is_deleted ON cards(is_deleted);",
  "CREATE INDEX IF NOT EXISTS idx_reviews_card_id ON reviews(card_id);",
  "CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);",
  "CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(reviewed_at);",
  "CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);",
  "CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);",
  "CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);",
];
