import { config } from '@/lib/config/app-config';
import { logger } from '@/lib/logger';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number; // milliseconds
  key?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// Cache de rate limiting por usuario/endpoint
const rateLimitCache = new Map<string, RequestRecord>();

export class RateLimiter {
  private static instance: RateLimiter;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Limpiar cache cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Verifica si una solicitud puede proceder bajo el rate limit
   */
  canMakeRequest(key: string, options: RateLimitOptions): boolean {
    if (!config.performance.enableQueryCaching) {
      return true; // Rate limiting deshabilitado
    }

    const now = Date.now();
    const cacheKey = `${key}_${options.key || 'default'}`;
    const record = rateLimitCache.get(cacheKey);

    if (!record || now > record.resetTime) {
      // Primera solicitud o ventana expirada
      rateLimitCache.set(cacheKey, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return true;
    }

    if (record.count >= options.maxRequests) {
      logger.warn('api_call', `Rate limit exceeded for ${cacheKey}`, {
        count: record.count,
        maxRequests: options.maxRequests,
        resetIn: record.resetTime - now,
      });
      return false;
    }

    // Incrementar contador
    record.count++;
    return true;
  }

  /**
   * Obtiene el tiempo restante hasta que se resetee el rate limit
   */
  getResetTime(key: string, options: RateLimitOptions): number {
    const cacheKey = `${key}_${options.key || 'default'}`;
    const record = rateLimitCache.get(cacheKey);

    if (!record) return 0;

    const remaining = record.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Limpia registros expirados
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, record] of rateLimitCache.entries()) {
      if (now > record.resetTime) {
        rateLimitCache.delete(key);
      }
    }

    logger.debug('performance', `Rate limit cache cleaned, remaining entries: ${rateLimitCache.size}`);
  }

  /**
   * Obtiene estadísticas del rate limiter
   */
  getStats(): { totalKeys: number; activeKeys: number } {
    return {
      totalKeys: rateLimitCache.size,
      activeKeys: Array.from(rateLimitCache.values()).filter(
        record => Date.now() <= record.resetTime
      ).length,
    };
  }

  /**
   * Limpia todo el cache (útil para testing)
   */
  clearCache(): void {
    rateLimitCache.clear();
  }
}

// Instancia global
export const rateLimiter = RateLimiter.getInstance();

// Configuraciones predefinidas de rate limiting
export const RATE_LIMITS = {
  // Llamadas API generales
  api: {
    maxRequests: config.performance.maxConcurrentRequests,
    windowMs: 60 * 1000, // 1 minute
  },

  // Gacha (más restrictivo)
  gacha: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },

  // Batallas
  battle: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },

  // Energía y regeneración
  energy: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },

  // Auth
  auth: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
} as const;

// Función helper para verificar rate limit antes de hacer una llamada
export function checkRateLimit(
  endpoint: string,
  type: keyof typeof RATE_LIMITS = 'api'
): boolean {
  const limits = RATE_LIMITS[type];
  return rateLimiter.canMakeRequest(endpoint, limits);
}

// Función helper para esperar hasta que se resetee el rate limit
export function waitForRateLimitReset(
  endpoint: string,
  type: keyof typeof RATE_LIMITS = 'api'
): Promise<void> {
  return new Promise((resolve) => {
    const resetTime = rateLimiter.getResetTime(endpoint, RATE_LIMITS[type]);

    if (resetTime === 0) {
      resolve();
    } else {
      setTimeout(resolve, resetTime);
    }
  });
}