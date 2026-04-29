import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B1A2A] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Cargando..." />
    </div>
  );
}
