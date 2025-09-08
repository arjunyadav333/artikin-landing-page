import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Grid, List, Upload, Eye, EyeOff, Edit, Trash2, ImageIcon, Video, FileText, Filter } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';

interface MediaSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  title: string;
  caption?: string;
  visibility: 'public' | 'private';
  size: number;
  duration?: number; // for videos
  created_at: string;
}

type MediaFilter = 'all' | 'image' | 'video' | 'document';
type MediaSort = 'newest' | 'oldest' | 'name' | 'size';

// Mock data for media items
const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    url: '/api/placeholder/400/300',
    type: 'image',
    title: 'Professional Headshot',
    caption: 'High-resolution professional headshot for casting submissions',
    visibility: 'public',
    size: 2.5 * 1024 * 1024, // 2.5MB
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    url: '/api/placeholder/video',
    type: 'video',
    title: 'Acting Reel 2024',
    caption: 'Compilation of recent acting performances and monologues',
    visibility: 'public',
    size: 15.7 * 1024 * 1024, // 15.7MB
    duration: 120, // 2 minutes
    created_at: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    url: '/api/placeholder/document.pdf',
    type: 'document',
    title: 'Resume 2024',
    caption: 'Updated professional resume with recent credits',
    visibility: 'private',
    size: 0.8 * 1024 * 1024, // 0.8MB
    created_at: '2024-01-05T09:15:00Z'
  }
];

export function MediaSection({ profile, isOwnProfile }: MediaSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(mockMediaItems);
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [sort, setSort] = useState<MediaSort>('newest');
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
    console.log('Files dropped:', files);
    // Handle file upload logic here
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'document': return FileText;
    }
  };

  // Filter and sort media items
  const filteredAndSortedItems = mediaItems
    .filter(item => filter === 'all' || item.type === filter)
    .sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

  const filterCounts = {
    all: mediaItems.length,
    image: mediaItems.filter(item => item.type === 'image').length,
    video: mediaItems.filter(item => item.type === 'video').length,
    document: mediaItems.filter(item => item.type === 'document').length
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
          <p className="text-sm text-gray-600 mt-1">
            All your uploaded images, videos, and documents
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'image', 'video', 'document'] as MediaFilter[]).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="rounded-2xl text-xs"
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filterCounts[filterType]}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as MediaSort)}
            className="px-3 py-1.5 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Size (Large to Small)</option>
          </select>

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

          {/* Upload Button */}
          {isOwnProfile && (
            <Button className="gap-2 rounded-2xl whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Upload Media
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
              Upload Media Files
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop files here or click to browse. Supports images (JPG, PNG, WebP), videos (MP4, WebM), and documents (PDF).
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              <span>Max 50MB per file</span>
              <span>•</span>
              <span>Bulk upload supported</span>
            </div>
          </div>
        </Card>
      )}

      {/* Media Grid/List */}
      {filteredAndSortedItems.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
        )}>
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className="rounded-2xl shadow-sm overflow-hidden bg-white border-gray-200">
              {viewMode === 'grid' ? (
                // Grid View
                <div>
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : item.type === 'video' ? (
                      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                        <Video className="h-12 w-12 text-white/70" />
                        {item.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(item.duration)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600">PDF Document</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay with actions */}
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full bg-white/90">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full bg-white/90">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge variant={item.visibility === 'public' ? 'default' : 'secondary'} className="gap-1 text-xs">
                            {item.visibility === 'public' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {item.visibility}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{item.title}</h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span className="capitalize">{item.type}</span>
                      <span>{formatFileSize(item.size)}</span>
                    </div>
                    {item.caption && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.caption}</p>
                    )}
                  </div>
                </div>
              ) : (
                // List View
                <div className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      React.createElement(getMediaIcon(item.type), { 
                        className: "h-6 w-6 text-gray-400" 
                      })
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatFileSize(item.size)}</span>
                      {item.duration && (
                        <span className="text-xs text-gray-500">{formatDuration(item.duration)}</span>
                      )}
                      <Badge variant={item.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                        {item.visibility}
                      </Badge>
                    </div>
                    {item.caption && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{item.caption}</p>
                    )}
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
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No media files yet' : `No ${filter} files found`}
          </h3>
          <p className="text-gray-600 mb-6">
            {isOwnProfile 
              ? filter === 'all' 
                ? 'Start building your media library by uploading images, videos, and documents.'
                : `No ${filter} files match your current filter. Try uploading some or change the filter.`
              : `This ${profile.role} hasn't uploaded any ${filter === 'all' ? 'media files' : filter + ' files'} yet.`
            }
          </p>
          {isOwnProfile && (
            <Button className="rounded-2xl">
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First {filter === 'all' ? 'Media File' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}