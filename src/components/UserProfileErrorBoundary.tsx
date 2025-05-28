
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class UserProfileErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('UserProfile ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UserProfile ErrorBoundary details:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-red-600 font-medium mb-2">Profile Error</h3>
          <p className="text-sm text-red-500 mb-3">
            There was an issue loading the user profile. This is likely a temporary problem.
          </p>
          <Button 
            size="sm"
            onClick={() => this.setState({ hasError: false })}
            className="mr-2"
          >
            Try Again
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default UserProfileErrorBoundary;
