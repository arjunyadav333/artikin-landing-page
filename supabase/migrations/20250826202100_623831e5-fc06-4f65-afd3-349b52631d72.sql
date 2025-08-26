-- Add performance indexes only (foreign key already exists)
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Create composite index for better pagination performance  
CREATE INDEX IF NOT EXISTS idx_posts_created_user ON public.posts(created_at DESC, user_id);

-- Add index for opportunities performance
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);