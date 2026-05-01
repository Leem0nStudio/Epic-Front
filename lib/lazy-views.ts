import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Componentes cargados de manera lazy para mejor rendimiento
export const LazyViews = {
  // Vistas principales del juego
  RPGHomeView: dynamic(() => import('@/components/views/RPGHomeView'), {
    loading: () => <div>Cargando vista principal...</div>,
  }),

  TavernView: dynamic(() => import('@/components/views/TavernView'), {
    loading: () => <div>Cargando taberna...</div>,
  }),

  PartyManagementView: dynamic(() => import('@/components/views/PartyManagementView'), {
    loading: () => <div>Cargando gestión de party...</div>,
  }),

  UnitDetailsView: dynamic(() => import('@/components/views/UnitDetailsView'), {
    loading: () => <div>Cargando detalles de unidad...</div>,
  }),

  GachaView: dynamic(() => import('@/components/views/GachaView'), {
    loading: () => <div>Cargando gacha...</div>,
  }),

  InventoryView: dynamic(() => import('@/components/views/InventoryView'), {
    loading: () => <div>Cargando inventario...</div>,
  }),

  BattleScreenView: dynamic(() => import('@/components/views/BattleScreenView'), {
    loading: () => <div>Cargando pantalla de batalla...</div>,
  }),

  CampaignMapView: dynamic(() => import('@/components/views/CampaignMapView'), {
    loading: () => <div>Cargando mapa de campaña...</div>,
  }),

  QuestLogView: dynamic(() => import('@/components/views/QuestLogView'), {
    loading: () => <div>Cargando registro de quests...</div>,
  }),

  StageDetailsView: dynamic(() => import('@/components/views/StageDetailsView'), {
    loading: () => <div>Cargando detalles de stage...</div>,
  }),

  TrainingView: dynamic(() => import('@/components/views/TrainingView'), {
    loading: () => <div>Cargando centro de entrenamiento...</div>,
  }),

  DailyRewardsView: dynamic(() => import('@/components/views/DailyRewardsView'), {
    loading: () => <div>Cargando recompensas diarias...</div>,
  }),

  SkillDetailView: dynamic(() => import('@/components/views/SkillDetailView'), {
    loading: () => <div>Cargando detalles de skill...</div>,
  }),
} as const;

// Función helper para precargar vistas críticas
export function preloadCriticalViews(): void {
  // Precargar vistas que se usan frecuentemente
  import('@/components/views/RPGHomeView');
  import('@/components/views/PartyManagementView');
  import('@/components/views/InventoryView');
}

// Función helper para precargar vista específica
export function preloadView(viewName: keyof typeof LazyViews): Promise<ComponentType<any>> {
  return LazyViews[viewName].preload();
}

// Hook para precargar vistas basado en navegación anticipada
export function useViewPreloader(currentView: string, nextViews: string[] = []): void {
  React.useEffect(() => {
    // Precargar vistas relacionadas después de un pequeño delay
    const timeoutId = setTimeout(() => {
      nextViews.forEach(viewName => {
        if (viewName in LazyViews) {
          LazyViews[viewName as keyof typeof LazyViews].preload().catch(() => {
            // Silenciar errores de precarga
          });
        }
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [currentView, nextViews]);
}