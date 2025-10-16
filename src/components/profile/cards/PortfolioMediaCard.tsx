import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileUp, Image, Video, FileText, Trash2, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { useUserPortfolios, useCreatePortfolio, useDeletePortfolio, uploadPortfolioMedia, Portfolio } from '@/hooks/usePortfolios';
import { useToast } from '@/hooks/use-toast';

interface PortfolioMediaCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function PortfolioMediaCard({ 
  profile, 
  isOwnProfile
}: PortfolioMediaCardProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [newMedia, setNewMedia] = useState({
    file: null as File | null,
    caption: '',
    externalLink: '',
    visibility: 'public' as 'public' | 'private'
  });

  // Fetch portfolios from database
  const { data: portfolios = [], isLoading: portfoliosLoading } = useUserPortfolios(profile.user_id);
  const createPortfolio = useCreatePortfolio();
  const deletePortfolio = useDeletePortfolio();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const maxSize = file.type.startsWith('video/') ? 200 * 1024 * 1024 : 10 * 1024 * 1024; // 200MB for video, 10MB for others
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `Maximum size is ${file.type.startsWith('video/') ? '200MB' : '10MB'}`,
          variant: "destructive"
        });
        return;
      }

      setNewMedia(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!newMedia.file || !newMedia.caption.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and add a caption",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      setUploadProgress(30);
      const { url, type } = await uploadPortfolioMedia(newMedia.file, profile.user_id);
      
      setUploadProgress(70);

      // Create portfolio record
      await createPortfolio.mutateAsync({
        title: newMedia.caption,
        description: newMedia.externalLink || undefined,
        media_urls: [url],
        media_types: [type],
        visibility: newMedia.visibility
      });

      setUploadProgress(100);
      
      // Reset form and close modal
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setIsUploading(false);
        setUploadProgress(0);
        setNewMedia({ file: null, caption: '', externalLink: '', visibility: 'public' });
      }, 500);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await deletePortfolio.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
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
            <DialogContent className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Upload Media</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 px-1">
                {/* File Upload Area */}
                <div className="space-y-2">
                  <Label>File *</Label>
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
                  <Label>Caption *</Label>
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
                <div className="flex gap-2 pt-4 border-t bg-white flex-shrink-0 mt-4">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!newMedia.file || !newMedia.caption.trim() || isUploading}
                    className="rounded-2xl"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : 'Upload'}
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
        {portfoliosLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Loading portfolio...</p>
          </div>
        ) : portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((item: Portfolio) => (
              <div key={item.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {item.media_types[0] === 'image' && item.media_urls[0] ? (
                    <img 
                      src={item.media_urls[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : item.media_types[0] === 'video' ? (
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
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-2xl"
                        disabled={deletePortfolio.isPending}
                      >
                        {deletePortfolio.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Visibility indicator */}
                  {item.visibility === 'private' && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 rounded-full p-1">
                        <EyeOff className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Caption and link */}
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {item.title}
                  </p>
                  {item.description && (
                    <a 
                      href={item.description}
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