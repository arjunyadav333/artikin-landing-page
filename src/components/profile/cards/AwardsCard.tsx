import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trophy, ExternalLink, Trash2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { MediaUpload } from '../components/MediaUpload';
import { MediaLightbox } from '../components/MediaLightbox';

interface AwardsCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface Award {
  id: string;
  title: string;
  year: number;
  description: string;
  media: Array<{ id: string; url: string; }>;
  attachmentUrl?: string;
  externalLink?: string;
}

export function AwardsCard({ profile, isOwnProfile }: AwardsCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedAwardMedia, setSelectedAwardMedia] = useState<Array<{ id: string; url: string; }>>([]);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; file: File; preview: string; }>>([]);
  const [newAward, setNewAward] = useState({
    title: '',
    year: new Date().getFullYear(),
    description: '',
    attachmentUrl: '',
    externalLink: ''
  });

  // Mock awards data
  const [awards, setAwards] = useState<Award[]>([
    {
      id: '1',
      title: 'Best Supporting Actor',
      year: 2023,
      description: 'Regional Theatre Awards for outstanding performance in "The Glass Menagerie".',
      externalLink: 'https://theatreawards.com/winners/2023',
      media: [
        { id: '1', url: 'https://images.unsplash.com/photo-1570126646281-5ec4f8e0ee06?w=500' }
      ]
    },
    {
      id: '2',
      title: 'Excellence in Performance',
      year: 2022,
      description: 'Drama Academy recognition for consistent high-quality performances.',
      media: []
    }
  ]);

  const handleAddAward = async () => {
    if (newAward.title && newAward.year) {
      // Media upload will be implemented when backend is ready
      const mediaUrls = selectedFiles.map(f => ({ id: f.id, url: f.preview }));
      
      const award: Award = {
        id: Date.now().toString(),
        ...newAward,
        media: mediaUrls
      };
      setAwards(prev => [award, ...prev]);
      setNewAward({
        title: '',
        year: new Date().getFullYear(),
        description: '',
        attachmentUrl: '',
        externalLink: ''
      });
      setSelectedFiles([]);
      setIsAddModalOpen(false);
      // Backend integration pending
    }
  };

  const handleDelete = (id: string) => {
    setAwards(prev => prev.filter(award => award.id !== id));
    // Backend integration pending
  };

  const handleDeleteMedia = (mediaId: string) => {
    const updatedAwards = awards.map(award => ({
      ...award,
      media: award.media.filter(m => m.id !== mediaId)
    }));
    setAwards(updatedAwards);
    setSelectedAwardMedia(prev => prev.filter(m => m.id !== mediaId));
    // Backend integration pending
  };

  const openLightbox = (awardMedia: Array<{ id: string; url: string; }>, index: number) => {
    setSelectedAwardMedia(awardMedia);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">Awards</CardTitle>
        {isOwnProfile && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-2xl px-4 py-2 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Award
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Add Award</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Award Title</Label>
                    <Input
                      placeholder="Name of the award"
                      value={newAward.title}
                      onChange={(e) => setNewAward(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={newAward.year}
                      onChange={(e) => setNewAward(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the award and achievement..."
                    value={newAward.description}
                    onChange={(e) => setNewAward(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>External Link (optional)</Label>
                  <Input
                    placeholder="https://award-announcement.com"
                    value={newAward.externalLink}
                    onChange={(e) => setNewAward(prev => ({ ...prev, externalLink: e.target.value }))}
                  />
                </div>

                {/* Media Upload */}
                <MediaUpload
                  selectedFiles={selectedFiles}
                  onFilesChange={setSelectedFiles}
                  maxFiles={5}
                />

              </div>
              <div className="flex gap-2 pt-4 border-t bg-white flex-shrink-0 mt-4">
                <Button onClick={handleAddAward} className="rounded-2xl">
                  Add Award
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        {awards.length > 0 ? (
          <div className="space-y-4">
            {awards.map((award) => (
              <div 
                key={award.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {award.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {award.year}
                      </p>
                      {award.description && (
                        <p className="text-sm text-gray-700 mb-3">
                          {award.description}
                        </p>
                      )}
                      {award.externalLink && (
                        <a
                          href={award.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View Details <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {award.media.length > 0 && (
                        <div className="mt-3">
                          <div className="flex gap-2 flex-wrap">
                            {award.media.map((media, index) => (
                              <img
                                key={media.id}
                                src={media.url}
                                alt={`Award ${award.title} image ${index + 1}`}
                                className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openLightbox(award.media, index)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(award.id)}
                      className="rounded-2xl text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <Trophy className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p>No awards added yet</p>
            {isOwnProfile && (
              <p className="text-sm mt-1">Showcase your achievements and recognitions</p>
            )}
          </div>
        )}
      </CardContent>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={selectedAwardMedia}
        initialIndex={lightboxIndex}
        canDelete={isOwnProfile}
        onDelete={handleDeleteMedia}
      />
    </Card>
  );
}