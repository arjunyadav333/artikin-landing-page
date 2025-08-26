'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers/auth-provider'
import { Palette, Building2 } from 'lucide-react'
import Link from 'next/link'
import { ArtistSignupForm } from '@/components/auth/artist-signup-form'
import { OrganizationSignupForm } from '@/components/auth/organization-signup-form'

type UserRole = 'artist' | 'organization'

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  if (user) {
    return null // Prevent flash of auth form
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-accent/10 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl overflow-hidden">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="h-16 w-16 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-blue-glow group-hover:shadow-blue-glow-lg transition-all duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-2xl">A</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-blue">Artikin</h1>
              <p className="text-sm text-muted-foreground">Creative Network</p>
            </div>
          </Link>
        </div>

        <Card className="card-blue shadow-blue-glow overflow-hidden">
          {!selectedRole ? (
            <>
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Join Artikin
                </CardTitle>
                <CardDescription className="text-base">
                  Choose your role to get started
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setSelectedRole('artist')}
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center space-y-3 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 p-4 text-contain"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-blue flex items-center justify-center flex-shrink-0">
                      <Palette className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="text-center text-contain max-w-full">
                      <h3 className="font-semibold text-lg leading-tight mb-1">Artist 🎭</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">Showcase your work</p>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setSelectedRole('organization')}
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center space-y-3 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 p-4 text-contain"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-blue flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="text-center text-contain max-w-full">
                      <h3 className="font-semibold text-lg leading-tight mb-1">Organization 🏢</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">Hire talent</p>
                    </div>
                  </Button>
                </div>

                <div className="text-center mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth" className="text-primary hover:text-primary/80 font-medium">
                      Sign In
                    </Link>
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Button
                    onClick={() => setSelectedRole(null)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Back
                  </Button>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {selectedRole === 'artist' ? 'Artist Registration' : 'Organization Registration'}
                </CardTitle>
                <CardDescription className="text-base">
                  {selectedRole === 'artist' 
                    ? 'Create your creative profile' 
                    : 'Set up your organization account'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {selectedRole === 'artist' ? (
                  <ArtistSignupForm />
                ) : (
                  <OrganizationSignupForm />
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}