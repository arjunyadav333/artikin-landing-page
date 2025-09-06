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
      <DialogOverlay className="bg-black/60 backdrop-blur-md" />
      <DialogContent className={`
        ${isMobile 
          ? 'fixed bottom-0 left-0 right-0 top-12 rounded-t-3xl border-t animate-slide-in-from-bottom data-[state=closed]:animate-slide-out-to-bottom' 
          : 'max-w-4xl max-h-[95vh] animate-scale-in rounded-2xl'
        } p-0 gap-0 overflow-hidden flex flex-col bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50 shadow-2xl border-0
      `}>
        {/* Modern Header with gradient */}
        <div className="flex-shrink-0 p-8 pb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          
          <div className="flex items-center gap-4 relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 text-white border-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {isEditMode ? '✏️ Edit Job Opportunity' : '✨ Create New Job Opportunity'}
              </h2>
              <p className="text-blue-100/90 text-sm">
                {isEditMode ? 'Update your opportunity details and reach more talent' : 'Post a new opportunity for artists to discover and apply to'}
              </p>
            </div>
          </div>
        </div>

        {/* Modern Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950/50">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Basic Information Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about your opportunity</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Opportunity Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span>
                    Opportunity Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Lead Dancer for Music Video"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`h-12 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl transition-all duration-200 ${
                      errors.title 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300'
                    }`}
                  />
                  {errors.title && <p className="text-sm text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.title}</p>}
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></span>
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Your organization name"
                      value={formData.organization_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                      className={`h-12 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl pl-12 transition-all duration-200 ${
                        errors.organization_name 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.organization_name && <p className="text-sm text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.organization_name}</p>}
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="e.g., Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="h-12 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl pl-12 focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></span>
                      State
                    </label>
                    <Input
                      placeholder="e.g., Maharashtra"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="h-12 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🎨</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Requirements & Preferences</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Define what you're looking for</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Art Forms */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></span>
                    Art Forms <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs">(Select multiple)</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={`w-full h-12 justify-between text-left font-normal text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:bg-white/70 hover:border-gray-300 transition-all duration-200 ${
                          formData.art_forms.length === 0 ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                        } ${errors.art_forms ? 'border-red-300' : ''}`}
                      >
                        {formData.art_forms.length > 0
                          ? formData.art_forms.join(', ')
                          : "Select art forms"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-xl" align="start">
                      <Command className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl">
                        <CommandInput 
                          placeholder="Search art forms..." 
                          className="h-12 text-sm border-0 border-b-2 border-gray-100 dark:border-gray-800 rounded-none bg-transparent"
                        />
                        <CommandEmpty className="py-4 text-sm text-gray-500">No art form found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto p-2">
                          {artFormOptions.map((artForm) => (
                            <CommandItem
                              key={artForm}
                              onSelect={() => handleMultiSelect('art_forms', artForm)}
                              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-lg transition-all duration-200 border-0"
                            >
                              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                                formData.art_forms.includes(artForm) 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent shadow-lg' 
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}>
                                {formData.art_forms.includes(artForm) && (
                                  <div className="w-2 h-2 bg-white rounded-sm" />
                                )}
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">{artForm}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.art_forms && <p className="text-sm text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.art_forms}</p>}
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
                    Experience Level
                  </label>
                  <Select value={formData.experience_level} onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}>
                    <SelectTrigger className="h-12 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200">
                      <SelectValue placeholder="Select experience level" className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                      {experienceLevels.map(level => (
                        <SelectItem key={level} value={level} className="text-sm py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-lg m-1">{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender & Language Preferences */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gender Preference */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span>
                      Gender Preference <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className={`w-full h-12 justify-between text-left font-normal text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:bg-white/70 hover:border-gray-300 transition-all duration-200 ${
                            formData.gender_preference.length === 0 ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {formData.gender_preference.length > 0
                            ? formData.gender_preference.join(', ')
                            : "Select gender preference"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-xl" align="start">
                        <Command className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl">
                          <CommandGroup className="p-2">
                            {genderOptions.map((gender) => (
                              <CommandItem
                                key={gender}
                                onSelect={() => handleMultiSelect('gender_preference', gender)}
                                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20 rounded-lg transition-all duration-200"
                              >
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                                  formData.gender_preference.includes(gender) 
                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-transparent shadow-lg' 
                                    : 'border-gray-300 hover:border-pink-400'
                                }`}>
                                  {formData.gender_preference.includes(gender) && (
                                    <div className="w-2 h-2 bg-white rounded-sm" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{gender}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Language Preference */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
                      Language Preference <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className={`w-full h-12 justify-between text-left font-normal text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:bg-white/70 hover:border-gray-300 transition-all duration-200 ${
                            formData.language_preference.length === 0 ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {formData.language_preference.length > 0
                            ? formData.language_preference.join(', ')
                            : "Select language preferences"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-xl" align="start">
                        <Command className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl">
                          <CommandInput 
                            placeholder="Search languages..." 
                            className="h-12 text-sm border-0 border-b-2 border-gray-100 dark:border-gray-800 rounded-none bg-transparent"
                          />
                          <CommandEmpty className="py-4 text-sm text-gray-500">No language found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto p-2">
                            {languageOptions.map((language) => (
                              <CommandItem
                                key={language}
                                onSelect={() => handleMultiSelect('language_preference', language)}
                                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20 rounded-lg transition-all duration-200"
                              >
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                                  formData.language_preference.includes(language) 
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 border-transparent shadow-lg' 
                                    : 'border-gray-300 hover:border-indigo-400'
                                }`}>
                                  {formData.language_preference.includes(language) && (
                                    <div className="w-2 h-2 bg-white rounded-sm" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{language}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opportunity Details</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Timeline and additional information</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Application Deadline */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></span>
                    Application Deadline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className={`h-12 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl pl-12 transition-all duration-200 ${
                        errors.deadline 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300'
                      }`}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  {errors.deadline && <p className="text-sm text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.deadline}</p>}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></span>
                    Image for Opportunity <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300/60 dark:border-gray-600/60 rounded-2xl p-8 text-center bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm hover:border-blue-400/60 transition-all duration-200">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto max-h-40 rounded-xl object-cover border-2 border-gray-200/60 dark:border-gray-700/60 shadow-lg"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={removeImage}
                          className="text-sm border-2 border-gray-300/60 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                          <Upload className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Drag and drop an image here, or click to select
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG or WEBP up to 10MB
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer text-sm border-2 border-gray-300/60 rounded-lg mt-3 hover:border-blue-400 transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`min-h-32 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl resize-none transition-all duration-200 ${
                      errors.description 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300'
                    }`}
                    maxLength={2000}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {errors.description && <span className="text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.description}</span>}
                    </span>
                    <span className={`font-medium ${formData.description.length > 1800 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formData.description.length}/2000
                    </span>
                  </div>
                </div>

                {/* Status field only shown in edit mode */}
                {isEditMode && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
                      Status
                    </label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="h-12 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                        <SelectItem value="active" className="text-sm py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 rounded-lg m-1">Active</SelectItem>
                        <SelectItem value="closed" className="text-sm py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 rounded-lg m-1">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Add some bottom padding for mobile scrolling */}
            <div className="h-24 md:h-0"></div>
          </form>
        </div>

        {/* Modern Fixed Footer Buttons */}
        <div className="flex-shrink-0 p-8 pt-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
          <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'justify-end'}`}>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={uploading}
              className={`h-12 text-sm font-semibold border-2 border-gray-300/60 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ${isMobile ? 'w-full' : 'px-8'}`}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading || !isFormValid}
              className={`h-12 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'w-full' : 'px-8'}`}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">{isEditMode ? '💾' : '🚀'}</span>
                  {isEditMode ? 'Save Changes' : 'Post Opportunity'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};