import { useState } from 'react';

const FALLBACK_MAP: Record<string, string> = {
  sprite: '/assets/sprites/sprite_novice_idle_64.png',
  card: '/assets/items/card_placeholder.svg',
  ui: '/assets/ui/ui_icon_novice_64.png',
};

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  category?: 'sprite' | 'card' | 'ui';
  className?: string;
  onError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  category = 'sprite',
  className = '',
  onError,
}: ImageWithFallbackProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedFallback = fallbackSrc || FALLBACK_MAP[category] || FALLBACK_MAP.sprite;

  return (
    <img
      src={imgError ? resolvedFallback : src}
      alt={alt}
      className={className}
      onError={() => {
        setImgError(true);
        onError?.();
      }}
    />
  );
}
