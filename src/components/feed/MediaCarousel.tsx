import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaCarouselProps {
  mediaUrls: string[];
  mediaTypes?: string[];
  postId: string;
}

export const MediaCarousel = ({ mediaUrls, mediaTypes, postId }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const getMediaType = (index: number) => {
    return mediaTypes?.[index] || 'image';
  };

  const renderMedia = (url: string, index: number, isActive: boolean) => {
    const mediaType = getMediaType(index);
    
    if (mediaType.startsWith('video/')) {
      return (
        <div className="relative">
          <video
            src={url}
            className="w-full h-full object-cover"
            controls={isActive}
            muted
            loop
            data-media-index={index}
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
      );
    }

    return (
      <img
        src={url}
        alt={`Media ${index + 1}`}
        className="w-full h-full object-cover cursor-pointer"
        onClick={openFullscreen}
        loading="lazy"
        data-media-index={index}
      />
    );
  };

  if (mediaUrls.length === 0) return null;

  return (
    <div className="post_media w-full">
      <div className="relative rounded-lg overflow-hidden bg-muted">
        <div className="aspect-video w-full">
          {renderMedia(mediaUrls[currentIndex], currentIndex, true)}
        </div>

        {mediaUrls.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={prevImage}
              aria-label="Previous media"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={nextImage}
              aria-label="Next media"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {mediaUrls.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {mediaUrls.length > 1 && (
        <div className="flex justify-center mt-2 text-xs text-muted-foreground" style={{ fontSize: 'var(--fs-meta)' }}>
          {currentIndex + 1} / {mediaUrls.length}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={mediaUrls[currentIndex]}
              alt={`Media ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsFullscreen(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};