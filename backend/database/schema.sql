-- ===============================
-- Flashcard App Database Schema for Neon PostgreSQL
-- Based on Spaced Repetition System (SRS) with Offline-First architecture
-- ===============================

-- Enable UUID extension (required for UUID support in PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================
-- 1️⃣ USERS
-- ===============================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    picture TEXT,
    streak_days INTEGER DEFAULT 0,
    last_active_date DATE,
    daily_new_cards_limit INTEGER DEFAULT 25,
    daily_review_cards_limit INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 2️⃣ COLLECTIONS
-- ===============================
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 3️⃣ CARDS
-- ===============================
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'learning', 'review')) DEFAULT 'new',
    interval INTEGER DEFAULT 0,
    ef FLOAT DEFAULT 2.5,
    due_date DATE,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 4️⃣ REVIEWS
-- ===============================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 4),
    old_interval INTEGER,
    new_interval INTEGER,
    old_ef FLOAT,
    new_ef FLOAT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 5️⃣ USAGE_LOGS
-- ===============================
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- INDEXES for better query performance
-- ===============================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Collections indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_is_deleted ON collections(is_deleted);

-- Cards indexes
CREATE INDEX idx_cards_collection_id ON cards(collection_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_cards_is_deleted ON cards(is_deleted);

-- Reviews indexes
CREATE INDEX idx_reviews_card_id ON reviews(card_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_reviewed_at ON reviews(reviewed_at);

-- Usage logs indexes
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_action ON usage_logs(action);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(timestamp);

-- ===============================
-- TRIGGER for auto-updating updated_at
-- ===============================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
