'use client';

import { useGameStore } from '@/lib/stores/game-store';
import { ViewType } from '@/lib/stores/game-store';

interface NavigationParams {
  cardId?: string;
  skillId?: string;
  itemId?: string;
  unitId?: string;
  stageId?: string;
  [key: string]: string | undefined;
}

interface UseNavigation {
  navigate: (view: ViewType, params?: NavigationParams) => void;
  goBack: () => void;
  canGoBack: boolean;
}

export function useNavigation(): UseNavigation {
  const { view, navigateTo, selectedUnitId, selectedCardId, selectedSkillId, selectedItemId, setSelectedUnitId, setSelectedCardId, setSelectedItemId, setSelectedSkillId, setSelectedStage } = useGameStore();

  const navigate = (newView: ViewType, params?: NavigationParams) => {
    // Set navigation params before navigating
    if (params?.unitId) setSelectedUnitId(params.unitId);
    if (params?.cardId) {
      setSelectedCardId(params.cardId);
      setSelectedItemId(params.itemId || null);
    }
    if (params?.skillId) {
      setSelectedSkillId(params.skillId);
      setSelectedItemId(params.itemId || null);
    }
    if (params?.stageId) {
      setSelectedStage(params as any);
    }
    navigateTo(newView);
  };

  return {
    navigate,
    goBack: () => navigateTo('home'),
    canGoBack: view !== 'home',
  };
}

export type { ViewType } from '@/lib/stores/game-store';