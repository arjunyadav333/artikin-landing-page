import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useEditOpportunity, EditOpportunityData } from '@/hooks/useEditOpportunity';
import { Opportunity } from '@/hooks/useOpportunities';
import { OpportunityImageUpload } from './opportunity-image-upload';

interface EditOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
}

export const EditOpportunityModal: React.FC<EditOpportunityModalProps> = ({
  isOpen,
  onClose,
  opportunity
}) => {
  const [formData, setFormData] = useState<EditOpportunityData>({
    title: '',
    company: '',
    description: '',
    type: '',
    location: '',
    city: '',
    state: '',
    salary_min: undefined,
    salary_max: undefined,
    deadline: '',
    tags: [],
    status: 'active',
    image_url: '',
    art_forms: [],
    experience_level: '',
    gender_preference: [],
    language_preference: [],
    organization_name: ''
  });

  // Art form options
  const artFormOptions = [
    "Acting", "Dance", "Music", "Visual Arts", "Theater", "Film", "Photography", 
    "Writing", "Fashion", "Digital Art", "Performance Art", "Voice Acting"
  ];

  // Experience level options
  const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Professional", "Any"];

  // Gender preference options
  const genderOptions = ["Male", "Female", "Non-binary", "Any"];

  // Language options
  const languageOptions = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Russian"
  ];

  const editOpportunity = useEditOpportunity();

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        company: opportunity.company || '',
        description: opportunity.description || '',
        type: opportunity.type || '',
        location: opportunity.location || '',
        city: opportunity.city || '',
        state: opportunity.state || '',
        salary_min: opportunity.salary_min || undefined,
        salary_max: opportunity.salary_max || undefined,
        deadline: opportunity.deadline ? new Date(opportunity.deadline).toISOString().split('T')[0] : '',
        tags: opportunity.tags || [],
        status: opportunity.status || 'active',
        image_url: opportunity.image_url || '',
        art_forms: opportunity.art_forms || [],
        experience_level: opportunity.experience_level || '',
        gender_preference: opportunity.gender_preference || [],
        language_preference: opportunity.language_preference || [],
        organization_name: opportunity.organization_name || ''
      });
    }
  }, [opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await editOpportunity.mutateAsync({
      opportunityId: opportunity.id,
      data: formData
    });
    
    onClose();
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => {
      const currentField = prev[field as keyof typeof prev];
      const currentArray = Array.isArray(currentField) ? currentField : [];
      
      return {
        ...prev,
        [field]: currentArray.includes(item)
          ? currentArray.filter((i: string) => i !== item)
          : [...currentArray, item]
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Opportunity</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <OpportunityImageUpload
            value={formData.image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Opportunity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="organization_name">Organization Name *</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="location">Location (General)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Remote or New York, NY"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="e.g. New York"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="e.g. NY"
              />
            </div>
          </div>

          {/* Art Forms */}
          <div>
            <Label>Art Forms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {artFormOptions.map((artForm) => (
                <div key={artForm} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${artForm}`}
                    checked={formData.art_forms?.includes(artForm) || false}
                    onCheckedChange={() => toggleArrayItem('art_forms', artForm)}
                  />
                  <Label htmlFor={`edit-${artForm}`} className="text-sm font-normal">
                    {artForm}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level & Opportunity Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select 
                value={formData.experience_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Opportunity Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select opportunity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Project-based">Project-based</SelectItem>
                  <SelectItem value="Audition">Audition</SelectItem>
                  <SelectItem value="Gig">One-time Gig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gender & Language Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Gender Preference</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {genderOptions.map((gender) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-gender-${gender}`}
                      checked={formData.gender_preference?.includes(gender) || false}
                      onCheckedChange={() => toggleArrayItem('gender_preference', gender)}
                    />
                    <Label htmlFor={`edit-gender-${gender}`} className="text-sm font-normal">
                      {gender}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Language Preferences</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                {languageOptions.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-lang-${language}`}
                      checked={formData.language_preference?.includes(language) || false}
                      onCheckedChange={() => toggleArrayItem('language_preference', language)}
                    />
                    <Label htmlFor={`edit-lang-${language}`} className="text-sm font-normal">
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compensation, Deadline & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salary_min">Min Compensation ($)</Label>
              <Input
                id="salary_min"
                type="number"
                value={formData.salary_min || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  salary_min: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="salary_max">Max Compensation ($)</Label>
              <Input
                id="salary_max"
                type="number"
                value={formData.salary_max || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  salary_max: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Additional Skills/Tags</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Improvisation, Stage Combat, Classical Training"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={editOpportunity.isPending}>
              {editOpportunity.isPending ? 'Updating...' : 'Update Opportunity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};