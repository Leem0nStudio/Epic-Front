import React from 'react';
import { NineSlicePanel } from './NineSlicePanel';
import { RARITY_COLORS, getRarityCode, type RarityCode } from '@/lib/config/assets-config';

export interface RarityIconProps {
  /** Item rarity - used for border coloring */
  rarity: RarityCode | string;
  /** Icon content (img element, lucide icon, emoji, etc.) */
  children: React.ReactNode;
  /** Icon size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className for the wrapper */
  className?: string;
  /** Optional onClick handler */
  onClick?: () => void;
  /** Use a thicker border variant for emphasis */
  thickBorder?: boolean;
  /** Use glassmorphism style instead of 9-slice borders */
  glass?: boolean;
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-24 h-24',
};

const iconSizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-16 h-16',
};

export function RarityIcon({
  rarity,
  children,
  size = 'md',
  className = '',
  onClick,
  thickBorder = false,
  glass = false,
}: RarityIconProps) {
  const rarityCode = getRarityCode(rarity);
  const borderColor = RARITY_COLORS[rarityCode];

  const containerSize = sizeMap[size];

  if (glass) {
    return (
      <div 
        onClick={onClick}
        className={`${containerSize} shrink-0 relative flex items-center justify-center rounded-xl border-2 backdrop-blur-md transition-all ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${className}`}
        style={{ 
          borderColor: `${borderColor}66`, // 40% opacity
          backgroundColor: `${borderColor}11`, // 7% opacity
          boxShadow: `0 0 15px ${borderColor}22` // subtle glow
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <div className="relative z-10 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }

  return (
    <NineSlicePanel
      type="border"
      variant={thickBorder ? 'thick' : 'default'}
      className={`${containerSize} shrink-0 relative overflow-hidden ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      tintColor={borderColor}
      tintIntensity={0.4}
      onClick={onClick}
    >
      <div className={`absolute inset-0 flex items-center justify-center ${containerSize}`}>
        {typeof children === 'string' ? (
          <span className={`${iconSizeMap[size]}`}>{children}</span>
        ) : (
          children
        )}
      </div>
    </NineSlicePanel>
  );
}
