import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MediaCarouselProps {
  mediaUrls: string[];
  mediaTypes?: string[];
  postId: string;
}

export const MediaCarousel = ({ mediaUrls, mediaTypes, postId }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set([0]));
  
  // Instagram-style swipe states
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [swipeVelocity, setSwipeVelocity] = useState(0);
  
  const { toast } = useToast();

  // Memoized helper to get media type
  const getMediaType = useCallback((index: number) => {
    return mediaTypes?.[index] || 'image';
  }, [mediaTypes]);

  // Preload adjacent images for smooth transitions
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (index >= 0 && index < mediaUrls.length) {
        const mediaType = getMediaType(index);
        if (!mediaType.startsWith('video/')) {
          const img = new Image();
          img.src = mediaUrls[index];
        }
      }
    };
    
    // Preload next and previous images
    preloadImage(currentIndex + 1);
    preloadImage(currentIndex - 1);
  }, [currentIndex, mediaUrls, getMediaType]);

  // Navigation with transition lock
  const nextImage = useCallback(() => {
    if (isTransitioning || mediaUrls.length <= 1) return;
    if (!hasInteracted) setHasInteracted(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, mediaUrls.length, hasInteracted]);

  const prevImage = useCallback(() => {
    if (isTransitioning || mediaUrls.length <= 1) return;
    if (!hasInteracted) setHasInteracted(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, mediaUrls.length, hasInteracted]);

  // Handle touch gestures for mobile swipe - Instagram style
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0].clientX;
    setTouchStart(touch);
    setTouchEnd(touch);
    setTouchStartTime(Date.now());
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentTouch = e.touches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate real-time drag offset as percentage
    const diff = currentTouch - touchStart;
    const containerWidth = e.currentTarget.getBoundingClientRect().width;
    const percentOffset = (diff / containerWidth) * 100;
    
    // Apply rubber-banding at boundaries
    const isAtStart = currentIndex === 0 && diff > 0;
    const isAtEnd = currentIndex === mediaUrls.length - 1 && diff < 0;
    
    if (isAtStart || isAtEnd) {
      // 30% resistance at boundaries
      setDragOffset(percentOffset * 0.3);
    } else {
      setDragOffset(percentOffset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const swipeDistance = touchStart - touchEnd;
    const swipeTime = Date.now() - touchStartTime;
    const velocity = Math.abs(swipeDistance / swipeTime);
    setSwipeVelocity(velocity);
    
    // Dynamic threshold based on velocity (fast swipe = lower threshold)
    const threshold = velocity > 0.5 ? 30 : 50;
    
    if (swipeDistance > threshold && currentIndex < mediaUrls.length - 1) {
      nextImage();
    } else if (swipeDistance < -threshold && currentIndex > 0) {
      prevImage();
    }
    
    // Reset drag offset with animation
    setDragOffset(0);
  };

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

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
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    // Remove from loading set
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    
    // Set container height from current visible image
    if (index === currentIndex && !containerHeight) {
      setContainerHeight(e.currentTarget.height);
    }
  }, [currentIndex, containerHeight]);

  const handleImageError = useCallback((index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const renderMedia = useCallback((url: string, index: number, isActive: boolean, isViewer: boolean = false) => {
    if (index < 0 || index >= mediaUrls.length) return null;
    
    const mediaType = getMediaType(index);
    const hasFailed = failedImages.has(index);
    const isLoading = loadingImages.has(index) && index === currentIndex;
    
    if (mediaType.startsWith('video/')) {
      return (
        <figure className="media media--video w-full h-full flex items-center justify-center">
          <video
            src={url}
            className={`media__video w-full ${isViewer ? 'max-h-[96vh]' : 'max-h-[70vh]'} object-contain`}
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

    if (hasFailed) {
      return (
        <div className="w-full h-64 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Failed to load image</p>
        </div>
      );
    }

    return (
      <figure className="media media--image w-full h-full flex items-center justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={url}
          alt={`Media ${index + 1}`}
          className={`media__img w-full ${isViewer ? 'max-h-[96vh]' : 'max-h-[70vh]'} object-contain ${!isViewer ? 'cursor-pointer' : ''}`}
          onClick={!isViewer ? openFullscreen : undefined}
          loading="eager"
          onLoad={(e) => handleImageLoad(e, index)}
          onError={() => handleImageError(index)}
          data-media-index={index}
          style={{ 
            background: 'var(--media-bg, #f8f9fa)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      </figure>
    );
  }, [containerHeight, getMediaType, openFullscreen, mediaUrls.length, failedImages, loadingImages, currentIndex, handleImageLoad, handleImageError]);

  if (mediaUrls.length === 0) return null;

  return (
    <div className="post__media w-full" role="region" aria-label="Post media">
      <div 
        className="relative rounded-lg overflow-hidden bg-muted"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          minHeight: containerHeight ? `${containerHeight}px` : '300px',
          touchAction: 'pan-y pinch-zoom',
          userSelect: 'none'
        }}
      >
        {/* Sliding container with transform-based animation */}
        <div className="relative overflow-hidden w-full">
          <div 
            className={`flex ${!isDragging && hasInteracted ? 'transition-transform duration-300 ease-out' : ''}`}
            style={{ 
              transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}%))`,
              transition: isDragging ? 'none' : undefined
            }}
          >
            {mediaUrls.map((url, index) => (
              <div 
                key={`${postId}-${index}`}
                className="flex-shrink-0 w-full flex items-center justify-center"
              >
                {renderMedia(url, index, index === currentIndex)}
              </div>
            ))}
          </div>
        </div>

        {mediaUrls.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 transition-opacity z-10"
              onClick={prevImage}
              disabled={isTransitioning}
              aria-label="Previous media"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 transition-opacity z-10"
              onClick={nextImage}
              disabled={isTransitioning}
              aria-label="Next media"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
              {mediaUrls.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                  onClick={() => {
                    if (!isTransitioning && index !== currentIndex) {
                      setHasInteracted(true);
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }
                  }}
                  disabled={isTransitioning}
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
          className="viewer fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative max-w-[96vw] max-h-[96vh] w-full flex items-center justify-center">
            {/* Sliding container for fullscreen */}
            <div className="relative overflow-hidden w-full">
              <div 
                className={`flex ${!isDragging && hasInteracted ? 'transition-transform duration-300 ease-out' : ''}`}
                style={{ 
                  transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}%))`,
                  transition: isDragging ? 'none' : undefined
                }}
              >
                {mediaUrls.map((url, index) => (
                  <div 
                    key={`fullscreen-${postId}-${index}`}
                    className="flex-shrink-0 w-full flex items-center justify-center"
                  >
                    {renderMedia(url, index, index === currentIndex, true)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={() => handleDownload(mediaUrls[currentIndex], currentIndex)}
                aria-label="Download media"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-0"
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
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 transition-opacity z-20"
                  onClick={prevImage}
                  disabled={isTransitioning}
                  aria-label="Previous media"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 transition-opacity z-20"
                  onClick={nextImage}
                  disabled={isTransitioning}
                  aria-label="Next media"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
                  {mediaUrls.map((_, index) => (
                    <button
                      key={`fullscreen-dot-${index}`}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                      onClick={() => {
                        if (!isTransitioning && index !== currentIndex) {
                          setHasInteracted(true);
                          setIsTransitioning(true);
                          setCurrentIndex(index);
                          setTimeout(() => setIsTransitioning(false), 300);
                        }
                      }}
                      disabled={isTransitioning}
                      aria-label={`Go to media ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
