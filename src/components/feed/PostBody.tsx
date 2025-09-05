import { useState } from 'react';
import { HomeFeedPost } from '@/hooks/useHomeFeed';
import { MediaCarousel } from './MediaCarousel';

interface PostBodyProps {
  post: HomeFeedPost;
}

export const PostBody = ({ post }: PostBodyProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatText = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      if (word.startsWith('@')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      if (word.startsWith('http')) {
        return (
          <a 
            key={index} 
            href={word} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {word}{' '}
          </a>
        );
      }
      return word + ' ';
    });
  };

  const shouldTruncate = post.content.length > 200;
  const displayText = shouldTruncate && !isExpanded 
    ? post.content.slice(0, 200) + '...' 
    : post.content;

  return (
    <div className="space-y-[var(--sp-sm)]">
      {post.title && (
        <h3 className="font-semibold" style={{ fontSize: 'var(--fs-name)' }}>
          {post.title}
        </h3>
      )}
      
      <div className="post_text" style={{ fontSize: 'var(--fs-body)', lineHeight: '1.4' }}>
        <div className={!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}>
          {formatText(displayText)}
        </div>
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground text-sm mt-1"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="text-primary hover:underline cursor-pointer text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {post.media_urls && post.media_urls.length > 0 && (
        <MediaCarousel 
          mediaUrls={post.media_urls} 
          mediaTypes={post.media_types}
          postId={post.id}
        />
      )}
    </div>
  );
};