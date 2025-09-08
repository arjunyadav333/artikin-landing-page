import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Grid, List, Upload, Eye, EyeOff, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';

interface PortfolioSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  caption: string;
  link?: string;
  visibility: 'public' | 'private';
  created_at: string;
}

// Mock data for portfolio items
const mockPortfolioItems: MediaItem[] = [
  {
    id: '1',
    url: '/api/placeholder/400/300',
    type: 'image',
    caption: 'Professional headshot for casting',
    visibility: 'public',
    created_at: '2024-01-15'
  },
  {
    id: '2', 
    url: '/api/placeholder/400/600',
    type: 'image',
    caption: 'Dance performance at cultural event',
    link: 'https://example.com/performance',
    visibility: 'public',
    created_at: '2024-01-10'
  }
];

export function PortfolioSection({ profile, isOwnProfile }: PortfolioSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [portfolioItems, setPortfolioItems] = useState<MediaItem[]>(mockPortfolioItems);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    // Handle file upload logic here
    console.log('Files dropped:', files);
  };

  const sectionTitle = profile.role === 'artist' ? 'Portfolio' : 'About Organization';
  const sectionDescription = profile.role === 'artist' 
    ? 'Showcase your best work and talent' 
    : 'Share information about your organization';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{sectionTitle}</h2>
          <p className="text-sm text-gray-600 mt-1">{sectionDescription}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-2xl p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-xl px-3 py-1.5"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-xl px-3 py-1.5"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Button */}
          {isOwnProfile && (
            <Button className="gap-2 rounded-2xl">
              <Plus className="h-4 w-4" />
              Add {profile.role === 'artist' ? 'Portfolio Item' : 'Content'}
            </Button>
          )}
        </div>
      </div>

      {/* Upload Area (for owners) */}
      {isOwnProfile && (
        <Card 
          className={cn(
            "rounded-2xl border-2 border-dashed transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-gray-300"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Media
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop files here or click to browse. Supports images, videos, and documents.
            </p>
            <Button variant="outline" className="rounded-2xl">
              Browse Files
            </Button>
          </div>
        </Card>
      )}

      {/* Portfolio Grid/List */}
      {portfolioItems.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {portfolioItems.map((item) => (
            <Card key={item.id} className="rounded-2xl shadow-sm overflow-hidden bg-white border-gray-200">
              {viewMode === 'grid' ? (
                // Grid View
                <div>
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : item.type === 'video' ? (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <LinkIcon className="h-8 w-8 text-gray-500" />
                          </div>
                          <p className="text-sm text-gray-600">Document</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay with actions */}
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge variant={item.visibility === 'public' ? 'default' : 'secondary'} className="gap-1">
                            {item.visibility === 'public' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {item.visibility}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-gray-800 font-medium line-clamp-2">
                      {item.caption}
                    </p>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" />
                        View Link
                      </a>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                // List View
                <div className="p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LinkIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.caption}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <Badge variant={item.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                        {item.visibility}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-sm p-12 text-center bg-gray-50/50 border-gray-200">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {profile.role === 'artist' ? 'portfolio items' : 'content'} yet
          </h3>
          <p className="text-gray-600 mb-6">
            {isOwnProfile 
              ? `Start building your ${profile.role === 'artist' ? 'portfolio' : 'organization profile'} by adding your first ${profile.role === 'artist' ? 'work sample' : 'content'}.`
              : `This ${profile.role} hasn't added any ${profile.role === 'artist' ? 'portfolio items' : 'content'} yet.`
            }
          </p>
          {isOwnProfile && (
            <Button className="rounded-2xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First {profile.role === 'artist' ? 'Portfolio Item' : 'Content'}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}