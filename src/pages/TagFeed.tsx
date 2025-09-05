import { useParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FullWidthPost } from "@/components/feed/full-width-post";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hash } from "lucide-react";
import { PostListSkeleton } from "@/components/ui/post-skeleton";

const TagFeed = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();

  const { 
    data: postsData, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage 
  } = useInfiniteQuery({
    queryKey: ['tagPosts', tag],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const limit = 10;
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id, user_id, username, display_name, avatar_url, role, artform, location
          )
        `)
        .contains('tags', [tag])
        .order('created_at', { ascending: false })
        .range(pageParam * limit, (pageParam + 1) * limit - 1);

      if (error) throw error;
      if (!posts?.length) return [];

      // Get user interactions for these posts
      const postIds = posts.map(p => p.id);
      
      let likedPostIds = new Set();
      if (user) {
        // Get likes
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      }

      return posts.map(post => ({
        ...post,
        user_liked: likedPostIds.has(post.id),
        user_saved: false, // Saves functionality removed
        is_following: false // TODO: Implement following check
      })) as any; // Type assertion to bypass strict typing
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!tag,
  });

  const posts = postsData?.pages.flat() || [];

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{tag}</h1>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        {isLoading ? (
          <PostListSkeleton count={3} />
        ) : isError ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">Failed to load posts</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center p-8">
            <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground text-sm">
              No posts have been tagged with #{tag} yet
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <FullWidthPost key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasNextPage && (
          <div className="p-6 text-center">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => fetchNextPage()}
              disabled={isLoading}
            >
              {isLoading ? 'Loading more posts...' : 'Load more'}
            </Button>
          </div>
        )}

        {/* End of Feed */}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagFeed;