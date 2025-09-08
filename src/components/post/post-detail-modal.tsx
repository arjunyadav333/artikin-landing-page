import { useState } from "react";
import { X, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, UserPlus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "@/hooks/usePosts";
import { useLikePost } from "@/hooks/usePosts";
// import { CommentDrawer } from "@/components/post/comment-drawer";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const likeMutation = useLikePost();

  const handleLike = () => {
    likeMutation.mutate({
      postId: post.id,
      isLiked: isLiked
    });
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.profiles?.display_name}`,
          text: post.content,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
        {/* Media Section */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {post.media_urls && post.media_urls.length > 0 ? (
            <img 
              src={post.media_urls[0]} 
              alt="Post media"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="p-12 text-center">
              <p className="text-white text-lg">{post.content}</p>
            </div>
          )}
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="md:w-96 bg-background flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.profiles?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {post.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground hover:text-primary cursor-pointer">
                    {post.profiles?.display_name || 'User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {post.profiles?.role === 'artist' ? 'Artist' : 'Organization'} • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg rounded-lg z-50">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {post.content && (
                <div>
                  <p className="text-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              )}
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-primary hover:underline cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2 hover:text-red-500 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {post.likes_count || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(true)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  {post.comments_count || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
                className="hover:text-primary transition-colors"
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current text-primary' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Drawer - TODO: Implement */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowComments(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-lg p-4">
            <p className="text-center text-muted-foreground">Comments coming soon</p>
          </div>
        </div>
      )}
    </>
  );
}