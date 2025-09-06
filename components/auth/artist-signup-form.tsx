'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/providers/auth-provider'
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability'
import { Eye, EyeOff, User, AtSign, Mail, Lock, Phone, MapPin } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const artformOptions = [
  { value: 'actor', label: 'Actor' },
  { value: 'dancer', label: 'Dancer' },
  { value: 'model', label: 'Model' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'instrumentalist', label: 'Instrumentalist' },
  { value: 'singer', label: 'Singer' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'painting', label: 'Painting' },
]

export function ArtistSignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    artform: '',
    location: '',
    bio: '',
  })
  const router = useRouter()
  const { signUp } = useAuth()
  
  // Use username availability hook
  const { loading: usernameLoading, exists: usernameExists, error: usernameCheckError } = useUsernameAvailability(formData.username)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    // Basic validation
    if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
      return false
    }

    if (formData.password.length < 8) {
      return false
    }

    if (!formData.artform) {
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Check if username is valid and available
    if (formData.username.length < 3) {
      setIsLoading(false)
      return
    }

    if (usernameExists === true) {
      setIsLoading(false)
      return
    }

    if (usernameCheckError) {
      setIsLoading(false)
      return
    }

    if (usernameExists === null && formData.username.length >= 3) {
      setIsLoading(false)
      return
    }

    const { error } = await signUp(formData.email, formData.password, {
      role: 'artist',
      full_name: formData.fullName,
      username: formData.username.toLowerCase(),
      phone_number: formData.phoneNumber,
      artform: formData.artform,
      location: formData.location,
      bio: formData.bio,
    })

    if (!error) {
      router.push('/auth?message=Check your email to complete registration')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground font-medium">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              name="fullName"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              className="pl-10 h-11 rounded-lg border-input focus:border-primary focus:ring-primary"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground font-medium">
            Username *
          </Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleInputChange}
              className="pl-10 h-11 border-primary/20 focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div className="min-h-[1rem] mt-1">
            {usernameLoading && <p className="text-muted-foreground text-sm">Checking...</p>}
            {usernameCheckError && <p className="text-red-500 text-sm">{usernameCheckError}</p>}
            {usernameExists === true && !usernameLoading && (
              <p className="text-red-500 text-sm">Username is already taken</p>
            )}
            {usernameExists === false && !usernameLoading && (
              <p className="text-green-600 text-sm">Username is available</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground font-medium">
          Email Address *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10 h-11 border-primary/20 focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground font-medium">
          Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10 h-11 border-primary/20 focus:border-primary focus:ring-primary"
            minLength={8}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-foreground font-medium">
            Phone Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="pl-10 h-11 border-primary/20 focus:border-primary focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="artform" className="text-foreground font-medium">
            Artform *
          </Label>
          <Select onValueChange={(value) => handleSelectChange('artform', value)} required>
            <SelectTrigger className="h-11 border-primary/20 focus:border-primary focus:ring-primary">
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
        <Label htmlFor="location" className="text-foreground font-medium">
          Location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            name="location"
            placeholder="City, State/Country"
            value={formData.location}
            onChange={handleInputChange}
            className="pl-10 h-11 border-primary/20 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-foreground font-medium">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself and your artistic journey..."
          value={formData.bio}
          onChange={handleInputChange}
          className="border-primary/20 focus:border-primary focus:ring-primary resize-none"
          rows={4}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-6" 
        disabled={isLoading || !validateForm()}
      >
        {isLoading ? 'Creating Account...' : 'Create Artist Account'}
      </Button>
    </form>
  )
}