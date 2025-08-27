import { useState } from "react";
import { Heart, MessageCircle, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostDetailModal } from "@/components/post/post-detail-modal";
import { Post } from "@/hooks/usePosts";

interface PostsGridProps {
  posts: Post[];
  isLoading: boolean;
}

export function PostsGrid({ posts, isLoading }: PostsGridProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No posts yet</p>
        <p className="text-muted-foreground text-sm mt-2">
          Posts will appear here when this user shares something
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="aspect-square bg-muted cursor-pointer group relative overflow-hidden rounded-sm"
            onClick={() => setSelectedPost(post)}
          >
            {/* Media Preview */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              {post.media_urls && post.media_urls.length > 0 ? (
                <>
                  <img 
                    src={post.media_urls[0]} 
                    alt="Post media"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {post.media_type === "video" && (
                    <Play className="h-6 w-6 text-white absolute z-10" />
                  )}
                </>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted-foreground text-xs line-clamp-3">
                    {post.content}
                  </p>
                </div>
              )}
            </div>
            
            {/* Hover overlay with stats */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 fill-current" />
                  {post.likes_count || 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 fill-current" />
                  {post.comments_count || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0">
          {selectedPost && (
            <PostDetailModal 
              post={selectedPost} 
              onClose={() => setSelectedPost(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}