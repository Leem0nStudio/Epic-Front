'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/Button';

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-4">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-gray-300 mb-6">
          Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
              Detalles técnicos
            </summary>
            <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}

        <div className="space-y-2">
          <Button
            onClick={resetErrorBoundary}
            className="w-full"
          >
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            className="w-full"
          >
            Recargar página
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

export function ErrorBoundary({
  children,
  fallback: Fallback = ErrorFallback
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, errorInfo) => {
        // Log error to monitoring service in production
        console.error('Error caught by boundary:', error, errorInfo);

        // In production, you would send this to Sentry, LogRocket, etc.
        if (process.env.NODE_ENV === 'production') {
          // reportError(error, errorInfo);
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}