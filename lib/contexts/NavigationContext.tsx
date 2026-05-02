'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
import { ViewType } from '@/lib/stores/game-store';

interface NavigationContextValue {
  navigate: (view: ViewType, params?: Record<string, any>) => void;
  navigateWithParams: (view: ViewType, params: Record<string, any>) => void;
  goHome: () => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { navigateTo, setSelectedUnitId, setSelectedCardId, setSelectedItemId, setSelectedSkillId, setSelectedStage } = useGameStore();

  const navigate = useCallback((view: ViewType, params?: Record<string, any>) => {
    // Set relevant state before navigating
    if (params) {
      if (params.unitId) setSelectedUnitId(params.unitId);
      if (params.cardId) {
        setSelectedCardId(params.cardId);
        if (params.itemId) setSelectedItemId(params.itemId);
      }
      if (params.skillId) {
        setSelectedSkillId(params.skillId);
        if (params.itemId) setSelectedItemId(params.itemId);
      }
      if (params.stageId) {
        setSelectedStage(params as any);
      }
    }
    navigateTo(view);
  }, [navigateTo, setSelectedUnitId, setSelectedCardId, setSelectedItemId, setSelectedSkillId, setSelectedStage]);

  const navigateWithParams = useCallback((view: ViewType, params: Record<string, any>) => {
    navigate(view, params);
  }, [navigate]);

  const goHome = useCallback(() => {
    navigateTo('home');
  }, [navigateTo]);

  const goBack = useCallback(() => {
    // Simple back navigation - could be enhanced with a history stack
    navigateTo('home');
  }, [navigateTo]);

  return (
    <NavigationContext.Provider value={{ navigate, navigateWithParams, goHome, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}