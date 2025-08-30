-- Fix security issues with views by recreating them without SECURITY DEFINER
-- and ensuring they work with RLS policies

-- Drop the views and recreate them properly
DROP VIEW IF EXISTS public.conversation_list_view;
DROP VIEW IF EXISTS public.posts_with_profiles_view;

-- Create RLS-compliant views without SECURITY DEFINER
CREATE VIEW public.conversation_list_view AS
SELECT 
  c.id,
  c.participant_a,
  c.participant_b,
  c.last_message_id,
  c.created_at,
  c.updated_at,
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
LEFT JOIN public.messages m ON c.last_message_id = m.id;

-- Create RLS-compliant posts view
CREATE VIEW public.posts_with_profiles_view AS
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
  pr.display_name as profile_display_name,
  pr.username as profile_username,
  pr.avatar_url as profile_avatar_url,
  pr.role as profile_role,
  pr.artform as profile_artform
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.user_id;

-- Enable RLS on views if they support it
ALTER VIEW public.conversation_list_view OWNER TO postgres;
ALTER VIEW public.posts_with_profiles_view OWNER TO postgres;