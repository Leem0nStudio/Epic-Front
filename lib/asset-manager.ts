import { useState, useEffect, useCallback } from 'react';

// Tipos para el sistema de assets
export type AssetType = 'sprite' | 'ui' | 'background' | 'item';
export type AssetQuality = 'low' | 'medium' | 'high';

export interface AssetConfig {
  id: string;
  type: AssetType;
  path: string;
  fallback?: string;
  preload?: boolean;
  quality?: AssetQuality;
}

// Cache de assets cargados
const assetCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

// Configuración centralizada de assets
export const ASSET_CONFIGS: Record<string, AssetConfig> = {
  // Sprites de personajes
  novice: {
    id: 'novice',
    type: 'sprite',
    path: '/assets/sprites/characters/novice.png',
    fallback: '/assets/sprites/characters/default.png',
    preload: true,
  },
  swordman: {
    id: 'swordman',
    type: 'sprite',
    path: '/assets/sprites/characters/swordman.png',
    fallback: '/assets/sprites/characters/default.png',
  },
  mage: {
    id: 'mage',
    type: 'sprite',
    path: '/assets/sprites/characters/mage.png',
    fallback: '/assets/sprites/characters/default.png',
  },
  archer: {
    id: 'archer',
    type: 'sprite',
    path: '/assets/sprites/characters/archer.png',
    fallback: '/assets/sprites/characters/default.png',
  },

  // UI Elements
  button_normal: {
    id: 'button_normal',
    type: 'ui',
    path: '/assets/ui/button_normal.png',
    preload: true,
  },
  button_hover: {
    id: 'button_hover',
    type: 'ui',
    path: '/assets/ui/button_hover.png',
  },

  // Items
  potion_hp: {
    id: 'potion_hp',
    type: 'item',
    path: '/assets/items/potion_hp.png',
  },
  sword_iron: {
    id: 'sword_iron',
    type: 'item',
    path: '/assets/items/sword_iron.png',
  },
};

// Función para cargar un asset
async function loadAsset(config: AssetConfig): Promise<HTMLImageElement> {
  const cacheKey = `${config.id}_${config.quality || 'default'}`;

  // Retornar del cache si ya está cargado
  if (assetCache.has(cacheKey)) {
    return assetCache.get(cacheKey)!;
  }

  // Retornar promise en curso si ya se está cargando
  if (loadingPromises.has(cacheKey)) {
    return loadingPromises.get(cacheKey)!;
  }

  // Crear nueva promise de carga
  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      assetCache.set(cacheKey, img);
      loadingPromises.delete(cacheKey);
      resolve(img);
    };

    img.onerror = () => {
      // Intentar con fallback
      if (config.fallback && img.src !== config.fallback) {
        img.src = config.fallback;
        return;
      }

      loadingPromises.delete(cacheKey);
      reject(new Error(`Failed to load asset: ${config.id}`));
    };

    // Construir URL con calidad si es necesario
    let assetUrl = config.path;
    if (config.quality && config.quality !== 'medium') {
      const qualitySuffix = config.quality === 'low' ? '_low' : '_high';
      assetUrl = assetUrl.replace('.png', `${qualitySuffix}.png`);
    }

    img.src = assetUrl;
  });

  loadingPromises.set(cacheKey, loadPromise);
  return loadPromise;
}

// Hook para usar assets
export function useAsset(assetId: string, quality: AssetQuality = 'medium') {
  const [asset, setAsset] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAssetCallback = useCallback(async () => {
    const config = ASSET_CONFIGS[assetId];
    if (!config) {
      setError(new Error(`Asset config not found: ${assetId}`));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedAsset = await loadAsset({ ...config, quality });
      setAsset(loadedAsset);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [assetId, quality]);

  useEffect(() => {
    loadAssetCallback();
  }, [loadAssetCallback]);

  return { asset, loading, error, reload: loadAssetCallback };
}

// Hook para precargar assets críticos
export function usePreloadAssets(assetIds: string[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount] = useState(assetIds.length);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let loaded = 0;
    const loadErrors: string[] = [];

    const loadPromises = assetIds.map(async (assetId) => {
      try {
        const config = ASSET_CONFIGS[assetId];
        if (config) {
          await loadAsset(config);
        }
        loaded++;
        setLoadedCount(loaded);
      } catch (error) {
        loadErrors.push(assetId);
      }
    });

    Promise.allSettled(loadPromises).then(() => {
      setErrors(loadErrors);
    });
  }, [assetIds, totalCount]);

  return {
    progress: totalCount > 0 ? loadedCount / totalCount : 1,
    loadedCount,
    totalCount,
    errors,
    isComplete: loadedCount === totalCount,
  };
}

// Función para obtener sprite basado en job
export function getJobSpriteId(jobId: string): string {
  const spriteMap: Record<string, string> = {
    novice: 'novice',
    swordman: 'swordman',
    knight: 'swordman', // Usa sprite de swordman por ahora
    mage: 'mage',
    wizard: 'mage', // Usa sprite de mage por ahora
    archer: 'archer',
    ranger: 'archer', // Usa sprite de archer por ahora
  };

  return spriteMap[jobId] || 'novice';
}

// Función para limpiar cache (útil para desarrollo)
export function clearAssetCache(): void {
  assetCache.clear();
  loadingPromises.clear();
}

// Función para obtener assets por tipo
export function getAssetsByType(type: AssetType): AssetConfig[] {
  return Object.values(ASSET_CONFIGS).filter(config => config.type === type);
}