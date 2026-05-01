import { logger } from '@/lib/logger';
import { config } from '@/lib/config/app-config';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeResourceMonitoring();
    }
  }

  // Monitoreo de Web Vitals
  private initializeWebVitals(): void {
    if (!config.monitoring.enableAnalytics) return;

    try {
      // CLS - Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('web_vitals_cls', (entry as any).value, {
            id: (entry as any).id,
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('web_vitals_fid', (entry as any).value, {
            id: (entry as any).id,
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('web_vitals_lcp', entry.startTime, {
            size: (entry as any).size,
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      this.observers.push(clsObserver, fidObserver, lcpObserver);
    } catch (error) {
      logger.error('performance', 'Failed to initialize Web Vitals monitoring', error as Error);
    }
  }

  // Monitoreo de recursos
  private initializeResourceMonitoring(): void {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('resource_load', resourceEntry.responseEnd - resourceEntry.requestStart, {
              url: resourceEntry.name,
              type: this.getResourceType(resourceEntry.initiatorType),
              size: resourceEntry.transferSize,
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      logger.error('performance', 'Failed to initialize resource monitoring', error as Error);
    }
  }

  private getResourceType(initiatorType: string): string {
    switch (initiatorType) {
      case 'img':
        return 'image';
      case 'script':
        return 'javascript';
      case 'link':
        return 'stylesheet';
      case 'xmlhttprequest':
      case 'fetch':
        return 'api';
      default:
        return initiatorType || 'unknown';
    }
  }

  // Registrar métrica personalizada
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Mantener límite de métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log métricas importantes
    if (this.isImportantMetric(name, value)) {
      logger.info('performance', `Performance metric: ${name}`, {
        value,
        metadata,
      });
    }
  }

  private isImportantMetric(name: string, value: number): boolean {
    // Métricas importantes que vale la pena loggear
    if (name.startsWith('web_vitals_')) {
      return value > this.getThresholdForMetric(name);
    }

    if (name === 'resource_load') {
      return value > 5000; // Recursos que tardan más de 5 segundos
    }

    return false;
  }

  private getThresholdForMetric(name: string): number {
    const thresholds: Record<string, number> = {
      web_vitals_cls: 0.1, // CLS > 0.1 es problemático
      web_vitals_fid: 100, // FID > 100ms es problemático
      web_vitals_lcp: 2500, // LCP > 2.5s es problemático
    };

    return thresholds[name] || 0;
  }

  // Medir tiempo de ejecución de función
  measureExecutionTime<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const endTime = performance.now();
      this.recordMetric(`execution_time_${name}`, endTime - startTime, metadata);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`execution_time_${name}_error`, endTime - startTime, {
        ...metadata,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  // Medir tiempo de ejecución async
  async measureAsyncExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      this.recordMetric(`async_execution_time_${name}`, endTime - startTime, metadata);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`async_execution_time_${name}_error`, endTime - startTime, {
        ...metadata,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  // Obtener métricas recientes
  getRecentMetrics(count: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  // Obtener métricas por nombre
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  // Calcular estadísticas de métricas
  getMetricStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value).sort((a, b) => a - b);

    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p95: values[Math.floor(values.length * 0.95)],
    };
  }

  // Limpiar métricas
  clearMetrics(): void {
    this.metrics = [];
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

// Instancia global
export const performanceMonitor = new PerformanceMonitor();

// Funciones de conveniencia
export const measureExecution = performanceMonitor.measureExecutionTime.bind(performanceMonitor);
export const measureAsyncExecution = performanceMonitor.measureAsyncExecutionTime.bind(performanceMonitor);
export const recordMetric = performanceMonitor.recordMetric.bind(performanceMonitor);