import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileUp, Image, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

interface MediaGalleryProps {
  profile: Profile;
  isOwnProfile: boolean;
  portfolios?: any[];
  portfoliosLoading?: boolean;
}

interface MediaItem {
  id: string;
  url: string;
}

export function MediaGallery({ 
  profile, 
  isOwnProfile, 
  portfolios = [],
  portfoliosLoading = false 
}: MediaGalleryProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newMedia, setNewMedia] = useState({
    file: null as File | null
  });

  // Empty media items - users need to add their own
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size is 10MB');
        return;
      }
      setNewMedia(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!newMedia.file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      setTimeout(() => {
        const newItem: MediaItem = {
          id: Date.now().toString(),
          url: URL.createObjectURL(newMedia.file!)
        };

        setMediaItems(prev => [newItem, ...prev]);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setIsUploading(false);
          setUploadProgress(0);
          setNewMedia({ file: null });
        }, 500);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(interval);
    }
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const openCarousel = (index: number) => {
    setCurrentIndex(index);
    setIsCarouselOpen(true);
  };

  const navigateCarousel = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
    } else {
      setCurrentIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isCarouselOpen) return;
    
    if (e.key === 'Escape') {
      setIsCarouselOpen(false);
    } else if (e.key === 'ArrowLeft') {
      navigateCarousel('prev');
    } else if (e.key === 'ArrowRight') {
      navigateCarousel('next');
    }
  };

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCarouselOpen]);

  const renderThumbnail = (item: MediaItem, index: number) => (
    <div key={item.id} className="group relative aspect-square">
      <img 
        src={item.url} 
        alt={`Portfolio image ${index + 1}`}
        className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
        loading="lazy"
        onClick={() => openCarousel(index)}
      />
    </div>
  );

  const currentItem = mediaItems[currentIndex];

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold">Media</CardTitle>
          {isOwnProfile && (
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-2xl px-4 py-2 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0 pb-4">
                  <DialogTitle>Upload Media</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto flex-1 px-1">
                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {newMedia.file ? newMedia.file.name : "Click to upload image"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Images only (JPG, PNG, WebP) up to 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>
                <div className="flex gap-2 pt-4 border-t bg-white flex-shrink-0 mt-4">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!newMedia.file || isUploading}
                    className="rounded-2xl"
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadModalOpen(false)}
                    className="rounded-2xl"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        
        <CardContent className="p-4 md:p-6 pt-0">
          {mediaItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {mediaItems.map((item, index) => renderThumbnail(item, index))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Image className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <p className="text-base">No portfolio items yet</p>
              {isOwnProfile && (
                <p className="text-sm mt-1">Upload your first project to get started</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {isCarouselOpen && currentItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative max-w-5xl max-h-[90vh] mx-4">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCarouselOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation Arrows */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigateCarousel('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigateCarousel('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            <img 
              src={currentItem.url} 
              alt={`Portfolio image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded"
            />
            
            {/* Bottom Controls */}
            {isOwnProfile && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-4 py-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDelete(currentItem.id);
                    setIsCarouselOpen(false);
                  }}
                  className="rounded-full"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}