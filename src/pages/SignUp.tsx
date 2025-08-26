import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Users, Palette } from "lucide-react";
import ArtistSignupForm from "@/components/auth/artist-signup-form";
import OrganizationSignupForm from "@/components/auth/organization-signup-form";

type UserRole = 'artist' | 'organization';

const SignUp = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">A</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Join Artikin
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {selectedRole ? 'Complete your profile' : 'Choose your account type to get started'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!selectedRole ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRole('artist')}
                  className="h-auto p-6 flex-col gap-3 hover:bg-primary/5 border-2 hover:border-primary transition-colors"
                >
                  <Palette className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Artist</div>
                    <div className="text-sm text-muted-foreground">
                      Showcase your creative work and connect with opportunities
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setSelectedRole('organization')}
                  className="h-auto p-6 flex-col gap-3 hover:bg-primary/5 border-2 hover:border-primary transition-colors"
                >
                  <Users className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Organization</div>
                    <div className="text-sm text-muted-foreground">
                      Find and hire talented artists for your projects
                    </div>
                  </div>
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/auth" 
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to role selection
              </Button>

              {selectedRole === 'artist' ? (
                <ArtistSignupForm />
              ) : (
                <OrganizationSignupForm />
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/auth" 
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;