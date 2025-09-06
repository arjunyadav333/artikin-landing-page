-- Fix Security Definer Views and remaining security issues
-- These views were flagged by the linter as having SECURITY DEFINER properties

-- 1. Recreate posts_with_profiles_secure view without SECURITY DEFINER
DROP VIEW IF EXISTS public.posts_with_profiles_secure;

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
  pr.artform AS profile_artform,
  pr.organization_type AS profile_organization_type,
  pr.location AS profile_location,
  pr.bio AS profile_bio
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.user_id
WHERE p.created_at IS NOT NULL
ORDER BY p.created_at DESC;

-- 2. Recreate conversations_secure view without SECURITY DEFINER
DROP VIEW IF EXISTS public.conversations_secure;

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
  pb.avatar_url AS participant_b_avatar,
  lm.body AS last_message_body,
  lm.kind AS last_message_kind,
  lm.sender_id AS last_message_sender_id,
  lm.created_at AS last_message_created_at,
  lm.deleted_for_everyone AS last_message_deleted
FROM public.conversations c
LEFT JOIN public.profiles pa ON pa.user_id = c.participant_a
LEFT JOIN public.profiles pb ON pb.user_id = c.participant_b
LEFT JOIN public.messages lm ON lm.id = c.last_message_id;

-- 3. Enable RLS on the views for proper security
ALTER VIEW public.posts_with_profiles_secure SET (security_invoker = true);
ALTER VIEW public.conversations_secure SET (security_invoker = true);

-- Note: The OTP expiry and leaked password protection warnings need to be 
-- fixed in the Supabase dashboard Authentication settings by the user.