
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorType?: 'dispatcher' | 'theme' | 'hook-order' | 'general';
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    
    // Determine error type for better handling
    let errorType: 'dispatcher' | 'theme' | 'hook-order' | 'general' = 'general';
    
    if (error.message.includes('dispatcher') || error.message.includes('useState')) {
      errorType = 'dispatcher';
    } else if (error.message.includes('theme') || error.message.includes('ThemeProvider')) {
      errorType = 'theme';
    } else if (error.message.includes('321') || error.message.includes('hook') || error.message.includes('order')) {
      errorType = 'hook-order';
    }
    
    return { hasError: true, error, errorType };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
    
    // Log specific React errors for debugging
    if (error.message.includes('dispatcher')) {
      console.error('React dispatcher error detected. This usually happens when hooks are called outside of a React component or before React is fully mounted.');
    }
    
    if (error.message.includes('321')) {
      console.error('React Error #321 detected. This is usually caused by hook order mismatch or conditional hook calls.');
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    // Log theme-related errors
    if (error.message.includes('theme') || error.message.includes('ThemeProvider')) {
      console.error('Theme-related error detected. This might be due to localStorage access or component mounting issues.');
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorType: undefined });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            
            {this.state.errorType === 'hook-order' && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  React Hook Order Error (Error #321) detected.
                </p>
                <p className="text-sm text-gray-500">
                  This is usually caused by conditional hook calls or component remounting issues.
                </p>
              </div>
            )}
            
            {this.state.errorType === 'dispatcher' && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  React initialization error detected.
                </p>
                <p className="text-sm text-gray-500">
                  This usually resolves itself on refresh.
                </p>
              </div>
            )}
            
            {this.state.errorType === 'theme' && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Theme system error detected.
                </p>
                <p className="text-sm text-gray-500">
                  This might be due to localStorage access issues.
                </p>
              </div>
            )}
            
            {this.state.errorType === 'general' && (
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Please try again.
              </p>
            )}
            
            <div className="space-y-2">
              <button 
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              >
                Try Again
              </button>
              <button 
                onClick={this.handleRefresh}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
