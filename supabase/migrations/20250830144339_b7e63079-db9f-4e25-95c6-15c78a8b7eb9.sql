-- Performance optimization: Add indexes for frequently queried columns

-- Conversations performance indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_a, participant_b);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Messages performance indexes  
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- Message receipts performance indexes
CREATE INDEX IF NOT EXISTS idx_message_receipts_message_user ON public.message_receipts(message_id, user_id);

-- Posts performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Profiles performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Likes performance indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON public.likes(post_id, user_id);

-- Saves performance indexes  
CREATE INDEX IF NOT EXISTS idx_saves_post_user ON public.saves(post_id, user_id);

-- Comments performance indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON public.comments(post_id, created_at DESC);

-- Connections performance indexes
CREATE INDEX IF NOT EXISTS idx_connections_follower ON public.connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_connections_following ON public.connections(following_id);

-- Create optimized views for complex queries
CREATE OR REPLACE VIEW public.conversation_list_view AS
SELECT 
  c.*, 
  profiles_a.display_name as participant_a_name,
  profiles_a.username as participant_a_username,
  profiles_a.avatar_url as participant_a_avatar,
  profiles_b.display_name as participant_b_name,
  profiles_b.username as participant_b_username,
  profiles_b.avatar_url as participant_b_avatar,
  m.body as last_message_body,
  m.created_at as last_message_created_at,
  m.sender_id as last_message_sender_id
FROM public.conversations c
LEFT JOIN public.profiles profiles_a ON c.participant_a = profiles_a.user_id
LEFT JOIN public.profiles profiles_b ON c.participant_b = profiles_b.user_id  
LEFT JOIN public.messages m ON c.last_message_id = m.id
ORDER BY c.updated_at DESC;

-- Create posts with profile view for efficient loading
CREATE OR REPLACE VIEW public.posts_with_profiles_view AS
SELECT 
  p.*,
  pr.display_name as profile_display_name,
  pr.username as profile_username,
  pr.avatar_url as profile_avatar_url,
  pr.role as profile_role,
  pr.artform as profile_artform
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.user_id
ORDER BY p.created_at DESC;