import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuthOptimized } from '@/hooks/useAuthOptimized';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuthOptimized();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (!error) {
      navigate('/');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (!error) {
      toast({
        title: 'Check your email',
        description: 'We\'ve sent you a confirmation link to complete your registration.'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !loading) {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome to Messages</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one to start messaging
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleSignIn)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleSignIn)}
                  disabled={loading}
                />
              </div>
            </div>

            <TabsContent value="signin" className="space-y-4">
              <Button 
                onClick={handleSignIn} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <Button 
                onClick={handleSignUp} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                By creating an account, you agree to our terms of service and privacy policy.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;