
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorType?: 'dispatcher' | 'theme' | 'hook-order' | 'initialization' | 'general';
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;

  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    
    // Determine error type for better handling
    let errorType: 'dispatcher' | 'theme' | 'hook-order' | 'initialization' | 'general' = 'general';
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('dispatcher') || errorMessage.includes('usestate') || errorMessage.includes('null')) {
      errorType = 'dispatcher';
    } else if (errorMessage.includes('theme') || errorMessage.includes('themeprovider')) {
      errorType = 'theme';
    } else if (errorMessage.includes('321') || errorMessage.includes('hook') || errorMessage.includes('order')) {
      errorType = 'hook-order';
    } else if (errorMessage.includes('cannot read properties of null') || errorMessage.includes('initialization')) {
      errorType = 'initialization';
    }
    
    return { hasError: true, error, errorType, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
    
    // Log specific React errors for debugging
    if (error.message.includes('dispatcher') || error.message.includes('useState')) {
      console.error('React dispatcher/useState error detected. This usually happens when:');
      console.error('- Hooks are called outside of a React component');
      console.error('- React is not fully initialized');
      console.error('- There are timing issues with component mounting');
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    if (error.message.includes('Cannot read properties of null')) {
      console.error('Null reference error detected. This might be due to:');
      console.error('- React not being fully loaded');
      console.error('- Timing issues with initialization');
      console.error('- Race conditions in component mounting');
    }
    
    // Auto-retry for dispatcher errors (they're often transient)
    if (this.state.errorType === 'dispatcher' || this.state.errorType === 'initialization') {
      if (this.state.retryCount < 3) {
        console.log(`Auto-retrying in 1 second... (attempt ${this.state.retryCount + 1}/3)`);
        this.retryTimer = setTimeout(() => {
          this.handleRetry();
        }, 1000);
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  private handleRetry = () => {
    console.log('Retrying after error...');
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined, 
      errorType: undefined,
      retryCount: prevState.retryCount + 1
    }));
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
            
            {this.state.errorType === 'dispatcher' && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  React initialization error detected.
                </p>
                <p className="text-sm text-gray-500">
                  This is usually a temporary issue that resolves on retry.
                </p>
                {this.state.retryCount > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Retry attempt: {this.state.retryCount}/3
                  </p>
                )}
              </div>
            )}

            {this.state.errorType === 'initialization' && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  App initialization error detected.
                </p>
                <p className="text-sm text-gray-500">
                  The app is having trouble starting up. Please try refreshing.
                </p>
              </div>
            )}
            
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

            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
