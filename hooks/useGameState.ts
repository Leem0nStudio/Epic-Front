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
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('units').select('*'),
            supabase.from('party_slots').select('*, unit:units(*)').order('slot_index'),
            supabase.from('recruitment_slots').select('*').eq('is_claimed', false)
        ]);

        if (profRes.data) setProfile(profRes.data);
        setRoster(unitsRes.data || []);
        setParty(partyRes.data || []);
        setTavernSlots(recruitsRes.data || []);

        if (profRes.error && profRes.error.code !== 'PGRST116') console.error("Error loading profile:", profRes.error);
        if (unitsRes.error) console.error("Error loading units:", unitsRes.error);
        if (partyRes.error) console.error("Error loading party:", partyRes.error);
        if (recruitsRes.error) console.error("Error loading recruits:", recruitsRes.error);
    } catch (e) {
        console.error("Critical error in refreshState:", e);
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!supabase) return;

    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsAuthLoading(false);
    });

    // 2. Listen for changes
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

        const { data: prof, error: profError } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (profError && profError.code !== 'PGRST116') { // PGRST116 is "no rows found"
          setError("Error al cargar perfil: " + profError.message);
          return;
        }

        if (!prof) {
          try {
            await OnboardingService.initializePlayer(user.email?.split('@')[0] || "Héroe");
            // Fetch profile again after onboarding
            const { data: newProf } = await supabase.from('profiles').select('*').eq('id', user.id).single();
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
      isAuthLoading,
      isAuthenticated,
      error,
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
