-- Add missing fields to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_types text[];

-- Create shares table for post sharing
CREATE TABLE IF NOT EXISTS public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on shares table
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for shares
CREATE POLICY "Shares are viewable by everyone" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Users can create shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shares" ON public.shares FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_shares_post ON public.shares(post_id);
CREATE INDEX IF NOT EXISTS idx_connections_follower ON public.connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_connections_following ON public.connections(following_id);

-- Function to handle share count updates
CREATE OR REPLACE FUNCTION public.handle_share_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET shares_count = shares_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET shares_count = shares_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Trigger for share count updates
DROP TRIGGER IF EXISTS share_count_trigger ON public.shares;
CREATE TRIGGER share_count_trigger
  AFTER INSERT OR DELETE ON public.shares
  FOR EACH ROW EXECUTE FUNCTION public.handle_share_count();

-- Enable realtime for tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.shares REPLICA IDENTITY FULL;
ALTER TABLE public.connections REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;  
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;