import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CalendarIcon, Briefcase, ExternalLink, Trash2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Profile } from '@/hooks/useProfiles';
import { MediaUpload } from '../components/MediaUpload';
import { MediaLightbox } from '../components/MediaLightbox';

interface ProjectsCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface Project {
  id: string;
  title: string;
  role?: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  links: string[];
  media: Array<{ id: string; url: string; }>;
  attachmentUrl?: string;
}

export function ProjectsCard({ profile, isOwnProfile }: ProjectsCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedProjectMedia, setSelectedProjectMedia] = useState<Array<{ id: string; url: string; }>>([]);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; file: File; preview: string; }>>([]);
  const [newProject, setNewProject] = useState({
    title: '',
    role: '',
    description: '',
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    links: [''],
    attachmentUrl: ''
  });

  // Mock projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Romeo and Juliet',
      role: 'Romeo',
      description: 'Lead role in Shakespeare\'s classic tragedy. Performed at the Metropolitan Theatre for 3 months.',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-08-31'),
      links: ['https://mettheatre.com/romeo-juliet'],
      media: [
        { id: '1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500' },
        { id: '2', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500' }
      ]
    },
    {
      id: '2',
      title: 'Commercial Photography Campaign',
      role: 'Model',
      description: 'Fashion modeling for summer collection campaign. Featured in print and digital advertisements.',
      startDate: new Date('2023-04-15'),
      endDate: new Date('2023-05-15'),
      links: ['https://fashionbrand.com/campaign'],
      media: []
    }
  ]);

  const handleAddProject = async () => {
    if (newProject.title && newProject.description) {
      // TODO: Upload files and get URLs
      const mediaUrls = selectedFiles.map(f => ({ id: f.id, url: f.preview }));
      
      const project: Project = {
        id: Date.now().toString(),
        ...newProject,
        links: newProject.links.filter(link => link.trim() !== ''),
        media: mediaUrls
      };
      setProjects(prev => [project, ...prev]);
      setNewProject({
        title: '',
        role: '',
        description: '',
        startDate: new Date(),
        endDate: undefined,
        links: [''],
        attachmentUrl: ''
      });
      setSelectedFiles([]);
      setIsAddModalOpen(false);
      // TODO: Save to backend
    }
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    // TODO: Delete from backend
  };

  const handleDeleteMedia = (mediaId: string) => {
    const updatedProjects = projects.map(project => ({
      ...project,
      media: project.media.filter(m => m.id !== mediaId)
    }));
    setProjects(updatedProjects);
    setSelectedProjectMedia(prev => prev.filter(m => m.id !== mediaId));
    // TODO: Delete from backend
  };

  const openLightbox = (projectMedia: Array<{ id: string; url: string; }>, index: number) => {
    setSelectedProjectMedia(projectMedia);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const addLinkField = () => {
    setNewProject(prev => ({ ...prev, links: [...prev.links, ''] }));
  };

  const updateLink = (index: number, value: string) => {
    setNewProject(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? value : link)
    }));
  };

  const removeLinkField = (index: number) => {
    if (newProject.links.length > 1) {
      setNewProject(prev => ({
        ...prev,
        links: prev.links.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">Past Projects</CardTitle>
        {isOwnProfile && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-2xl px-4 py-2 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Add Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Title</Label>
                    <Input
                      placeholder="Name of the project"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Your Role (optional)</Label>
                    <Input
                      placeholder="e.g., Lead Actor, Model, etc."
                      value={newProject.role}
                      onChange={(e) => setNewProject(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the project and your involvement..."
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newProject.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newProject.startDate ? format(newProject.startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newProject.startDate}
                          onSelect={(date) => date && setNewProject(prev => ({ ...prev, startDate: date }))}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date (optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newProject.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newProject.endDate ? format(newProject.endDate, "PPP") : "Pick a date (optional)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newProject.endDate}
                          onSelect={(date) => setNewProject(prev => ({ ...prev, endDate: date }))}
                          disabled={(date) => date > new Date() || date < newProject.startDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Links (optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLinkField}
                      className="rounded-2xl"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  {newProject.links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="https://project-link.com"
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                      />
                      {newProject.links.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLinkField(index)}
                          className="rounded-2xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Media Upload */}
                <MediaUpload
                  selectedFiles={selectedFiles}
                  onFilesChange={setSelectedFiles}
                  maxFiles={5}
                />

              </div>
              <div className="flex gap-2 pt-4 border-t bg-white flex-shrink-0 mt-4">
                <Button onClick={handleAddProject} className="rounded-2xl">
                  Add Project
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
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {project.title}
                        {project.role && (
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            as {project.role}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {format(project.startDate, 'MMM yyyy')} - {
                          project.endDate ? format(project.endDate, 'MMM yyyy') : 'Present'
                        }
                      </p>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3 break-words overflow-hidden">
                        {project.description}
                      </p>
                      {project.links.length > 0 && (
                        <div className="space-y-1">
                          {project.links.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mr-3"
                            >
                              View Project <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                      {project.media.length > 0 && (
                        <div className="mt-3">
                          <div className="flex gap-2 flex-wrap max-w-full overflow-hidden">
                            {project.media.slice(0, 6).map((media, index) => (
                              <img
                                key={media.id}
                                src={media.url}
                                alt={`Project ${project.title} image ${index + 1}`}
                                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                onClick={() => openLightbox(project.media, index)}
                              />
                            ))}
                            {project.media.length > 6 && (
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                                +{project.media.length - 6}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(project.id)}
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
              <Briefcase className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p>No projects added yet</p>
            {isOwnProfile && (
              <p className="text-sm mt-1">Add your past work and collaborations</p>
            )}
          </div>
        )}
      </CardContent>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={selectedProjectMedia}
        initialIndex={lightboxIndex}
        canDelete={isOwnProfile}
        onDelete={handleDeleteMedia}
      />
    </Card>
  );
}