import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileUp, Image, Video, FileText, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

interface PortfolioMediaCardProps {
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

export function PortfolioMediaCard({ 
  profile, 
  isOwnProfile, 
  portfolios = [],
  portfoliosLoading = false 
}: PortfolioMediaCardProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
      type: 'document',
      url: '/placeholder.svg',
      caption: 'Professional Resume',
      visibility: 'private',
      uploadedAt: new Date('2024-01-05')
    }
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const maxSize = file.type.startsWith('video/') ? 200 * 1024 * 1024 : 10 * 1024 * 1024; // 200MB for video, 10MB for others
      
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

    // Simulate upload progress
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
      // TODO: Implement actual upload logic
      // 1. Get signed upload URL
      // 2. Upload file with progress tracking
      // 3. Create media record
      
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
    // TODO: Delete from backend
  };

  const toggleVisibility = (id: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, visibility: item.visibility === 'public' ? 'private' : 'public' }
        : item
    ));
    // TODO: Update backend
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
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
            <DialogContent className="bg-white rounded-2xl p-6 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                    accept="image/*,video/*,.pdf"
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

                {/* Actions */}
                <div className="flex gap-2 pt-4">
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
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleVisibility(item.id)}
                        className="rounded-2xl"
                      >
                        {item.visibility === 'public' ? 
                          <Eye className="h-4 w-4" /> : 
                          <EyeOff className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-2xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Visibility indicator */}
                  <div className="absolute top-2 right-2">
                    {item.visibility === 'private' && (
                      <div className="bg-black/50 rounded-full p-1">
                        <EyeOff className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption and link */}
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {item.caption}
                  </p>
                  {item.externalLink && (
                    <a 
                      href={item.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      View external <ExternalLink className="h-3 w-3" />
                    </a>
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
  );
}