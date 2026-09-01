-- Cinemate Database Schema (PostgreSQL with pgvector)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Note: vector extension enabled when available
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Movies Table (Normalized storage for metadata & vector embeddings)
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    overview TEXT,
    tagline TEXT,
    release_date VARCHAR(50),
    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),
    genres JSONB DEFAULT '[]'::jsonb,
    cast_members JSONB DEFAULT '[]'::jsonb,
    director VARCHAR(255),
    runtime INTEGER DEFAULT 0,
    budget BIGINT DEFAULT 0,
    revenue BIGINT DEFAULT 0,
    vote_average NUMERIC(4, 2) DEFAULT 0.0,
    vote_count INTEGER DEFAULT 0,
    popularity NUMERIC(10, 3) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- pgvector embedding columns if vector extension enabled
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        ALTER TABLE movies ADD COLUMN IF NOT EXISTS embedding vector(1536);
        ALTER TABLE movies ADD COLUMN IF NOT EXISTS embedding_status VARCHAR(50) DEFAULT 'PENDING';
    END IF;
END $$;

-- 3. Favorites Table (User-Movie relational join)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    movie_id INTEGER NOT NULL,
    movie_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- 4. Watch History Table
CREATE TABLE IF NOT EXISTS watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    movie_id INTEGER NOT NULL,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    movie_id INTEGER NOT NULL,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_vote_average ON movies(vote_average DESC);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
