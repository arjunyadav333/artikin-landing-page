import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Artform options for the select dropdown
const artformOptions = [
  { value: 'actor', label: 'Actor' },
  { value: 'dancer', label: 'Dancer' },
  { value: 'model', label: 'Model' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'instrumentalist', label: 'Instrumentalist' },
  { value: 'singer', label: 'Singer' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'painting', label: 'Painting' }
];

const ArtistSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    artform: '',
    location: '',
    bio: ''
  });
  
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  // Use username availability hook
  const { loading: usernameLoading, exists: usernameExists, error: usernameCheckError } = useUsernameAvailability(formData.username);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    return formData.fullName && 
           formData.username && 
           formData.email && 
           formData.password.length >= 6 &&
           formData.artform;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check if username is valid and available
    if (formData.username.length < 3) {
      return; // Don't proceed if username is too short
    }

    if (usernameExists === true) {
      return; // Don't proceed if username is taken
    }

    if (usernameCheckError) {
      return; // Don't proceed if there's an error checking username
    }

    if (usernameExists === null && formData.username.length >= 3) {
      return; // Don't proceed if we haven't validated the username yet
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      username: formData.username,
      phone: formData.phone,
      user_role: 'artist',
      artform: formData.artform,
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
          <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
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
          <div className="min-h-[1rem] mt-1">
            {usernameLoading && <p className="text-sm text-muted-foreground">Checking...</p>}
            {usernameCheckError && <p className="text-sm text-destructive">{usernameCheckError}</p>}
            {usernameExists === true && !usernameLoading && (
              <p className="text-sm text-destructive">Username is already taken</p>
            )}
            {usernameExists === false && !usernameLoading && (
              <p className="text-sm text-green-600">Username is available</p>
            )}
          </div>
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
              placeholder="Enter your email"
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
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="artform" className="text-sm font-medium text-foreground">
            Artform *
          </Label>
          <Select 
            value={formData.artform} 
            onValueChange={(value) => handleSelectChange('artform', value)}
          >
            <SelectTrigger className="w-full h-11">
              <Palette className="h-4 w-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="Select your artform" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {artformOptions.map((option) => (
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
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself..."
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
        {isLoading ? "Creating Account..." : "Create Artist Account"}
      </Button>
    </form>
  );
};

export default ArtistSignupForm;