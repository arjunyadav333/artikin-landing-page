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

  // Slide-up panel for mobile, centered modal for desktop
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
      <DialogContent className={`
        ${isMobile 
          ? 'fixed bottom-0 left-0 right-0 top-16 rounded-t-2xl border-t animate-slide-in-from-bottom data-[state=closed]:animate-slide-out-to-bottom' 
          : 'max-w-3xl max-h-[90vh] animate-scale-in'
        } p-0 gap-0 overflow-hidden flex flex-col
      `}>
        {/* Header - Slide-up panel style */}
        <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {isEditMode ? 'Edit Job Opportunity' : 'Create New Job Opportunity'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditMode ? 'Update your opportunity details' : 'Post a new opportunity for artists to discover and apply to'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Opportunity Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Opportunity Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., Lead Dancer for Music Video"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`h-11 text-sm bg-background border-gray-300 rounded-md ${errors.title ? 'border-destructive' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Organization Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Your organization name"
                  value={formData.organization_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                  className={`h-11 text-sm bg-background border-gray-300 rounded-md pl-10 ${errors.organization_name ? 'border-destructive' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                />
              </div>
              {errors.organization_name && <p className="text-sm text-destructive">{errors.organization_name}</p>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="e.g., Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="h-11 text-sm bg-background border-gray-300 rounded-md pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State</label>
                <Input
                  placeholder="e.g., Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="h-11 text-sm bg-background border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Art Forms */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Art Forms <span className="text-destructive">*</span> <span className="text-gray-500 font-normal">(Select multiple)</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={`w-full h-11 justify-between text-left font-normal text-sm bg-background border-gray-300 rounded-md hover:bg-background ${
                      formData.art_forms.length === 0 ? 'text-gray-500' : 'text-foreground'
                    } ${errors.art_forms ? 'border-destructive' : 'focus:border-blue-500'}`}
                  >
                    {formData.art_forms.length > 0
                      ? formData.art_forms.join(', ')
                      : "Select art forms"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-gray-300" align="start">
                  <Command className="bg-background">
                    <CommandInput 
                      placeholder="Search art forms..." 
                      className="h-10 text-sm border-0 border-b border-gray-200 rounded-none"
                    />
                    <CommandEmpty className="py-3 text-sm text-gray-500">No art form found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto p-0">
                      {artFormOptions.map((artForm) => (
                        <CommandItem
                          key={artForm}
                          onSelect={() => handleMultiSelect('art_forms', artForm)}
                          className="flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50 border-0"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 ${
                            formData.art_forms.includes(artForm) 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-400'
                          }`}>
                            {formData.art_forms.includes(artForm) && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                          <span className="text-sm text-foreground">{artForm}</span>
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
              <label className="text-sm font-medium text-foreground">Experience Level</label>
              <Select value={formData.experience_level} onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}>
                <SelectTrigger className="h-11 text-sm bg-background border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Select experience level" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="border-gray-300">
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level} className="text-sm py-2 hover:bg-blue-50">{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Preference */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Gender Preference <span className="text-gray-500 font-normal">(Select multiple)</span></label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={`w-full h-11 justify-between text-left font-normal text-sm bg-background border-gray-300 rounded-md hover:bg-background ${
                      formData.gender_preference.length === 0 ? 'text-gray-500' : 'text-foreground'
                    } focus:border-blue-500`}
                  >
                    {formData.gender_preference.length > 0
                      ? formData.gender_preference.join(', ')
                      : "Select gender preference"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-gray-300" align="start">
                  <Command className="bg-background">
                    <CommandGroup className="p-0">
                      {genderOptions.map((gender) => (
                        <CommandItem
                          key={gender}
                          onSelect={() => handleMultiSelect('gender_preference', gender)}
                          className="flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 ${
                            formData.gender_preference.includes(gender) 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-400'
                          }`}>
                            {formData.gender_preference.includes(gender) && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                          <span className="text-sm text-foreground">{gender}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Language Preference */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Language Preference <span className="text-gray-500 font-normal">(Select multiple)</span></label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={`w-full h-11 justify-between text-left font-normal text-sm bg-background border-gray-300 rounded-md hover:bg-background ${
                      formData.language_preference.length === 0 ? 'text-gray-500' : 'text-foreground'
                    } focus:border-blue-500`}
                  >
                    {formData.language_preference.length > 0
                      ? formData.language_preference.join(', ')
                      : "Select language preferences"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-gray-300" align="start">
                  <Command className="bg-background">
                    <CommandInput 
                      placeholder="Search languages..." 
                      className="h-10 text-sm border-0 border-b border-gray-200 rounded-none"
                    />
                    <CommandEmpty className="py-3 text-sm text-gray-500">No language found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto p-0">
                      {languageOptions.map((language) => (
                        <CommandItem
                          key={language}
                          onSelect={() => handleMultiSelect('language_preference', language)}
                          className="flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 ${
                            formData.language_preference.includes(language) 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-400'
                          }`}>
                            {formData.language_preference.includes(language) && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                          <span className="text-sm text-foreground">{language}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Application Deadline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Application Deadline <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className={`h-11 text-sm bg-background border-gray-300 rounded-md pl-10 ${errors.deadline ? 'border-destructive' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Image for Opportunity</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50/50">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto max-h-32 rounded-lg object-cover border border-gray-200"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={removeImage}
                      className="text-sm border-gray-300"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Drag and drop an image here, or click to select
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer text-sm border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`min-h-24 text-sm bg-background border-gray-300 rounded-md resize-none ${errors.description ? 'border-destructive' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                maxLength={2000}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{errors.description && <span className="text-destructive">{errors.description}</span>}</span>
                <span>{formData.description.length}/2000</span>
              </div>
            </div>

            {/* Status field only shown in edit mode */}
            {isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="h-11 text-sm bg-background border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300">
                    <SelectItem value="active" className="text-sm py-2">Active</SelectItem>
                    <SelectItem value="closed" className="text-sm py-2">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Add some bottom padding for mobile scrolling */}
            <div className="h-20 md:h-0"></div>
          </form>
        </div>

        {/* Fixed Footer Buttons */}
        <div className="flex-shrink-0 p-6 pt-4 border-t bg-background">
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'justify-end'}`}>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={uploading}
              className={`h-11 text-sm font-medium border-gray-300 ${isMobile ? 'w-full' : 'px-6'}`}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading || !isFormValid}
              className={`h-11 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'w-full' : 'px-6'}`}
            >
              {uploading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Post Opportunity')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};