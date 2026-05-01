import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/hooks/useSupabase';
import { queryKeys } from '@/lib/query-client';
import { PlayerProfileSchema, UnitDataSchema, isValidPlayerProfile } from '@/lib/validation/schemas';

// Hook para obtener el perfil del jugador
export function usePlayerProfile() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.player.profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .single();

      if (error) throw error;

      if (!isValidPlayerProfile(data)) {
        throw new Error('Invalid player profile data');
      }

      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook para obtener unidades del jugador
export function usePlayerUnits() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.units.list,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('level', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook para obtener inventario
export function usePlayerInventory() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.inventory.list,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook para obtener party actual
export function usePlayerParty() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.party.current,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('party')
        .select('*, unit:units(*)')
        .order('slot_index');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook para regenerar energía
export function useRegenEnergy() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('rpc_regen_energy');
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch player profile
      queryClient.invalidateQueries({ queryKey: queryKeys.player.profile });
    },
  });
}

// Hook para reclamar recompensa diaria
export function useClaimDailyReward() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      currency: number;
      premium: number;
      exp: number;
    }) => {
      const { data, error } = await supabase.rpc('rpc_claim_daily_reward', {
        p_reward_currency: params.currency,
        p_reward_premium: params.premium,
        p_reward_exp: params.exp,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.player.profile });
    },
  });
}

// Hook para completar stage
export function useCompleteStage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      stageId: string;
      stars: number;
      turns: number;
      rewards: any;
      participatingUnits?: string[];
    }) => {
      const { data, error } = await supabase.rpc('rpc_complete_stage', {
        p_stage_id: params.stageId,
        p_stars: params.stars,
        p_turns: params.turns,
        p_rewards: params.rewards,
        p_participating_units: params.participatingUnits,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.player.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.units.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.progress });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.list });
    },
  });
}

// Hook para hacer pull de gacha
export function useGachaPull() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; currencyType: 'soft' | 'premium' }) => {
      const { data, error } = await supabase.rpc('rpc_pull_gacha', {
        p_amount: params.amount,
        p_currency_type: params.currencyType,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.player.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.gacha.state });
    },
  });
}