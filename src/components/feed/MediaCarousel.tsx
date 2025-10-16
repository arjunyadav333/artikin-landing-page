import { useState, memo } from 'react';
import { ChevronLeft, ChevronRight, Play, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface MediaCarouselProps {
  mediaUrls: string[];
  mediaTypes?: string[];
  postId: string;
}

export const MediaCarousel = memo(({ mediaUrls, mediaTypes, postId }: MediaCarouselProps) => {
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

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `media-${postId}-${index + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const renderMedia = (url: string, index: number, isActive: boolean, isViewer: boolean = false) => {
    const mediaType = getMediaType(index);
    
    if (mediaType.startsWith('video/')) {
      return (
        <figure className="media media--video w-full">
          <video
            src={url}
            className={`media__video w-full ${isViewer ? 'max-h-[90vh] object-contain' : 'max-h-[500px] md:max-h-[600px] object-cover'}`}
            controls={isActive}
            preload="metadata"
            muted
            loop
            data-media-index={index}
            style={{ background: '#000' }}
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
        </figure>
      );
    }

    return (
      <figure className="media media--image w-full">
        <OptimizedImage
          src={url}
          alt={`Media ${index + 1}`}
          className={`media__img w-full ${isViewer ? 'max-h-[90vh] object-contain' : 'max-h-[500px] md:max-h-[600px] object-cover aspect-auto'} ${!isViewer ? 'cursor-pointer' : ''}`}
          onClick={!isViewer ? openFullscreen : undefined}
          data-media-index={index}
          style={{ background: 'var(--media-bg, #f8f9fa)' }}
        />
      </figure>
    );
  };

  if (mediaUrls.length === 0) return null;

  return (
    <div className="post__media w-full" role="region" aria-label="Post media">
      <div key={currentIndex} className="relative rounded-lg overflow-hidden bg-muted">
        {renderMedia(mediaUrls[currentIndex], currentIndex, true)}

        {mediaUrls.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 !transition-none !duration-0"
              onClick={prevImage}
              aria-label="Previous media"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 !transition-none !duration-0"
              onClick={nextImage}
              aria-label="Next media"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {mediaUrls.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
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

      {/* Fullscreen Viewer */}
      {isFullscreen && (
        <div 
          className="viewer fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div className="relative max-w-[96vw] max-h-[96vh] flex items-center justify-center">
            {renderMedia(mediaUrls[currentIndex], currentIndex, true, true)}
            
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-0 !transition-none !duration-0"
                onClick={() => handleDownload(mediaUrls[currentIndex], currentIndex)}
                aria-label="Download media"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-0 !transition-none !duration-0"
                onClick={() => setIsFullscreen(false)}
                aria-label="Close viewer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation in fullscreen */}
            {mediaUrls.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 !transition-none !duration-0"
                  onClick={prevImage}
                  aria-label="Previous media"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 !transition-none !duration-0"
                  onClick={nextImage}
                  aria-label="Next media"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

MediaCarousel.displayName = 'MediaCarousel';