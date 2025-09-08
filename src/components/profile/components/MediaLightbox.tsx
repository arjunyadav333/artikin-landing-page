import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Trash2, Download, ExternalLink } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  caption?: string;
  externalLink?: string;
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDelete?: (id: string) => void;
  isOwner?: boolean;
}

export function MediaLightbox({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate,
  onDelete,
  isOwner = false
}: MediaLightboxProps) {
  const currentItem = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNavigate, onClose]);

  if (!isOpen || !currentItem) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-4xl w-full mx-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-white text-2xl hover:bg-white/20 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Media Content */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <img 
              src={currentItem.url} 
              alt={currentItem.caption || 'Media item'}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Caption and Controls */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {currentItem.caption && (
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {currentItem.caption}
                  </h3>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{currentIndex + 1} of {items.length}</span>
                  {currentItem.externalLink && (
                    <a
                      href={currentItem.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View Details <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Owner Controls */}
              {isOwner && onDelete && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(currentItem.id)}
                    className="rounded-md"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}