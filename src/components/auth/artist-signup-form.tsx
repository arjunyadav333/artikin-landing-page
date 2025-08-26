import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Artform options for the select dropdown
const artformOptions = [
  { value: 'visual_arts', label: 'Visual Arts' },
  { value: 'music', label: 'Music' },
  { value: 'performing_arts', label: 'Performing Arts' },
  { value: 'literature', label: 'Literature' },
  { value: 'digital_arts', label: 'Digital Arts' },
  { value: 'crafts', label: 'Crafts' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'film_video', label: 'Film & Video' },
  { value: 'other', label: 'Other' }
];

const ArtistSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
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
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
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
    return formData.fullName && 
           formData.username && 
           formData.email && 
           formData.password.length >= 6 &&
           formData.artform;
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
      full_name: formData.fullName,
      username: formData.username,
      phone: formData.phone,
      user_role: 'artist',
      artform: formData.artform,
      location: formData.location,
      bio: formData.bio
    });

    if (!error) {
      navigate('/auth/confirmation');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
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
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username *
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-muted-foreground">@</span>
            <Input
              id="username"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleInputChange}
              className="pl-8"
              required
            />
          </div>
          {usernameError && (
            <p className="text-sm text-destructive">{usernameError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
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
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
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
              className="pl-10 pr-10"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
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
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="artform" className="text-sm font-medium">
            Artform *
          </Label>
          <Select 
            value={formData.artform} 
            onValueChange={(value) => handleSelectChange('artform', value)}
          >
            <SelectTrigger className="w-full">
              <Palette className="h-4 w-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="Select your artform" />
            </SelectTrigger>
            <SelectContent>
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
        <Label htmlFor="location" className="text-sm font-medium">
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
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself and your artistic journey..."
          value={formData.bio}
          onChange={handleInputChange}
          className="min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" 
        disabled={isLoading || !validateForm()}
      >
        {isLoading ? "Creating Account..." : "Create Artist Account"}
      </Button>
    </form>
  );
};

export default ArtistSignupForm;