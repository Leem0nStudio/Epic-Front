import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingService } from '@/lib/services/onboarding-service';
import { UnitService } from '@/lib/services/unit-service';
import { RecruitmentService } from '@/lib/services/recruitment-service';
import { PartyService } from '@/lib/services/party-service';
import { GachaService } from '@/lib/services/gacha-service';
import { EquipmentService } from '@/lib/services/equipment-service';

export type ViewType = 'home' | 'tavern' | 'party' | 'unit_details' | 'gacha' | 'inventory' | 'battle';

export function useGameState() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [party, setParty] = useState<any[]>([]);
  const [tavernSlots, setTavernSlots] = useState<any[]>([]);
  const [view, setView] = useState<ViewType>('home');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [targetSlot, setTargetSlot] = useState<'weapon' | 'card' | 'skill' | null>(null);

  const navigateTo = (newView: ViewType) => setView(newView);

  const refreshState = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (prof) setProfile(prof);

    const { data: units } = await supabase.from('units').select('*');
    setRoster(units || []);

    const { data: partySlots } = await supabase.from('party_slots').select('*, unit:units(*)').order('slot_index');
    setParty(partySlots || []);

    const { data: recruits } = await supabase.from('recruitment_slots').select('*').eq('is_claimed', false);
    setTavernSlots(recruits || []);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    async function loadGame() {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (!prof) {
        await OnboardingService.initializePlayer(user.email?.split('@')[0] || "New Hero");
        return loadGame();
      }

      await refreshState();
      setIsLoaded(true);
    }

    loadGame();
  }, []);

  const handleSelectUnit = (id: string) => {
    setSelectedUnitId(id);
    setView('unit_details');
  };

  const handleOpenInventory = (slot: 'weapon' | 'card' | 'skill') => {
    setTargetSlot(slot);
    setView('inventory');
  };

  const handleEquipItem = async (item: any) => {
    if (!selectedUnitId || !targetSlot) return;
    try {
        await EquipmentService.equipItem(selectedUnitId, item.id, targetSlot);
        await refreshState();
        setView('unit_details');
    } catch (e: any) {
        alert(e.message);
    }
  };

  // --- TAVERN RECRUITMENT ---
  const handleClaimRecruit = async (slotId: string) => {
    try {
      await RecruitmentService.claimRecruit(slotId);
      await refreshState();
    } catch (e) {
      console.error(e);
    }
  };

  // --- PARTY SYSTEM ---
  const handleAssignPartySlot = async (slotIndex: number, unitId: string | null) => {
    try {
      await PartyService.assignToParty(slotIndex, unitId);
      await refreshState();
    } catch (e) {
      console.error(e);
    }
  };

  // Derive useful state
  const selectedUnit = roster.find((u) => u.id === selectedUnitId) || null;
  const activePartyUnits = Array(5).fill(null).map((_, i) => party.find(p => p.slot_index === i)?.unit || null);

  return {
    state: {
      isLoaded,
      profile,
      roster,
      party,
      tavernSlots,
      view,
      selectedUnitId,
      selectedUnit,
      activePartyUnits,
      targetSlot
    },
    actions: {
      navigateTo,
      handleSelectUnit,
      handleClaimRecruit,
      handleAssignPartySlot,
      handleOpenInventory,
      handleEquipItem,
      refreshState
    }
  };
}
