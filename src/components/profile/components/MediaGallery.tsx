import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, FileUp, Image, Video, FileText, Trash2, Eye, EyeOff, 
  ExternalLink, ChevronLeft, ChevronRight, X, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile } from '@/hooks/useProfiles';

interface MediaGalleryProps {
  profile: Profile;
  isOwnProfile: boolean;
  portfolios?: any[];
  portfoliosLoading?: boolean;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  caption: string;
  externalLink?: string;
  visibility: 'public' | 'private';
  uploadedAt: Date;
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
    file: null as File | null,
    caption: '',
    externalLink: '',
    visibility: 'public' as 'public' | 'private'
  });

  // Mock portfolio items
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'image',
      url: '/placeholder.svg',
      caption: 'Portrait Photography Session',
      visibility: 'public',
      uploadedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      type: 'video',
      url: '/placeholder.svg',
      thumbnail: '/placeholder.svg',
      caption: 'Acting Reel 2024',
      externalLink: 'https://youtube.com/watch?v=example',
      visibility: 'public',
      uploadedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      type: 'image',
      url: '/placeholder.svg',
      caption: 'Fashion Shoot',
      visibility: 'public',
      uploadedAt: new Date('2024-01-08')
    },
    {
      id: '4',
      type: 'document',
      url: '/placeholder.svg',
      caption: 'Professional Resume',
      visibility: 'private',
      uploadedAt: new Date('2024-01-05')
    },
    {
      id: '5',
      type: 'image',
      url: '/placeholder.svg',
      caption: 'Theatre Performance',
      visibility: 'public',
      uploadedAt: new Date('2024-01-01')
    },
    {
      id: '6',
      type: 'image',
      url: '/placeholder.svg',
      caption: 'Commercial Shoot',
      visibility: 'public',
      uploadedAt: new Date('2023-12-20')
    }
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = file.type.startsWith('video/') ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        alert(`File too large. Maximum size is ${file.type.startsWith('video/') ? '200MB' : '10MB'}`);
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
        const mediaType = newMedia.file!.type.startsWith('image/') ? 'image' 
                        : newMedia.file!.type.startsWith('video/') ? 'video' 
                        : 'document';

        const newItem: MediaItem = {
          id: Date.now().toString(),
          type: mediaType,
          url: URL.createObjectURL(newMedia.file!),
          caption: newMedia.caption,
          externalLink: newMedia.externalLink,
          visibility: newMedia.visibility,
          uploadedAt: new Date()
        };

        setMediaItems(prev => [newItem, ...prev]);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setIsUploading(false);
          setUploadProgress(0);
          setNewMedia({ file: null, caption: '', externalLink: '', visibility: 'public' });
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

  const toggleVisibility = (id: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, visibility: item.visibility === 'public' ? 'private' : 'public' }
        : item
    ));
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-3 w-3" />;
      case 'video': return <Video className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const renderThumbnail = (item: MediaItem, index: number) => (
    <div key={item.id} className="group relative">
      <div 
        className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative hover:shadow-md transition-shadow"
        onClick={() => openCarousel(index)}
      >
        {item.type === 'image' ? (
          <img 
            src={item.url} 
            alt={item.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : item.type === 'video' ? (
          <>
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Video className="h-6 w-6 text-gray-400" />
            </div>
            <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
              <Video className="h-2 w-2 text-white" />
            </div>
          </>
        ) : (
          <>
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
              <FileText className="h-2 w-2 text-white" />
            </div>
          </>
        )}
        
        {/* Overlay with actions (owner only) */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(item.id);
              }}
              className="rounded-2xl p-1 h-6 w-6"
            >
              {item.visibility === 'public' ? 
                <Eye className="h-3 w-3" /> : 
                <EyeOff className="h-3 w-3" />
              }
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              className="rounded-2xl p-1 h-6 w-6"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Visibility indicator */}
        {item.visibility === 'private' && (
          <div className="absolute top-1 left-1 bg-black/50 rounded-full p-1">
            <EyeOff className="h-2 w-2 text-white" />
          </div>
        )}
      </div>
    </div>
  );

  const currentItem = mediaItems[currentIndex];

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold">Portfolio & Media</CardTitle>
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
                    <Label>File</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {newMedia.file ? newMedia.file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Images (JPG, PNG, WebP), Videos (MP4, WebM), Documents (PDF) up to 10MB/200MB
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

                  {/* Caption */}
                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <Input
                      placeholder="Describe this media..."
                      value={newMedia.caption}
                      onChange={(e) => setNewMedia(prev => ({ ...prev, caption: e.target.value }))}
                    />
                  </div>

                  {/* External Link */}
                  <div className="space-y-2">
                    <Label>External Link (optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={newMedia.externalLink}
                      onChange={(e) => setNewMedia(prev => ({ ...prev, externalLink: e.target.value }))}
                    />
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center justify-between">
                    <Label>Public Visibility</Label>
                    <Switch
                      checked={newMedia.visibility === 'public'}
                      onCheckedChange={(checked) => 
                        setNewMedia(prev => ({ ...prev, visibility: checked ? 'public' : 'private' }))
                      }
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
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          {mediaItems.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {mediaItems.filter(item => item.type === 'image').map((item, index) => (
                <div key={item.id} className="group relative">
                  <div 
                    className="w-full h-20 md:h-20 bg-gray-100 rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openCarousel(index)}
                  >
                    <img 
                      src={item.url} 
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Visibility indicator */}
                    {item.visibility === 'private' && (
                      <div className="absolute top-1 left-1 bg-black/50 rounded-full p-1">
                        <EyeOff className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <div className="h-16 w-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <p className="text-lg">No portfolio items yet</p>
              {isOwnProfile && (
                <p className="text-sm mt-1">Upload your first project to get started</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carousel Modal */}
      {isCarouselOpen && currentItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="max-w-5xl w-full mx-auto p-4 relative">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCarouselOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-2xl"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation Arrows */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateCarousel('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 rounded-2xl"
              disabled={mediaItems.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateCarousel('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 rounded-2xl"
              disabled={mediaItems.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Media Content */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {currentItem.type === 'image' ? (
                  <img 
                    src={currentItem.url} 
                    alt={currentItem.caption}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : currentItem.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-24 w-24 text-gray-400" />
                    <p className="ml-4 text-gray-600">Video player would be rendered here</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-24 w-24 text-gray-400" />
                    <p className="ml-4 text-gray-600">Document viewer would be rendered here</p>
                  </div>
                )}
              </div>
              
              {/* Caption and Info */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {currentItem.caption}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Uploaded on {currentItem.uploadedAt.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {currentIndex + 1} of {mediaItems.length} items
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {currentItem.externalLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(currentItem.externalLink, '_blank')}
                        className="rounded-2xl"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View External
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(currentItem.url, '_blank')}
                      className="rounded-2xl"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {mediaItems.length > 1 && (
                <div className="px-6 pb-6">
                  <div className="flex gap-2 overflow-x-auto">
                    {mediaItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={cn(
                          "w-12 h-12 bg-gray-100 rounded cursor-pointer border-2 transition-colors",
                          index === currentIndex ? "border-primary" : "border-transparent hover:border-gray-300"
                        )}
                        onClick={() => setCurrentIndex(index)}
                      >
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={item.caption}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(item.type)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}