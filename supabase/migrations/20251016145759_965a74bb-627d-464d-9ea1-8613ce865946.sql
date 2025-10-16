-- Step 1: Update posts_with_profiles_secure view to include media_types
DROP VIEW IF EXISTS posts_with_profiles_secure;

CREATE OR REPLACE VIEW posts_with_profiles_secure AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.content,
  p.media_urls,
  p.media_types,
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
  pr.artform as profile_artform,
  pr.organization_type as profile_organization_type,
  pr.location as profile_location,
  pr.bio as profile_bio
FROM posts p
JOIN profiles pr ON pr.user_id = p.user_id
WHERE p.visibility = 'public';