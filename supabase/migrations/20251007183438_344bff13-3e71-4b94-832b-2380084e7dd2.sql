-- Phase 6: Add critical database indexes for performance

-- Index for posts ordered by creation date (used in home feed)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Index for posts by user (used in profile views)
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id, created_at DESC);

-- GIN index for opportunities art_forms array (used in personalized opportunities)
CREATE INDEX IF NOT EXISTS idx_opportunities_art_forms ON public.opportunities USING GIN(art_forms);

-- Index for opportunities by status and created_at
CREATE INDEX IF NOT EXISTS idx_opportunities_status_created ON public.opportunities(status, created_at DESC) WHERE status = 'active';

-- Index for opportunities by views (used in featured opportunities)
CREATE INDEX IF NOT EXISTS idx_opportunities_views ON public.opportunities(views_count DESC) WHERE status = 'active';

-- Index for connections follower lookups
CREATE INDEX IF NOT EXISTS idx_connections_follower ON public.connections(follower_id, following_id);

-- Index for connections following lookups
CREATE INDEX IF NOT EXISTS idx_connections_following ON public.connections(following_id, follower_id);

-- Index for likes by user and post (used in feed user_liked checks)
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes(user_id, post_id);

-- Index for likes by post (used in counting likes)
CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);

-- Composite index for text search on opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_text_search ON public.opportunities USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));