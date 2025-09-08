import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Image, 
  Video, 
  File, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2,
  ExternalLink,
  Upload,
  Grid3X3,
  List
} from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { AddButton } from '../ui/AddButton';
import { MediaUpload } from '../ui/MediaUpload';

interface PortfolioSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function PortfolioSection({ profile, isOwnProfile }: PortfolioSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock portfolio data
  const portfolioItems = [
    {
      id: '1',
      title: 'Fashion Photography Session',
      type: 'image',
      url: '/placeholder.svg',
      caption: 'Professional fashion shoot for local magazine',
      visibility: 'public',
      external_link: 'https://example.com',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      title: 'Dance Performance Video',
      type: 'video',
      url: '/placeholder.svg',
      caption: 'Contemporary dance performance at the city theater',
      visibility: 'public',
      external_link: '',
      created_at: '2024-01-10'
    },
    {
      id: '3',
      title: 'Portrait Series',
      type: 'image',
      url: '/placeholder.svg',
      caption: 'Black and white portrait series',
      visibility: 'private',
      external_link: '',
      created_at: '2024-01-05'
    }
  ];

  const getIconByType = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Portfolio</CardTitle>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-md p-2"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-md p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            {isOwnProfile && (
              <AddButton 
                onClick={() => setShowUploadModal(true)}
                label="Add Media"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {portfolioItems.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
              <p className="text-gray-500 mb-4">Start building your portfolio by uploading your work</p>
              {isOwnProfile && (
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="rounded-2xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="group relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col justify-between">
                          {/* Title and Type */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 text-white">
                              {getIconByType(item.type)}
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                {item.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-white">
                              {item.visibility === 'public' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="text-white">
                              <h4 className="font-medium text-sm truncate">{item.title}</h4>
                              {item.caption && (
                                <p className="text-xs text-white/80 truncate">{item.caption}</p>
                              )}
                            </div>
                            {isOwnProfile && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={item.url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getIconByType(item.type)}
                          <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          {item.visibility === 'private' && (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        {item.caption && (
                          <p className="text-sm text-gray-600 truncate">{item.caption}</p>
                        )}
                        <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.external_link && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {isOwnProfile && (
                          <>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <MediaUpload
          onClose={() => setShowUploadModal(false)}
          onUpload={(files) => {
            // Handle upload
            console.log('Uploading files:', files);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}