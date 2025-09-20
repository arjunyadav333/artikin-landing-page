import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useCreateOpportunity } from "@/hooks/useOpportunities";
import { OpportunityImageUpload } from "./opportunity-image-upload";
import { useAuth } from "@/hooks/useAuth";

export function CreateOpportunityModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    city: "",
    state: "",
    salary_min: "",
    salary_max: "",
    type: "",
    tags: "",
    deadline: "",
    image_url: "",
    art_forms: [] as string[],
    experience_level: "",
    gender_preference: [] as string[],
    language_preference: [] as string[],
    organization_name: ""
  });

  const { user } = useAuth();

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

  // Get organization name from user profile
  useEffect(() => {
    console.log('Setting organization name from user:', user);
    if (user?.user_metadata?.full_name || user?.user_metadata?.display_name) {
      const orgName = user.user_metadata?.full_name || user.user_metadata?.display_name || "";
      console.log('Auto-populating organization_name with:', orgName);
      setFormData(prev => ({
        ...prev,
        organization_name: orgName
      }));
    }
  }, [user]);

  const createOpportunity = useCreateOpportunity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission - Raw form data:', formData);
    
    const opportunityData = {
      title: formData.title.trim(),
      company: formData.company?.trim() || null,
      description: formData.description.trim(),
      location: formData.location?.trim() || null,
      city: formData.city?.trim() || null,
      state: formData.state?.trim() || null,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
      type: formData.type,
      tags: formData.tags?.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : null,
      deadline: formData.deadline || null,
      image_url: formData.image_url?.trim() || null,
      art_forms: formData.art_forms.length > 0 ? formData.art_forms : null,
      experience_level: formData.experience_level || null,
      gender_preference: formData.gender_preference.length > 0 ? formData.gender_preference : null,
      language_preference: formData.language_preference.length > 0 ? formData.language_preference : null,
      organization_name: formData.organization_name?.trim() || null
    };

    // Validate critical fields
    console.log('Validation check:');
    console.log('- Title:', opportunityData.title ? '✓' : '✗ MISSING');
    console.log('- Description:', opportunityData.description ? '✓' : '✗ MISSING');
    console.log('- Type:', opportunityData.type ? '✓' : '✗ MISSING');
    console.log('- Organization name:', opportunityData.organization_name ? '✓' : '✗ MISSING');
    console.log('- Art forms:', opportunityData.art_forms ? '✓' : '✗ EMPTY');
    console.log('- Experience level:', opportunityData.experience_level ? '✓' : '✗ EMPTY');

    console.log('Form submission - Structured opportunity data being sent:', opportunityData);

    try {
      const result = await createOpportunity.mutateAsync(opportunityData);
      console.log('Form submission - Success result:', result);
      setOpen(false);
      setFormData({
        title: "",
        company: "",
        description: "",
        location: "",
        city: "",
        state: "",
        salary_min: "",
        salary_max: "",
        type: "",
        tags: "",
        deadline: "",
        image_url: "",
        art_forms: [],
        experience_level: "",
        gender_preference: [],
        language_preference: [],
        organization_name: user?.user_metadata?.full_name || user?.user_metadata?.display_name || ""
      });
    } catch (error) {
      console.error('Error creating opportunity:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Input change for ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, values: string[]) => {
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    console.log(`Toggling ${field} with item:`, item);
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i: string) => i !== item)
        : [...currentArray, item];
      console.log(`Updated ${field}:`, newArray);
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 mb-6">
          <Plus className="h-5 w-5 mr-3" />
          Post New Job Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Job Opportunity</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <OpportunityImageUpload
            value={formData.image_url}
            onChange={(url) => handleInputChange('image_url', url || '')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Lead Actor for Theater Production"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="organization_name">Organization Name *</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => handleInputChange('organization_name', e.target.value)}
                placeholder="Your organization name"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the opportunity, requirements, and what you're looking for..."
              className="min-h-[120px]"
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
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. Remote or New York, NY"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g. New York"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="e.g. NY"
              />
            </div>
          </div>

          {/* Art Forms */}
          <div>
            <Label>Art Forms *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {artFormOptions.map((artForm) => (
                <div key={artForm} className="flex items-center space-x-2">
                  <Checkbox
                    id={artForm}
                    checked={formData.art_forms.includes(artForm)}
                    onCheckedChange={() => toggleArrayItem('art_forms', artForm)}
                  />
                  <Label htmlFor={artForm} className="text-sm font-normal">
                    {artForm}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
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
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
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
                      id={gender}
                      checked={formData.gender_preference.includes(gender)}
                      onCheckedChange={() => toggleArrayItem('gender_preference', gender)}
                    />
                    <Label htmlFor={gender} className="text-sm font-normal">
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
                      id={language}
                      checked={formData.language_preference.includes(language)}
                      onCheckedChange={() => toggleArrayItem('language_preference', language)}
                    />
                    <Label htmlFor={language} className="text-sm font-normal">
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compensation & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salary_min">Min Compensation ($)</Label>
              <Input
                id="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={(e) => handleInputChange('salary_min', e.target.value)}
                placeholder="1000"
              />
            </div>
            
            <div>
              <Label htmlFor="salary_max">Max Compensation ($)</Label>
              <Input
                id="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={(e) => handleInputChange('salary_max', e.target.value)}
                placeholder="5000"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Additional Skills/Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Improvisation, Stage Combat, Classical Training (comma-separated)"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createOpportunity.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createOpportunity.isPending ? "Posting..." : "Post Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}