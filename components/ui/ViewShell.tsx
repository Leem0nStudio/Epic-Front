'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Package } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { Button } from '@/components/ui/Button';

interface ViewShellProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  background?: 'home' | 'battle' | 'party' | 'gacha';
}

export function ViewShell({ 
  title, 
  subtitle, 
  onBack, 
  children, 
  loading = false, 
  error = null,
  emptyMessage,
  background = 'home'
}: ViewShellProps) {
  const bgUrl = AssetService.getBgUrl(background);

  if (loading) {
    return (
      <div className="flex flex-col h-full relative" style={{ backgroundImage: `url('${bgUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-[#0B1A2A]/90" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="w-10 h-10 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin" />
          <p className="text-white/40 text-sm mt-4 font-stats">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full relative" style={{ backgroundImage: `url('${bgUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-[#0B1A2A]/90" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <p className="text-white/80 font-stats text-sm mb-4">{error}</p>
          {onBack && (
            <Button onClick={onBack} variant="secondary" size="sm">
              Volver
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Only show empty message if no children AND emptyMessage is provided
  const hasChildren = Boolean(children);
  
  if (!hasChildren && emptyMessage) {
    return (
      <div className="flex flex-col h-full relative" style={{ backgroundImage: `url('${bgUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-[#0B1A2A]/90" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          <Package size={48} className="text-white/20 mb-4" />
          <p className="text-white/40 font-stats text-sm">{emptyMessage}</p>
          {onBack && (
            <Button onClick={onBack} variant="secondary" size="sm" className="mt-4">
              Volver
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundImage: `url('${bgUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/80 via-transparent to-[#0B1A2A]/95 pointer-events-none" />
      
      {/* Header */}
      {title && (
        <div className="relative z-10 flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all hover:bg-white/10 btn-back">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-white tracking-widest uppercase font-display">{title}</h1>
            {subtitle && <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-stats">{subtitle}</span>}
          </div>
          <div className="w-10" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}