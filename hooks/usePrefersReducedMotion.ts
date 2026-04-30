'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true if the user prefers reduced motion (accessibility).
 * Re-checks on change (e.g, user toggles OS setting).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
     
    setTimeout(() => setPrefersReducedMotion(mediaQuery.matches), 0);

    const handleChange = (e: MediaQueryListEvent) => {
       
      setTimeout(() => setPrefersReducedMotion(e.matches), 0);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
