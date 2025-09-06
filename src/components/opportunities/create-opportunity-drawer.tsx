import React, { useState } from 'react';
import { Upload, Calendar, ChevronDown, MapPin, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateOpportunity } from '@/hooks/useOpportunities';
import { useCurrentUserProfile } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateOpportunityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const artFormOptions = [
  'Acting', 'Dance', 'Singing', 'Music', 'Photography', 'Modeling', 
  'Voice Acting', 'Videography', 'Instrumentalist', 'Drawing', 'Painting'
];

const experienceLevels = [
  '0-1 years', '1-3 years', '3-5 years', '5-7 years', '7-10 years', '10+ years'
];

const genderOptions = ['Male', 'Female', 'Others'];

const languageOptions = [
  'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 'Malayalam', 
  'Punjabi', 'Marathi', 'Spanish', 'Japanese'
];

export const CreateOpportunityDrawer: React.FC<CreateOpportunityDrawerProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const { data: profile } = useCurrentUserProfile();
  const createOpportunity = useCreateOpportunity();

  const [formData, setFormData] = useState({
    title: '',
    organization_name: profile?.display_name || '',
    city: '',
    state: '',
    art_forms: [] as string[],
    experience_level: '',
    gender_preference: [] as string[],
    language_preference: [] as string[],
    deadline: '',
    description: '',
    image: null as File | null
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Opportunity title is required';
    if (!formData.organization_name.trim()) newErrors.organization_name = 'Organization name is required';
    if (formData.art_forms.length === 0) newErrors.art_forms = 'At least one art form is required';
    if (!formData.deadline) {
      newErrors.deadline = 'Application deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('opportunities')
          .upload(fileName, formData.image);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('opportunities')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      // Create opportunity
      await createOpportunity.mutateAsync({
        title: formData.title,
        company: formData.organization_name,
        description: formData.description,
        type: formData.art_forms[0], // Use first art form as primary type
        location: formData.city && formData.state ? `${formData.city}, ${formData.state}` : formData.city || formData.state || null,
        deadline: formData.deadline, // Keep as datetime-local format which will be converted in the hook
        tags: formData.art_forms,
        organization_name: formData.organization_name,
        city: formData.city,
        state: formData.state,
        art_forms: formData.art_forms,
        experience_level: formData.experience_level,
        gender_preference: formData.gender_preference,
        language_preference: formData.language_preference,
        image_url: imageUrl
      });

      // Reset form and close drawer
      setFormData({
        title: '',
        organization_name: profile?.display_name || '',
        city: '',
        state: '',
        art_forms: [],
        experience_level: '',
        gender_preference: [],
        language_preference: [],
        deadline: '',
        description: '',
        image: null
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to create opportunity",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleMultiSelect = (field: 'art_forms' | 'gender_preference' | 'language_preference', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const FormContent = () => (
    <div className="p-4">
      <div className="space-y-6">
        {/* Opportunity Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Opportunity Title *
          </label>
          <Input
            placeholder="e.g., Lead Dancer for Music Video"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`${errors.title ? 'border-destructive' : ''} bg-muted/30 border-0 h-12`}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Organization Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Organization Name *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Your organization name"
              value={formData.organization_name}
              onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
              className={`${errors.organization_name ? 'border-destructive' : ''} bg-muted/30 border-0 h-12 pl-10`}
            />
          </div>
          {errors.organization_name && <p className="text-sm text-destructive">{errors.organization_name}</p>}
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g., Mumbai"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="bg-muted/30 border-0 h-12 pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">State</label>
            <Input
              placeholder="e.g., Maharashtra"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              className="bg-muted/30 border-0 h-12"
            />
          </div>
        </div>

        {/* Art Forms */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Art Forms * (Select multiple)
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={`w-full justify-between h-12 bg-muted/30 border-0 text-left font-normal ${
                  formData.art_forms.length === 0 ? 'text-muted-foreground' : ''
                } ${errors.art_forms ? 'border-destructive' : ''}`}
              >
                {formData.art_forms.length > 0
                  ? formData.art_forms.join(', ')
                  : "Select art forms"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-background border" align="start">
              <Command>
                <CommandInput placeholder="Search art forms..." className="h-9" />
                <CommandEmpty>No art form found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {artFormOptions.map((artForm) => (
                    <CommandItem
                      key={artForm}
                      onSelect={() => handleMultiSelect('art_forms', artForm)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        formData.art_forms.includes(artForm) 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {formData.art_forms.includes(artForm) && (
                          <div className="w-2 h-2 bg-white rounded-sm" />
                        )}
                      </div>
                      <span>{artForm}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.art_forms && <p className="text-sm text-destructive">{errors.art_forms}</p>}
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Experience Level</label>
          <Select value={formData.experience_level} onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}>
            <SelectTrigger className="h-12 bg-muted/30 border-0">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender Preference */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Gender Preference (Select multiple)</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={`w-full justify-between h-12 bg-muted/30 border-0 text-left font-normal ${
                  formData.gender_preference.length === 0 ? 'text-muted-foreground' : ''
                }`}
              >
                {formData.gender_preference.length > 0
                  ? formData.gender_preference.join(', ')
                  : "Select gender preference"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-background border" align="start">
              <Command>
                <CommandEmpty>No gender option found.</CommandEmpty>
                <CommandGroup>
                  {genderOptions.map((gender) => (
                    <CommandItem
                      key={gender}
                      onSelect={() => handleMultiSelect('gender_preference', gender)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        formData.gender_preference.includes(gender) 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {formData.gender_preference.includes(gender) && (
                          <div className="w-2 h-2 bg-white rounded-sm" />
                        )}
                      </div>
                      <span>{gender}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Language Preference */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Language Preference (Select multiple)</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={`w-full justify-between h-12 bg-muted/30 border-0 text-left font-normal ${
                  formData.language_preference.length === 0 ? 'text-muted-foreground' : ''
                }`}
              >
                {formData.language_preference.length > 0
                  ? formData.language_preference.join(', ')
                  : "Select languages"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-background border" align="start">
              <Command>
                <CommandInput placeholder="Search languages..." className="h-9" />
                <CommandEmpty>No language found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {languageOptions.map((language) => (
                    <CommandItem
                      key={language}
                      onSelect={() => handleMultiSelect('language_preference', language)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        formData.language_preference.includes(language) 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {formData.language_preference.includes(language) && (
                          <div className="w-2 h-2 bg-white rounded-sm" />
                        )}
                      </div>
                      <span>{language}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Application Deadline */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Application Deadline *
          </label>
          <div className="relative">
            <Input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className={`${errors.deadline ? 'border-destructive' : ''} bg-muted/30 border-0 h-12 pr-10`}
              min={new Date().toISOString().slice(0, 16)}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Opportunity Image</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-muted/10">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="flex flex-col items-center cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                {formData.image ? formData.image.name : "Click to upload an image"}
              </p>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Description *
          </label>
          <Textarea
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={`${errors.description ? 'border-destructive' : ''} bg-muted/30 border-0 resize-none`}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="p-4 pt-2">
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="flex-1"
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="flex-1"
          disabled={uploading}
        >
          {uploading ? 'Creating...' : 'Post Opportunity'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Create New Job Opportunity</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Post a new opportunity for artists to discover and apply to.
          </p>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <FormContent />
        </div>
        <ActionButtons />
      </DialogContent>
    </Dialog>
  );
};