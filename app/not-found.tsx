'use client';

import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B1A2A] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-black text-white/20 mb-4">404</h1>
      <h2 className="text-xl font-black text-white tracking-widest uppercase italic mb-2">
        Página no encontrada
      </h2>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-6">
        La página que buscas no existe
      </p>
      <Button onClick={() => window.location.href = '/'} variant="primary" size="sm">
        Volver al inicio
      </Button>
    </div>
  );
}
