import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthOptimized } from "@/hooks/useAuthOptimized";
import { Eye, EyeOff, Building, Mail, Lock, Phone, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Organization type options for the select dropdown
const organizationTypeOptions = [
  { value: 'director', label: 'Director' },
  { value: 'producer', label: 'Producer' },
  { value: 'casting_director', label: 'Casting Director' },
  { value: 'production_house', label: 'Production House' },
  { value: 'casting_agency', label: 'Casting Agency' },
  { value: 'event_management', label: 'Event Management' },
  { value: 'institution', label: 'Institution' },
  { value: 'individual_hirer', label: 'Individual Hirer' },
  { value: 'others', label: 'Others' }
];

const OrganizationSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [formData, setFormData] = useState({
    organizationName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    organizationType: '',
    location: '',
    bio: ''
  });
  
  const navigate = useNavigate();
  const { signUp } = useAuthOptimized();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Clear username error when user types
    if (e.target.name === 'username') {
      setUsernameError('');
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateUsername = async (username: string) => {
    if (!username) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        return false;
      }

      return !data; // Username is available if no data returned
    } catch (error) {
      console.error('Error validating username:', error);
      return false;
    }
  };

  const validateForm = () => {
    return formData.organizationName && 
           formData.username && 
           formData.email && 
           formData.password.length >= 6 &&
           formData.organizationType;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Check if username is available
    const isUsernameAvailable = await validateUsername(formData.username);
    if (!isUsernameAvailable) {
      setUsernameError('Username is already taken');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.organizationName,
      username: formData.username,
      phone: formData.phone,
      user_role: 'organization',
      organization_type: formData.organizationType,
      location: formData.location,
      bio: formData.bio
    });

    if (!error) {
      navigate('/home');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName" className="text-sm font-medium text-foreground">
            Organization Name *
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="organizationName"
              name="organizationName"
              placeholder="Enter organization name"
              value={formData.organizationName}
              onChange={handleInputChange}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-foreground">
            Username *
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-muted-foreground text-sm">@</span>
            <Input
              id="username"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleInputChange}
              className="pl-8 h-11"
              required
            />
          </div>
          {usernameError && (
            <p className="text-sm text-destructive font-medium">{usernameError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-10 h-11"
              minLength={6}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleInputChange}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationType" className="text-sm font-medium text-foreground">
            Organization Type *
          </Label>
          <Select 
            value={formData.organizationType} 
            onValueChange={(value) => handleSelectChange('organizationType', value)}
          >
            <SelectTrigger className="w-full h-11">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {organizationTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium text-foreground">
          Location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            name="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={handleInputChange}
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium text-foreground">
          About Organization
        </Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about your organization..."
          value={formData.bio}
          onChange={handleInputChange}
          className="min-h-[100px] resize-none"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium" 
        disabled={isLoading || !validateForm()}
      >
        {isLoading ? "Creating Account..." : "Create Organization Account"}
      </Button>
    </form>
  );
};

export default OrganizationSignupForm;