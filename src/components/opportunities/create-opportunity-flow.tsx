import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, ChevronDown, MapPin, Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { useCreateOpportunity } from '@/hooks/useOpportunities';
import { useEditOpportunity, EditOpportunityData } from '@/hooks/useEditOpportunity';
import { useCurrentUserProfile } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface CreateOpportunityFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editOpportunity?: any; // For edit mode
}

const artFormOptions = [
  'Actor', 'Dancer', 'Model', 'Photographer', 'Videographer', 
  'Instrumentalist', 'Singer', 'Drawing', 'Painting'
];

const experienceLevels = [
  '0-1 years', '1-3 years', '3-5 years', '5-7 years', '7-10 years', '10+ years'
];

const genderOptions = ['Male', 'Female', 'Others'];

const languageOptions = [
  'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 'Malayalam', 
  'Punjabi', 'Marathi', 'Spanish', 'Japanese'
];

export const CreateOpportunityFlow: React.FC<CreateOpportunityFlowProps> = ({
  open,
  onOpenChange,
  editOpportunity
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { data: profile } = useCurrentUserProfile();
  const createOpportunity = useCreateOpportunity();
  const editOpportunityMutation = useEditOpportunity();

  const isEditMode = !!editOpportunity;

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
    status: 'active',
    image: null as File | null,
    existing_image_url: ''
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  // Populate form data when editing
  useEffect(() => {
    if (editOpportunity && open) {
      setFormData({
        title: editOpportunity.title || '',
        organization_name: editOpportunity.organization_name || profile?.display_name || '',
        city: editOpportunity.city || '',
        state: editOpportunity.state || '',
        art_forms: editOpportunity.art_forms || [],
        experience_level: editOpportunity.experience_level || '',
        gender_preference: editOpportunity.gender_preference || [],
        language_preference: editOpportunity.language_preference || [],
        deadline: editOpportunity.deadline ? new Date(editOpportunity.deadline).toISOString().slice(0, 16) : '',
        description: editOpportunity.description || '',
        status: editOpportunity.status || 'active',
        image: null,
        existing_image_url: editOpportunity.image_url || ''
      });
      setImagePreview(editOpportunity.image_url || '');
    } else if (!editOpportunity && open) {
      // Reset for create mode
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
        status: 'active',
        image: null,
        existing_image_url: ''
      });
      setImagePreview('');
    }
  }, [editOpportunity, open, profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Opportunity title is required';
    if (!formData.organization_name.trim()) newErrors.organization_name = 'Organization name is required';
    if (formData.art_forms.length === 0) newErrors.art_forms = 'At least one art form is required';
    if (!formData.deadline) {
      newErrors.deadline = 'Application deadline is required';
    } else if (!isEditMode) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 2000) newErrors.description = 'Description must be 2000 characters or less';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      let imageUrl = formData.existing_image_url;
      
      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('opportunities')
          .upload(fileName, formData.image);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('opportunities')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      if (isEditMode) {
        // Edit existing opportunity
        const editData: EditOpportunityData = {
          title: formData.title,
          company: formData.organization_name,
          description: formData.description,
          type: formData.art_forms[0] || '', 
          location: formData.city && formData.state ? `${formData.city}, ${formData.state}` : formData.city || formData.state || undefined,
          deadline: formData.deadline,
          tags: formData.art_forms,
          status: formData.status
        };

        await editOpportunityMutation.mutateAsync({
          opportunityId: editOpportunity.id,
          data: editData
        });
      } else {
        // Create new opportunity
        await createOpportunity.mutateAsync({
          title: formData.title,
          company: formData.organization_name,
          description: formData.description,
          type: formData.art_forms[0] || '', 
          location: formData.city && formData.state ? `${formData.city}, ${formData.state}` : formData.city || formData.state || undefined,
          deadline: formData.deadline,
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
      }

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: isEditMode ? "Failed to update opportunity" : "Failed to create opportunity",
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
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null, existing_image_url: '' }));
    setImagePreview('');
  };

  const isFormValid = formData.title.trim() && 
                     formData.organization_name.trim() && 
                     formData.art_forms.length > 0 && 
                     formData.deadline && 
                     formData.description.trim() &&
                     formData.description.length <= 2000;

  // Mobile and Desktop modal using Dialog with responsive behavior
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/40" />
      <DialogContent className={`
        ${isMobile 
          ? 'fixed bottom-0 left-0 right-0 top-10 rounded-t-xl animate-slide-in-right transform-gpu data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom' 
          : 'max-w-2xl animate-scale-in'
        } max-h-[85vh] p-0 gap-0
      `}>
        {/* Header */}
        <div className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {isEditMode ? 'Edit Opportunity' : 'Create New Job Opportunity'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditMode ? 'Update your opportunity details' : 'Post a new opportunity for artists to discover and apply to'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {isMobile ? <ArrowLeft className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opportunity Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Opportunity Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., Lead Dancer for Music Video"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Organization Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Your organization name"
                  value={formData.organization_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                  className={`pl-10 ${errors.organization_name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.organization_name && <p className="text-sm text-destructive">{errors.organization_name}</p>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  placeholder="e.g., Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>

            {/* Art Forms */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Art Forms <span className="text-destructive">*</span> <span className="text-muted-foreground">(Select multiple)</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={`w-full justify-between text-left font-normal ${
                      formData.art_forms.length === 0 ? 'text-muted-foreground' : ''
                    } ${errors.art_forms ? 'border-destructive' : ''}`}
                  >
                    {formData.art_forms.length > 0
                      ? formData.art_forms.join(', ')
                      : "Select art forms"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search art forms..." />
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
                              <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
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

            {/* Experience Level & Gender Preference */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Level</label>
                <Select value={formData.experience_level} onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender Preference</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={`w-full justify-between text-left font-normal ${
                        formData.gender_preference.length === 0 ? 'text-muted-foreground' : ''
                      }`}
                    >
                      {formData.gender_preference.length > 0
                        ? formData.gender_preference.join(', ')
                        : "Select gender"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
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
                                <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
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
            </div>

            {/* Language Preference */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Language Preference <span className="text-muted-foreground">(Select multiple)</span></label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={`w-full justify-between text-left font-normal ${
                      formData.language_preference.length === 0 ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {formData.language_preference.length > 0
                      ? formData.language_preference.join(', ')
                      : "Select languages"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search languages..." />
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-auto">
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
                              <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
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
              <label className="text-sm font-medium">
                Application Deadline <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className={`pr-10 ${errors.deadline ? 'border-destructive' : ''}`}
                  min={isEditMode ? undefined : new Date().toISOString().slice(0, 16)}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Opportunity Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`resize-none ${errors.description ? 'border-destructive' : ''}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.description && <span className="text-destructive">{errors.description}</span>}</span>
                <span className={formData.description.length > 2000 ? 'text-destructive' : ''}>
                  {formData.description.length}/2000
                </span>
              </div>
            </div>

            {/* Status (Edit mode only) */}
            {isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form>
        </div>

        {/* Footer Buttons */}
        <div className={`p-6 pt-4 border-t ${isMobile ? 'pb-6' : ''}`}>
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'justify-end'}`}>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={uploading}
              className={isMobile ? 'w-full' : ''}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading || !isFormValid}
              className={isMobile ? 'w-full' : ''}
            >
              {uploading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Post Opportunity')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};