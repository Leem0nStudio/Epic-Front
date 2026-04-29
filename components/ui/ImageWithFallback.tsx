import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/placeholder-unit.png',
  className = '',
  onError,
}: ImageWithFallbackProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <img
      src={imgError ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={() => {
        setImgError(true);
        onError?.();
      }}
    />
  );
}
