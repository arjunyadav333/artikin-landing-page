import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trophy, ExternalLink, Trash2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

interface AwardsCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface Award {
  id: string;
  title: string;
  year: number;
  description: string;
  attachmentUrl?: string;
  externalLink?: string;
}

export function AwardsCard({ profile, isOwnProfile }: AwardsCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      externalLink: 'https://theatreawards.com/winners/2023'
    },
    {
      id: '2',
      title: 'Excellence in Performance',
      year: 2022,
      description: 'Drama Academy recognition for consistent high-quality performances.'
    }
  ]);

  const handleAddAward = () => {
    if (newAward.title && newAward.year) {
      const award: Award = {
        id: Date.now().toString(),
        ...newAward
      };
      setAwards(prev => [award, ...prev]);
      setNewAward({
        title: '',
        year: new Date().getFullYear(),
        description: '',
        attachmentUrl: '',
        externalLink: ''
      });
      setIsAddModalOpen(false);
      // TODO: Save to backend
    }
  };

  const handleDelete = (id: string) => {
    setAwards(prev => prev.filter(award => award.id !== id));
    // TODO: Delete from backend
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
    </Card>
  );
}