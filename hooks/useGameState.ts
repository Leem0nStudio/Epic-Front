import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingService } from '@/lib/services/onboarding-service';
import { UnitService } from '@/lib/services/unit-service';
import { RecruitmentService } from '@/lib/services/recruitment-service';
import { PartyService } from '@/lib/services/party-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { ConfigService } from '@/lib/services/config-service';

export type ViewType = 'home' | 'tavern' | 'party' | 'unit_details' | 'gacha' | 'inventory' | 'battle' | 'campaign' | 'stage_details';

export function useGameState() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        const [profRes, unitsRes, partyRes, recruitsRes] = await Promise.all([
            supabase.from('players').select('*').eq('id', user.id).single(),
            supabase.from('units').select('*'),
            supabase.from('party').select('*, unit:units(*)').eq('player_id', user.id).order('slot_index'),
            supabase.from('recruitment_queue').select('*').eq('player_id', user.id).eq('is_claimed', false)
        ]);

        if (profRes.data) setProfile(profRes.data);
        setRoster(unitsRes.data || []);
        setParty(partyRes.data || []);
        setTavernSlots(recruitsRes.data || []);
    } catch (e) {
        console.error("Critical error in refreshState:", e);
    }
  };

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setProfile(null);
        setIsLoaded(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadGame() {
      if (!supabase || !isAuthenticated) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Sync Balance Patch config first
        await ConfigService.syncConfig();

        const { data: prof, error: profError } = await supabase.from('players').select('*').eq('id', user.id).single();

        if (profError && profError.code !== 'PGRST116') {
          setError("Error al cargar perfil: " + profError.message);
          return;
        }

        if (!prof) {
          try {
            await OnboardingService.initializePlayer(user.email?.split('@')[0] || "Héroe");
            const { data: newProf } = await supabase.from('players').select('*').eq('id', user.id).single();
            if (!newProf) throw new Error("No se pudo crear el perfil.");
            setProfile(newProf);
          } catch (initErr: any) {
            setError("Error en Onboarding: " + initErr.message);
            return;
          }
        } else {
          setProfile(prof);
        }

        await refreshState();
        setIsLoaded(true);
      } catch (e: any) {
        console.error("Initialization error:", e);
        setError("Error inesperado: " + (e.message || "Desconocido"));
      }
    }

    loadGame();
  }, [isAuthenticated]);

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

  const handleClaimRecruit = async (slotId: string) => {
    try {
      await RecruitmentService.claimRecruit(slotId);
      await refreshState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignPartySlot = async (slotIndex: number, unitId: string | null) => {
    try {
      await PartyService.assignToParty(slotIndex, unitId);
      await refreshState();
    } catch (e) {
      console.error(e);
    }
  };

  const activePartyUnits = Array(5).fill(null).map((_, i) => party.find(p => p.slot_index === i)?.unit || null);

  return {
    state: {
      isLoaded,
      isAuthLoading,
      isAuthenticated,
      error,
      profile,
      roster,
      party,
      tavernSlots,
      view,
      selectedUnitId,
      activePartyUnits,
      targetSlot,
      version: ConfigService.getActiveVersion()
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
