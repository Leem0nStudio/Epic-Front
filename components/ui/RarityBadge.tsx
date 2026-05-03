'use client';

import React from 'react';
import { RARITY_COLORS, getRarityCode } from '@/lib/config/assets-config';

interface RarityBadgeProps {
  rarity?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

const RARITY_ICONS: Record<string, string> = {
  C: '◆',  // Common
  R: '★',  // Rare
  E: '✦',  // Epic
  L: '▲',  // Legendary
  M: '◈',  // Mythic
};

const RARITY_LABELS: Record<string, string> = {
  C: 'COMÚN',
  R: 'RARO',
  E: 'ÉPICO',
  L: 'LEGENDARIO',
  M: 'MÍTICO',
};

export function RarityBadge({ rarity, size = 'md', showIcon = true, showLabel = true, className = '' }: RarityBadgeProps) {
  const rarityCode = getRarityCode(rarity);
  const color = RARITY_COLORS[rarityCode] || RARITY_COLORS.C;
  
  const sizeClasses = {
    sm: 'text-[8px] px-2 py-0.5',
    md: 'text-[10px] px-3 py-1',
    lg: 'text-xs px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-black uppercase tracking-widest ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: `${color}20`, 
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      {showIcon && (
        <span className={iconSizes[size]} style={{ color }}>
          {RARITY_ICONS[rarityCode]}
        </span>
      )}
      {showLabel && RARITY_LABELS[rarityCode]}
    </span>
  );
}

export function RarityBorder({ rarity, children, className = '' }: { rarity?: string; children: React.ReactNode; className?: string }) {
  const rarityCode = getRarityCode(rarity);
  const color = RARITY_COLORS[rarityCode] || RARITY_COLORS.C;
  
  return (
    <div 
      className={`relative rounded-xl border-2 p-1 ${className}`}
      style={{ 
        borderColor: `${color}66`,
        backgroundColor: `${color}11`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
      {children}
    </div>
  );
}