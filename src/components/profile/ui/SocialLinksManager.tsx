import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Globe, 
  Edit, 
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';

interface SocialLinksManagerProps {
  socialLinks: Record<string, string>;
  isOwnProfile: boolean;
}

interface SocialLink {
  id: string;
  type: string;
  url: string;
  label: string;
}

export function SocialLinksManager({ socialLinks, isOwnProfile }: SocialLinksManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ type: 'Instagram', url: '' });

  const socialPlatforms = [
    { value: 'Instagram', label: 'Instagram', icon: Instagram },
    { value: 'Facebook', label: 'Facebook', icon: Facebook },
    { value: 'Twitter', label: 'Twitter', icon: Twitter },
    { value: 'YouTube', label: 'YouTube', icon: Youtube },
    { value: 'LinkedIn', label: 'LinkedIn', icon: Linkedin },
    { value: 'Website', label: 'Website', icon: Globe },
    { value: 'Custom', label: 'Other', icon: Globe }
  ];

  // Convert socialLinks object to array for easier management
  const [links, setLinks] = useState<SocialLink[]>(
    Object.entries(socialLinks).map(([type, url], index) => ({
      id: `${type}-${index}`,
      type,
      url,
      label: type
    }))
  );

  const getIcon = (type: string) => {
    const platform = socialPlatforms.find(p => p.value === type);
    const IconComponent = platform?.icon || Globe;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleAddLink = () => {
    if (!newLink.url) return;
    
    const id = Date.now().toString();
    const linkToAdd: SocialLink = {
      id,
      type: newLink.type,
      url: newLink.url,
      label: newLink.type
    };
    
    setLinks([...links, linkToAdd]);
    setNewLink({ type: 'Instagram', url: '' });
    setShowAddForm(false);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleEditLink = (id: string, newUrl: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, url: newUrl } : link
    ));
    setEditingId(null);
  };

  const validateUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const displayUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  if (links.length === 0 && !isOwnProfile && !showAddForm) {
    return (
      <p className="text-sm text-gray-500">No social links added yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing Links */}
      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-3 p-3 border rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="text-gray-600">
              {getIcon(link.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{link.label}</span>
                {link.type === 'Custom' && (
                  <span className="text-xs text-gray-500">Custom</span>
                )}
              </div>
              {editingId === link.id ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    defaultValue={link.url}
                    placeholder="Enter URL"
                    className="text-sm rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditLink(link.id, e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={() => setEditingId(null)}
                    variant="ghost"
                    className="px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <a 
                  href={formatUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {displayUrl(link.url)}
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={() => window.open(formatUrl(link.url), '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              
              {isOwnProfile && (
                <>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingId(editingId === link.id ? null : link.id)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Link Form */}
      {showAddForm && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
          <h4 className="font-medium text-gray-900">Add Social Link</h4>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Platform</Label>
              <select
                value={newLink.type}
                onChange={(e) => setNewLink({...newLink, type: e.target.value})}
                className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                {socialPlatforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">URL</Label>
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                placeholder="https://example.com or username"
                className="rounded-2xl mt-1"
              />
              {newLink.url && !validateUrl(newLink.url) && (
                <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddLink}
              size="sm"
              className="rounded-2xl"
              disabled={!newLink.url || !validateUrl(newLink.url)}
            >
              Add Link
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(false)}
              size="sm"
              className="rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {isOwnProfile && !showAddForm && (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          size="sm"
          className="rounded-2xl w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Social Link
        </Button>
      )}
    </div>
  );
}
