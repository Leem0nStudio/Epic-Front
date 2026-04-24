import { useState, useEffect } from 'react';
import { PlayerSaveData, initializeNewPlayer } from '@/lib/rpg-system/player-onboarding';
import { RPGUnit } from '@/lib/rpg-system/types';
import { claimRecruit, discardRecruit, TavernQueueSlot } from '@/lib/rpg-system/recruitment';
import { assignUnitToParty, removeUnitFromParty, swapPartyPositions } from '@/lib/rpg-system/party-system';
import { PartyService } from '@/lib/services/party-service';

export type ViewType = 'home' | 'tavern' | 'party' | 'unit_details' | 'gacha' | 'inventory' | 'battle';

export function useGameState(onUnauthorized?: () => void) {
  const [saveData, setSaveData] = useState<PlayerSaveData | null>(() => {
    // In a real app, you would check if local storage or Supabase has a save.
    // If not, onboard them.
    return initializeNewPlayer();
  });
  const [view, setView] = useState<ViewType>('home');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const navigateTo = (newView: ViewType) => setView(newView);

  const handleSelectUnit = (id: string) => {
    setSelectedUnitId(id);
    setView('unit_details');
  };

  // --- TAVERN RECRUITMENT ---
  const handleClaimRecruit = (queueId: string) => {
    if (!saveData) return;
    try {
      const { newRoster, newQueueList } = claimRecruit(saveData.roster, saveData.tavernQueue, queueId);
      setSaveData({ ...saveData, roster: newRoster, tavernQueue: newQueueList });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscardRecruit = (queueId: string) => {
    if (!saveData) return;
    try {
      const newQueueList = discardRecruit(saveData.tavernQueue, queueId);
      setSaveData({ ...saveData, tavernQueue: newQueueList });
    } catch (e) {
      console.error(e);
    }
  };

  // --- PARTY SYSTEM ---
  const handleAssignPartySlot = async (unitId: string, slotIndex: number) => {
    if (!saveData) return;
    try {
      await PartyService.assignToParty(slotIndex, unitId);
      const newParty = assignUnitToParty(saveData.party, unitId, slotIndex);
      setSaveData({ ...saveData, party: newParty });
    } catch (e: any) {
      if (e.message === "Not authenticated" && onUnauthorized) {
        onUnauthorized();
      } else {
        console.error('Failed to assign to party:', e);
      }
    }
  };

  const handleRemovePartySlot = async (slotIndex: number) => {
    if (!saveData) return;
    try {
      await PartyService.assignToParty(slotIndex, null);
      const newParty = removeUnitFromParty(saveData.party, slotIndex);
      setSaveData({ ...saveData, party: newParty });
    } catch (e: any) {
      if (e.message === "Not authenticated" && onUnauthorized) {
        onUnauthorized();
      } else {
        console.error('Failed to remove from party:', e);
      }
    }
  };

  const handleSwapPartySlots = (index1: number, index2: number) => {
    if (!saveData) return;
    const newParty = swapPartyPositions(saveData.party, index1, index2);
    setSaveData({ ...saveData, party: newParty });
  };

  // Derive useful state
  const selectedUnit = saveData?.roster.find((u) => u.id === selectedUnitId) || null;
  const activePartyUnits = saveData?.party.map(id => id ? saveData.roster.find(u => u.id === id) || null : null) || [];

  return {
    state: {
      isLoaded: !!saveData,
      saveData,
      view,
      selectedUnit,
      activePartyUnits
    },
    actions: {
      navigateTo,
      handleSelectUnit,
      handleClaimRecruit,
      handleDiscardRecruit,
      handleAssignPartySlot,
      handleRemovePartySlot,
      handleSwapPartySlots
    }
  };
}
