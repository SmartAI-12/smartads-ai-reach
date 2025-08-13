import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We're having trouble loading the application. This might be a temporary issue.
          </p>
        </div>

        {error && (
          <details className="text-left bg-muted p-4 rounded-lg">
            <summary className="cursor-pointer text-sm font-medium">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={handleReload} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
          {resetError && (
            <Button onClick={resetError} variant="outline">
              Try Again
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};
