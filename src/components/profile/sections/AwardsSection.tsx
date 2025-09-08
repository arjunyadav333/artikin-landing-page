import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Calendar, ExternalLink, Edit, Trash2, Medal, ImageIcon } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AwardsSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface Award {
  id: string;
  title: string;
  year: string;
  description: string;
  organization?: string;
  category?: string;
  media_url?: string;
  link?: string;
  rank?: 'first' | 'second' | 'third' | 'finalist' | 'winner' | 'honorable_mention';
}

// Mock data for awards
const mockAwards: Award[] = [
  {
    id: '1',
    title: 'Best Supporting Actor',
    year: '2023',
    description: 'Recognized for outstanding performance in the regional theater production of "The Glass Menagerie".',
    organization: 'Regional Theater Awards',
    category: 'Theater',
    media_url: '/api/placeholder/400/300',
    link: 'https://example.com/award-ceremony',
    rank: 'first'
  },
  {
    id: '2',
    title: 'Young Artist Recognition',
    year: '2022',
    description: 'Awarded for exceptional contribution to contemporary dance and choreography in the local arts community.',
    organization: 'Arts Council',
    category: 'Dance',
    rank: 'winner'
  }
];

export function AwardsSection({ profile, isOwnProfile }: AwardsSectionProps) {
  const [awards, setAwards] = useState<Award[]>(mockAwards);
  const [isAddingAward, setIsAddingAward] = useState(false);
  const [newAward, setNewAward] = useState({
    title: '',
    year: '',
    description: '',
    organization: '',
    category: '',
    link: '',
    rank: 'winner' as Award['rank']
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addAward = () => {
    const award: Award = {
      id: Date.now().toString(),
      ...newAward,
      media_url: selectedFile ? URL.createObjectURL(selectedFile) : undefined
    };
    setAwards(prev => [award, ...prev]);
    setNewAward({
      title: '',
      year: '',
      description: '',
      organization: '',
      category: '',
      link: '',
      rank: 'winner'
    });
    setSelectedFile(null);
    setIsAddingAward(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG, WebP, and PDF files are allowed');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const getRankIcon = (rank: Award['rank']) => {
    switch (rank) {
      case 'first': return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'second': return <Medal className="h-5 w-5 text-gray-500" />;
      case 'third': return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-5 w-5 text-blue-600" />;
    }
  };

  const getRankColor = (rank: Award['rank']) => {
    switch (rank) {
      case 'first': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'second': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'third': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'finalist': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'winner': return 'bg-green-100 text-green-800 border-green-200';
      case 'honorable_mention': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRank = (rank: Award['rank']) => {
    return rank.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Awards & Recognition</h2>
          <p className="text-sm text-gray-600 mt-1">Achievements and accolades in your field</p>
        </div>

        {isOwnProfile && (
          <Dialog open={isAddingAward} onOpenChange={setIsAddingAward}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl">
                <Plus className="h-4 w-4" />
                Add Award
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Award</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="award-title">Award Title</Label>
                    <Input
                      id="award-title"
                      value={newAward.title}
                      onChange={(e) => setNewAward(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter award name"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="award-year">Year</Label>
                    <Input
                      id="award-year"
                      type="number"
                      min="1950"
                      max="2030"
                      value={newAward.year}
                      onChange={(e) => setNewAward(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2024"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="award-organization">Organization</Label>
                    <Input
                      id="award-organization"
                      value={newAward.organization}
                      onChange={(e) => setNewAward(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Awarding organization"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="award-category">Category</Label>
                    <Input
                      id="award-category"
                      value={newAward.category}
                      onChange={(e) => setNewAward(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Theater, Film, Dance"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="award-rank">Achievement Level</Label>
                  <select
                    id="award-rank"
                    value={newAward.rank}
                    onChange={(e) => setNewAward(prev => ({ ...prev, rank: e.target.value as Award['rank'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="winner">Winner</option>
                    <option value="first">First Place</option>
                    <option value="second">Second Place</option>
                    <option value="third">Third Place</option>
                    <option value="finalist">Finalist</option>
                    <option value="honorable_mention">Honorable Mention</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="award-description">Description</Label>
                  <Textarea
                    id="award-description"
                    value={newAward.description}
                    onChange={(e) => setNewAward(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the achievement and its significance..."
                    className="rounded-2xl min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="award-link">Award Link (Optional)</Label>
                  <Input
                    id="award-link"
                    type="url"
                    value={newAward.link}
                    onChange={(e) => setNewAward(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://..."
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="award-file">Award Image/Certificate (Optional)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="award-file"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="rounded-2xl"
                    />
                    {selectedFile && (
                      <Badge variant="secondary" className="rounded-full">
                        {selectedFile.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported formats: Images (JPEG, PNG, WebP) and PDF (Max 10MB)
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingAward(false)} className="rounded-2xl">
                    Cancel
                  </Button>
                  <Button 
                    onClick={addAward} 
                    className="rounded-2xl" 
                    disabled={!newAward.title || !newAward.year || !newAward.description}
                  >
                    Add Award
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Awards List */}
      {awards.length > 0 ? (
        <div className="space-y-6">
          {awards.map((award) => (
            <Card key={award.id} className="rounded-2xl shadow-sm p-6 bg-white border-gray-200">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Award Media */}
                {award.media_url && (
                  <div className="w-full md:w-48 flex-shrink-0">
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={award.media_url}
                        alt={award.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* Award Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getRankIcon(award.rank)}
                        <h3 className="text-lg font-semibold text-gray-900">{award.title}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge className={`rounded-full text-xs border ${getRankColor(award.rank)}`}>
                          {formatRank(award.rank)}
                        </Badge>
                        
                        {award.category && (
                          <Badge variant="outline" className="rounded-full text-xs">
                            {award.category}
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {award.year}
                        </div>
                      </div>

                      {award.organization && (
                        <p className="text-gray-700 font-medium mb-2">{award.organization}</p>
                      )}
                    </div>

                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed">{award.description}</p>

                  {award.link && (
                    <div>
                      <a
                        href={award.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline bg-primary/5 px-3 py-1 rounded-full border border-primary/20"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Details
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-sm p-12 text-center bg-gray-50/50 border-gray-200">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No awards added yet</h3>
          <p className="text-gray-600 mb-6">
            {isOwnProfile 
              ? 'Showcase your achievements and recognition by adding your awards and accolades.'
              : `This ${profile.role} hasn't added any awards yet.`
            }
          </p>
          {isOwnProfile && (
            <Button className="rounded-2xl" onClick={() => setIsAddingAward(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Award
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}