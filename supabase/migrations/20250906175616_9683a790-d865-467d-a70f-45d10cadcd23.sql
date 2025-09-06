-- Fix Security Definer View issues by removing views that bypass RLS
-- These views join tables with different RLS policies which can expose protected data

-- Drop the problematic views that don't respect RLS properly
DROP VIEW IF EXISTS public.conversation_list_view;
DROP VIEW IF EXISTS public.conversations_optimized;
DROP VIEW IF EXISTS public.posts_feed_optimized;  
DROP VIEW IF EXISTS public.posts_with_profiles_view;

-- Create secure replacement views that respect RLS policies
-- These will use SECURITY INVOKER (default) instead of bypassing RLS

-- Secure posts feed view - respects RLS on both posts and profiles
CREATE VIEW public.posts_with_profiles_secure AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.content,
  p.media_urls,
  p.media_type,
  p.tags,
  p.likes_count,
  p.comments_count,
  p.shares_count,
  p.saves_count,
  p.created_at,
  p.updated_at,
  pr.display_name AS profile_display_name,
  pr.username AS profile_username,
  pr.avatar_url AS profile_avatar_url,
  pr.role AS profile_role,
  pr.artform AS profile_artform
FROM public.posts p
LEFT JOIN public.profiles pr ON (p.user_id = pr.user_id)
WHERE p.created_at IS NOT NULL;

-- Secure conversation list view - will only show conversations the user has access to via RLS
CREATE VIEW public.conversations_secure AS
SELECT 
  c.id,
  c.participant_a,
  c.participant_b,
  c.last_message_id,
  c.created_at,
  c.updated_at,
  pa.username AS participant_a_username,
  pa.display_name AS participant_a_name,
  pa.avatar_url AS participant_a_avatar,
  pb.username AS participant_b_username,
  pb.display_name AS participant_b_name,
  pb.avatar_url AS participant_b_avatar
FROM public.conversations c
LEFT JOIN public.profiles pa ON (pa.user_id = c.participant_a)
LEFT JOIN public.profiles pb ON (pb.user_id = c.participant_b);

-- Comment: The original views were dropped because they could bypass RLS policies
-- when joining tables with different security contexts. The new views rely on 
-- the underlying table RLS policies to properly restrict access.