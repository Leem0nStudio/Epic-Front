'use client';

import { useEffect } from 'react';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B1A2A] flex items-center justify-center p-4">
      <ErrorDisplay
        title="Algo salió mal"
        message={error.message || 'Ha ocurrido un error inesperado'}
        onRetry={reset}
      />
    </div>
  );
}
