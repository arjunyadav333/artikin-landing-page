import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FeedErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Feed Error:', error, errorInfo);
  }

  getErrorMessage(error?: Error): { title: string; description: string } {
    if (!error) {
      return {
        title: 'Something went wrong',
        description: "We're having trouble loading the feed"
      };
    }

    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        title: 'Network Error',
        description: 'Unable to connect. Please check your internet connection and try again.'
      };
    }
    
    if (message.includes('auth') || message.includes('unauthorized')) {
      return {
        title: 'Authentication Error',
        description: 'Your session may have expired. Please try logging in again.'
      };
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return {
        title: 'Content Not Found',
        description: 'The content you are looking for could not be found.'
      };
    }
    
    return {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again.'
    };
  }

  render() {
    if (this.state.hasError) {
      const { title, description } = this.getErrorMessage(this.state.error);
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">{description}</p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
              Dismiss
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
