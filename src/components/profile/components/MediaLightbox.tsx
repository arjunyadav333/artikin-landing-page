import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  caption?: string;
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex: number;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export function MediaLightbox({ 
  isOpen, 
  onClose, 
  media, 
  initialIndex, 
  canDelete = false,
  onDelete 
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleDelete = () => {
    if (onDelete && media[currentIndex]) {
      onDelete(media[currentIndex].id);
      
      // If this was the last image, close the lightbox
      if (media.length === 1) {
        onClose();
      } else {
        // Adjust currentIndex if needed
        if (currentIndex >= media.length - 1) {
          setCurrentIndex(0);
        }
      }
    }
  };

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white text-2xl hover:text-gray-300 transition-colors z-10"
        aria-label="Close"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Navigation Buttons */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-16 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-12 w-12" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="relative max-w-4xl max-h-[90vh] mx-4">
        <img
          src={currentMedia.url}
          alt={currentMedia.caption || `Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex justify-between items-center">
          <div className="text-white">
            {media.length > 1 && (
              <span className="text-sm">
                {currentIndex + 1} of {media.length}
              </span>
            )}
          </div>
          
          {canDelete && onDelete && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}