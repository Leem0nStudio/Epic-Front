'use client';

import React from 'react';
import { AssetService } from '@/lib/services/asset-service';

interface SpriteAtlasIconProps {
  index: number;
  size?: number;
  className?: string;
  alt?: string;
}

export function SpriteAtlasIcon({ index, size, className = '', alt = '' }: SpriteAtlasIconProps) {
  const spriteSize = size || AssetService.SPRITE_SIZE;
  const pos = AssetService.getSpriteAtlasPosition(index);
  
  return (
    <div
      className={`inline-block ${className}`}
      style={{
        backgroundImage: `url('${AssetService.getSpriteAtlasUrl()}')`,
        backgroundPosition: `-${pos.x}px -${pos.y}px`,
        backgroundRepeat: 'no-repeat',
        width: `${spriteSize}px`,
        height: `${spriteSize}px`,
        imageRendering: 'pixelated',
      }}
      role="img"
      aria-label={alt}
    />
  );
}
