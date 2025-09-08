import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, ExternalLink, Edit, Trash2, ImageIcon } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProjectsSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  links: string[];
  media_url?: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

// Mock data for projects
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Music Video - "Eternal Dreams"',
    description: 'Lead vocalist in an independent music video production featuring contemporary dance sequences.',
    start_date: '2024-01-15',
    end_date: '2024-02-20',
    links: ['https://youtube.com/watch?v=example'],
    media_url: '/api/placeholder/400/200',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Theater Production - "Romeo & Juliet"',
    description: 'Supporting role as Mercutio in a local theater adaptation of the classic Shakespeare play.',
    start_date: '2023-11-01',
    end_date: '2023-12-15',
    links: ['https://theatercompany.com/romeo-juliet'],
    status: 'completed'
  }
];

export function ProjectsSection({ profile, isOwnProfile }: ProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    links: [''],
    status: 'completed' as Project['status']
  });

  const addProject = () => {
    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      links: newProject.links.filter(link => link.trim() !== '')
    };
    setProjects(prev => [project, ...prev]);
    setNewProject({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      links: [''],
      status: 'completed'
    });
    setIsAddingProject(false);
  };

  const addLinkField = () => {
    setNewProject(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
  };

  const updateLink = (index: number, value: string) => {
    setNewProject(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? value : link)
    }));
  };

  const removeLink = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Past Projects</h2>
          <p className="text-sm text-gray-600 mt-1">Showcase your professional work and collaborations</p>
        </div>

        {isOwnProfile && (
          <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newProject.status}
                      onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="completed">Completed</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your role and the project..."
                    className="rounded-2xl min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) => setNewProject(prev => ({ ...prev, start_date: e.target.value }))}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newProject.end_date}
                      onChange={(e) => setNewProject(prev => ({ ...prev, end_date: e.target.value }))}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Project Links</Label>
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
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        placeholder="https://..."
                        className="rounded-2xl flex-1"
                      />
                      {newProject.links.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeLink(index)}
                          className="rounded-2xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingProject(false)} className="rounded-2xl">
                    Cancel
                  </Button>
                  <Button onClick={addProject} className="rounded-2xl" disabled={!newProject.title || !newProject.description}>
                    Add Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="rounded-2xl shadow-sm p-6 bg-white border-gray-200">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Project Media */}
                {project.media_url && (
                  <div className="w-full md:w-48 flex-shrink-0">
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={project.media_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* Project Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={`rounded-full text-xs ${getStatusColor(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600 gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(project.start_date)} - {formatDate(project.end_date)}
                        </div>
                      </div>
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

                  <p className="text-gray-700 leading-relaxed">{project.description}</p>

                  {project.links.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Project Links:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline bg-primary/5 px-3 py-1 rounded-full border border-primary/20"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Project
                          </a>
                        ))}
                      </div>
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
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects added yet</h3>
          <p className="text-gray-600 mb-6">
            {isOwnProfile 
              ? 'Showcase your professional work by adding your past projects and collaborations.'
              : `This ${profile.role} hasn't added any projects yet.`
            }
          </p>
          {isOwnProfile && (
            <Button className="rounded-2xl" onClick={() => setIsAddingProject(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}