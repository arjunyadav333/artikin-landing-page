import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  X,
  Plus,
  Upload,
  Calendar as CalendarIcon,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateOpportunity } from "@/hooks/useOpportunities";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(1, "Opportunity title is required"),
  company: z.string().min(1, "Organization name is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  artForms: z.array(z.string()).min(1, "Please select at least one art form"),
  experienceLevel: z.string().min(1, "Please select experience level"),
  genderPreference: z.array(z.string()).optional(),
  languagePreference: z.array(z.string()).optional(),
  deadline: z.date({ required_error: "Application deadline is required" }),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  image: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

const artFormOptions = [
  "actor", "dancer", "model", "photographer", "videographer", 
  "instrumentalist", "singer", "drawing", "painting"
];

const experienceLevels = [
  { value: "0-1", label: "0-1 years" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

const genderOptions = ["Male", "Female", "Others"];

const languageOptions = [
  "Telugu", "Hindi", "English", "Tamil", "Malayalam", "Kannada", "Marathi", "Punjabi"
];

interface ComprehensivePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ComprehensivePostModal({ open, onOpenChange, trigger }: ComprehensivePostModalProps) {
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  
  const createOpportunity = useCreateOpportunity();
  const { data: currentProfile } = useCurrentProfile();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: currentProfile?.display_name || "",
      city: "",
      state: "",
      artForms: [],
      experienceLevel: "",
      genderPreference: [],
      languagePreference: [],
      description: "",
    },
  });

  const watchedValues = form.watch();
  const isFormValid = form.formState.isValid;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        form.setError("image", { message: "Image must be less than 5MB" });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        form.setValue("image", file);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("image", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleArtFormToggle = (artForm: string, checked: boolean) => {
    const current = form.getValues("artForms");
    if (checked) {
      form.setValue("artForms", [...current, artForm]);
    } else {
      form.setValue("artForms", current.filter(form => form !== artForm));
    }
    setIsDirty(true);
  };

  const handleGenderToggle = (gender: string, checked: boolean) => {
    const current = form.getValues("genderPreference") || [];
    if (checked) {
      form.setValue("genderPreference", [...current, gender]);
    } else {
      form.setValue("genderPreference", current.filter(g => g !== gender));
    }
    setIsDirty(true);
  };

  const handleLanguageToggle = (language: string, checked: boolean) => {
    const current = form.getValues("languagePreference") || [];
    if (checked) {
      form.setValue("languagePreference", [...current, language]);
    } else {
      form.setValue("languagePreference", current.filter(l => l !== language));
    }
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false);
        resetForm();
      }
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    form.reset();
    setImagePreview(null);
    setIsDirty(false);
    setCharacterCount(0);
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Handle image upload if present
      let imageUrl = undefined;
      if (data.image) {
        const fileExt = data.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('opportunities')
          .upload(fileName, data.image);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image');
        }

        const { data: urlData } = supabase.storage
          .from('opportunities')
          .getPublicUrl(uploadData.path);

        imageUrl = urlData.publicUrl;
      }

      const opportunityData = {
        title: data.title,
        company: data.company,
        description: data.description,
        location: data.city && data.state ? `${data.city}, ${data.state}` : data.city || data.state || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        type: "Full-time", // Default type
        tags: data.artForms,
        deadline: data.deadline.toISOString(),
        art_forms: data.artForms || [],
        experience_level: data.experienceLevel || undefined,
        gender_preference: data.genderPreference || [],
        language_preference: data.languagePreference || [],
        image_url: imageUrl,
        organization_name: data.company || undefined,
      };

      await createOpportunity.mutateAsync(opportunityData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating opportunity:", error);
    }
  };

  const modalContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={cn("flex items-center justify-between border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10", 
        isMobile ? "p-4" : "p-6")}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className={cn("font-semibold text-foreground", isMobile ? "text-lg" : "text-xl")}>
              Post New Job Opportunity
            </h2>
            <p className="text-sm text-muted-foreground">Fill in the details below</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="p-2 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className={cn("flex-1 overflow-y-auto scroll-smooth", isMobile ? "p-4" : "p-6")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className={cn("p-6 space-y-6", isMobile && "p-4 space-y-4")}>
              {/* Opportunity Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Opportunity Title *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. Lead Actor for Feature Film"
                        className="h-12 text-base border-border/50 focus:border-primary"
                        autoFocus={!isMobile}
                        onChange={(e) => {
                          field.onChange(e);
                          setIsDirty(true);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organization Name */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Organization Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Your organization name"
                        className="h-12 text-base border-border/50 focus:border-primary"
                        onChange={(e) => {
                          field.onChange(e);
                          setIsDirty(true);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">City</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. Mumbai"
                          className="h-12 text-base border-border/50 focus:border-primary"
                          onChange={(e) => {
                            field.onChange(e);
                            setIsDirty(true);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">State</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. Maharashtra"
                          className="h-12 text-base border-border/50 focus:border-primary"
                          onChange={(e) => {
                            field.onChange(e);
                            setIsDirty(true);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Art Forms */}
              <FormField
                control={form.control}
                name="artForms"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Art Forms *</FormLabel>
                    <p className="text-xs text-muted-foreground">Can select multiple artforms </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-between text-left font-normal border-border/50 focus:border-primary"
                        >
                          <span className="truncate">
                            {watchedValues.artForms?.length > 0
                              ? `${watchedValues.artForms.length} art form${watchedValues.artForms.length > 1 ? 's' : ''} selected`
                              : "Select art forms"
                            }
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-80 max-h-60 overflow-y-auto">
                        {artFormOptions.map((artForm) => {
                          const isSelected = watchedValues.artForms?.includes(artForm);
                          return (
                            <DropdownMenuCheckboxItem
                              key={artForm}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleArtFormToggle(artForm, checked)}
                            >
                              {artForm}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {watchedValues.artForms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {watchedValues.artForms.map((artForm) => (
                          <Badge key={artForm} variant="secondary" className="text-xs">
                            {artForm}
                            <X 
                              className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                              onClick={() => handleArtFormToggle(artForm, false)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience Level */}
              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Experience Level *</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setIsDirty(true);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-border/50 focus:border-primary">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender Preference */}
              <FormField
                control={form.control}
                name="genderPreference"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Gender Preference</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-between text-left font-normal border-border/50 focus:border-primary"
                        >
                          <span className="truncate">
                            {watchedValues.genderPreference?.length > 0
                              ? `${watchedValues.genderPreference.length} gender${watchedValues.genderPreference.length > 1 ? 's' : ''} selected`
                              : "Select gender preference (optional)"
                            }
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        {genderOptions.map((gender) => {
                          const isSelected = watchedValues.genderPreference?.includes(gender);
                          return (
                            <DropdownMenuCheckboxItem
                              key={gender}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleGenderToggle(gender, checked)}
                            >
                              {gender}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {watchedValues.genderPreference?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {watchedValues.genderPreference.map((gender) => (
                          <Badge key={gender} variant="secondary" className="text-xs">
                            {gender}
                            <X 
                              className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                              onClick={() => handleGenderToggle(gender, false)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Language Preference */}
              <FormField
                control={form.control}
                name="languagePreference"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Language Preference</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-between text-left font-normal border-border/50 focus:border-primary"
                        >
                          <span className="truncate">
                            {watchedValues.languagePreference?.length > 0
                              ? `${watchedValues.languagePreference.length} language${watchedValues.languagePreference.length > 1 ? 's' : ''} selected`
                              : "Select language preference (optional)"
                            }
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto">
                        {languageOptions.map((language) => {
                          const isSelected = watchedValues.languagePreference?.includes(language);
                          return (
                            <DropdownMenuCheckboxItem
                              key={language}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleLanguageToggle(language, checked)}
                            >
                              {language}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {watchedValues.languagePreference?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {watchedValues.languagePreference.map((language) => (
                          <Badge key={language} variant="secondary" className="text-xs">
                            {language}
                            <X 
                              className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                              onClick={() => handleLanguageToggle(language, false)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Application Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Application Deadline *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 text-base border-border/50 focus:border-primary justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Select deadline"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsDirty(true);
                          }}
                          disabled={(date) => date <= new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium">Image for Opportunity</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border/50">
                      <img 
                        src={imagePreview} 
                        alt="Opportunity preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the opportunity, requirements, responsibilities, and any other relevant details..."
                        className="min-h-[120px] text-base border-border/50 focus:border-primary resize-none"
                        onChange={(e) => {
                          field.onChange(e);
                          setCharacterCount(e.target.value.length);
                          setIsDirty(true);
                        }}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className={cn(
                        "text-xs",
                        characterCount > 1000 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {characterCount}/1000 characters
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </Card>
          </form>
        </Form>
      </div>

      {/* Footer Actions */}
      <div className={cn(
        "border-t bg-background/95 backdrop-blur-sm sticky bottom-0 z-10",
        isMobile ? "p-4" : "p-6"
      )}>
        <div className={cn("flex gap-3", isMobile ? "flex-row" : "justify-end")}>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className={cn("h-12", isMobile && "flex-1")}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isFormValid || createOpportunity.isPending}
            className={cn("h-12 bg-primary hover:bg-primary/90", isMobile && "flex-1")}
          >
            {createOpportunity.isPending ? "Posting..." : "Post Opportunity"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent 
            side="bottom" 
            className="h-[90vh] p-0 rounded-t-xl"
          >
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-muted-foreground/30 rounded-full" />
            {modalContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
          {modalContent}
        </DialogContent>
      </Dialog>
    </>
  );
}