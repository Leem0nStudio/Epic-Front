// Player Authentication Utilities
// Shared helper functions for player ownership validation

import { supabase } from '@/lib/supabase';

export async function getCurrentPlayerId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function getPlayerIdWithValidation(requiredPlayerId?: string): Promise<string> {
  const playerId = requiredPlayerId || await getCurrentPlayerId();
  if (!playerId) {
    throw new Error('Player not authenticated');
  }
  return playerId;
}