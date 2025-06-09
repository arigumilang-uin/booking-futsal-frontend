// src/components/EnhancedErrorBoundary.jsx
import React from 'react';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('🚨 Error caught by Enhanced Error Boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service if available
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // Log to console for development
      console.group('🚨 Error Details');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.groupEnd();

      // In production, you would send this to an error tracking service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      if (process.env.NODE_ENV === 'production') {
        // Example error logging service call
        // errorTrackingService.captureException(error, {
        //   extra: errorInfo,
        //   tags: {
        //     component: 'ErrorBoundary',
        //     retryCount: this.state.retryCount
        //   }
        // });
      }
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({
      isRetrying: true
    });

    // Simulate retry delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      });
    }, 1000);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try again.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-red-600 mt-1 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-900">
                    Retry attempts: {this.state.retryCount}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying || this.state.retryCount >= 3}
                  className="w-full bg-gray-800 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {this.state.isRetrying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Retrying...
                    </div>
                  ) : (
                    `🔄 Try Again ${this.state.retryCount >= 3 ? '(Max attempts reached)' : ''}`
                  )}
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={this.handleReload}
                    className="flex-1 bg-gray-600 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    🔄 Reload Page
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 bg-gray-800 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    🏠 Go Home
                  </button>
                </div>
              </div>

              {/* Help Information */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  If this problem persists, please contact support.
                </p>
                {process.env.NODE_ENV === 'production' && (
                  <p className="text-xs text-gray-400 mt-2">
                    Error ID: {Date.now().toString(36)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error reporting
export const useErrorHandler = () => {
  const handleError = (error, errorInfo = {}) => {
    console.error('🚨 Manual error report:', error, errorInfo);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // errorTrackingService.captureException(error, { extra: errorInfo });
    }
  };

  return { handleError };
};

export default EnhancedErrorBoundary;
