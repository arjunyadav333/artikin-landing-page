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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-2xl">A</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Artikin</h1>
              <p className="text-sm text-muted-foreground">Creative Network</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-card">
          {!selectedRole ? (
            <>
              <CardHeader className="text-center space-y-2 pb-6">
                <div className="flex items-start justify-start mb-4 w-full">
                  <Button
                    onClick={() => router.push('/auth')}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 -ml-2"
                  >
                    ← Back to Sign In
                  </Button>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Join Artikin
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Choose your account type to get started
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setSelectedRole('artist')}
                    variant="outline"
                    className="h-36 sm:h-32 flex flex-col items-center justify-center space-y-3 border-2 border-input hover:border-primary hover:bg-primary/5 transition-all duration-200 rounded-lg"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <Palette className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg text-foreground">Artist</h3>
                      <p className="text-sm text-muted-foreground">Showcase your creativity</p>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setSelectedRole('organization')}
                    variant="outline"
                    className="h-36 sm:h-32 flex flex-col items-center justify-center space-y-3 border-2 border-input hover:border-primary hover:bg-primary/5 transition-all duration-200 rounded-lg"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg text-foreground">Organization</h3>
                      <p className="text-sm text-muted-foreground">Find creative talent</p>
                    </div>
                  </Button>
                </div>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Sign In
                    </Link>
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center space-y-2 pb-6">
                <div className="flex items-center justify-center mb-4">
                  <Button
                    onClick={() => setSelectedRole(null)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to role selection
                  </Button>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {selectedRole === 'artist' ? 'Artist Registration' : 'Organization Registration'}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Complete your profile to get started
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