import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthOptimized } from '@/hooks/useAuthOptimized'
import { usePostsOptimized, useLikePostOptimized } from '@/hooks/usePostsOptimized'
import { PostSkeleton } from '@/components/ui/post-skeleton'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function HomeFeed() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const { user } = useAuthOptimized()
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePostsOptimized()

  const likeMutation = useLikePostOptimized()
  const posts = data?.pages.flat() || []

  const handleLike = (postId: string, isLiked: boolean) => {
    likeMutation.mutate({ postId, isLiked })
  }

  const handleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
    // TODO: Implement bookmark mutation
  }

  const formatText = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors">
            {word}{' '}
          </span>
        )
      }
      if (word.startsWith('http')) {
        return (
          <a key={index} href={word} target="_blank" rel="noopener noreferrer" 
             className="text-primary hover:text-primary/80 underline transition-colors">
            {word}{' '}
          </a>
        )
      }
      return word + ' '
    })
  }

  if (isLoading) {
    return <PostSkeleton />
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Failed to load posts</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Post Prompt */}
      <Card className="card-blue-hover">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-blue text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Link to="/create" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground hover:text-foreground h-12 border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Share your creative work...
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No posts yet!</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your creative work with the community.
            </p>
            <Link to="/create">
              <Button size="lg" className="shadow-blue hover:shadow-blue-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="feed-card">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${post.profiles?.username}`}>
                    <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all">
                      <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.display_name} />
                      <AvatarFallback className="bg-gradient-blue text-primary-foreground font-semibold">
                        {post.profiles?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/profile/${post.profiles?.username}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {post.profiles?.display_name}
                      </Link>
                      <span className="text-muted-foreground">@{post.profiles?.username}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{post.profiles?.role || 'Creator'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save Post
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Report Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Content */}
              <div className="px-6 pb-4">
                {post.title && (
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    {post.title}
                  </h2>
                )}
                <div className="text-foreground leading-relaxed">
                  {formatText(post.content)}
                </div>
              </div>

              {/* Post Media */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center border border-primary/10">
                    <span className="text-muted-foreground text-sm">Media Preview</span>
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-muted-foreground hover:text-red-500 transition-colors ${
                      post.user_liked ? 'text-red-500' : ''
                    }`}
                    onClick={() => handleLike(post.id, post.user_liked)}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${post.user_liked ? 'fill-current' : ''}`} />
                    {post.likes_count || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {post.comments_count}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    {post.shares_count}
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-muted-foreground hover:text-primary transition-colors ${
                    bookmarkedPosts.has(post.id) ? 'text-primary' : ''
                  }`}
                  onClick={() => handleBookmark(post.id)}
                >
                  <Bookmark className={`h-5 w-5 ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div 
          ref={(el) => {
            if (el && hasNextPage && !isFetchingNextPage) {
              const observer = new IntersectionObserver(
                (entries) => {
                  if (entries[0].isIntersecting) {
                    fetchNextPage();
                  }
                },
                { threshold: 0.1 }
              );
              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
          className="h-20 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          )}
        </div>
      )}
      
      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          🎉 You're all caught up!
        </div>
      )}
    </div>
  )
}