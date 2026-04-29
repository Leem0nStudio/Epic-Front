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
  const displaySize = size || AssetService.SPRITE_SIZE;
  const pos = AssetService.getSpriteAtlasPosition(index);
  const atlasUrl = AssetService.getSpriteAtlasUrl();
  const nativeSize = AssetService.SPRITE_SIZE;
  const scale = displaySize / nativeSize;
  
  // Scale the atlas and position proportionally
  const scaledAtlasWidth = 1024 * scale;
  const scaledAtlasHeight = 8768 * scale;
  const scaledPosX = pos.x * scale;
  const scaledPosY = pos.y * scale;
  
  return (
    <div
      className={`inline-block ${className}`}
      style={{
        backgroundImage: `url('${atlasUrl}')`,
        backgroundPosition: `-${scaledPosX}px -${scaledPosY}px`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${scaledAtlasWidth}px ${scaledAtlasHeight}px`,
        width: `${displaySize}px`,
        height: `${displaySize}px`,
        imageRendering: 'pixelated',
      }}
      role="img"
      aria-label={alt}
    />
  );
}
