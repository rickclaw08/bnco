-- 005_social_features.sql
-- Adds: moods, mood_likes, posts, post_likes, comments, friends, notifications

-- User moods (emoji status with timestamp)
CREATE TABLE IF NOT EXISTS user_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  studio_id UUID REFERENCES studios(id) ON DELETE SET NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_moods_user ON user_moods(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_moods_studio ON user_moods(studio_id, created_at DESC);

-- Mood likes (hearts on someone's mood)
CREATE TABLE IF NOT EXISTS mood_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_id UUID NOT NULL REFERENCES user_moods(id) ON DELETE CASCADE,
  liker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mood_id, liker_id)
);

-- Posts (Instagram-style photo posts)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  studio_id UUID REFERENCES studios(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_studio ON posts(studio_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_geo ON posts(lat, lng) WHERE lat IS NOT NULL;

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  liker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, liker_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at);

-- Friends (bidirectional: status pending/accepted/blocked)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK(requester_id <> addressee_id)
);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('mood_like', 'post_like', 'post_comment', 'friend_request', 'friend_accepted')),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID,
  target_type VARCHAR(20),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- User privacy setting
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE;

-- User bio for profile
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
