import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

interface ContactSocialCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const socialPlatforms = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'custom', label: 'Custom', icon: '🔗' }
];

interface SocialLink {
  id: string;
  type: string;
  url: string;
  label?: string;
}

export function ContactSocialCard({ profile, isOwnProfile }: ContactSocialCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ type: '', url: '', label: '' });
  
  // Mock social links - replace with actual profile data
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: '1', type: 'instagram', url: 'https://instagram.com/johndoe' },
    { id: '2', type: 'website', url: 'https://johndoe.com' },
  ]);

  const handleAddLink = () => {
    if (newLink.type && newLink.url) {
      const link: SocialLink = {
        id: Date.now().toString(),
        type: newLink.type,
        url: newLink.url,
        label: newLink.label
      };
      setSocialLinks(prev => [...prev, link]);
      setNewLink({ type: '', url: '', label: '' });
      setIsAddModalOpen(false);
      // TODO: Save to backend
    }
  };

  const handleDeleteLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id));
    // TODO: Delete from backend
  };

  const getPlatformIcon = (type: string) => {
    const platform = socialPlatforms.find(p => p.value === type);
    return platform?.icon || '🔗';
  };

  const getPlatformLabel = (type: string) => {
    const platform = socialPlatforms.find(p => p.value === type);
    return platform?.label || type;
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">Contact & Social</CardTitle>
        {isOwnProfile && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-2xl px-4 py-2 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Add Social Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 px-1">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={newLink.type} onValueChange={(value) => 
                    setNewLink(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialPlatforms.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <span className="flex items-center gap-2">
                            <span>{platform.icon}</span>
                            {platform.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://..."
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>

                {newLink.type === 'custom' && (
                  <div className="space-y-2">
                    <Label>Custom Label</Label>
                    <Input
                      placeholder="e.g., Portfolio, Blog"
                      value={newLink.label}
                      onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                )}

              </div>
              <div className="flex gap-2 pt-4 border-t bg-white flex-shrink-0 mt-4">
                <Button onClick={handleAddLink} className="rounded-2xl">
                  Add Link
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
        {socialLinks.length > 0 ? (
          <div className="space-y-3">
            {socialLinks.map((link) => (
              <div 
                key={link.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getPlatformIcon(link.type)}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {link.label || getPlatformLabel(link.type)}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {link.url}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(link.url, '_blank')}
                    className="rounded-2xl"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteLink(link.id)}
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
            <p>No social links added yet</p>
            {isOwnProfile && (
              <p className="text-sm mt-1">Click "Add Link" to connect your social profiles</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}