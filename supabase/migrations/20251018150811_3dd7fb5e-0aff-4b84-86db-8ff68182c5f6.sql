-- Step 3: Create optimized view with user interactions
-- This combines posts, profiles, and user interactions in a single query
CREATE OR REPLACE VIEW posts_feed_optimized_secure AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.content,
  p.media_urls,
  p.media_types,
  p.tags,
  p.visibility,
  p.likes_count,
  p.comments_count,
  p.shares_count,
  p.created_at,
  p.updated_at,
  -- Profile data
  pr.role as profile_role,
  pr.artform as profile_artform,
  pr.organization_type as profile_organization_type,
  pr.location as profile_location,
  pr.bio as profile_bio,
  pr.display_name as profile_display_name,
  pr.username as profile_username,
  pr.avatar_url as profile_avatar_url,
  -- User interactions (for current user)
  EXISTS(
    SELECT 1 FROM likes l 
    WHERE l.post_id = p.id AND l.user_id = auth.uid()
  ) as user_liked,
  EXISTS(
    SELECT 1 FROM connections c 
    WHERE c.following_id = p.user_id AND c.follower_id = auth.uid()
  ) as is_following
FROM posts p
INNER JOIN profiles pr ON pr.user_id = p.user_id
WHERE p.visibility = 'public'
  OR p.user_id = auth.uid()
  OR (
    p.visibility = 'followers' 
    AND EXISTS(
      SELECT 1 FROM connections 
      WHERE following_id = p.user_id AND follower_id = auth.uid()
    )
  );

-- Enable RLS on the view
ALTER VIEW posts_feed_optimized_secure SET (security_invoker = true);