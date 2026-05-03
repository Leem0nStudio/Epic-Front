import { supabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore } from '@/lib/stores/auth-store';
import { gameDebugger } from '@/lib/debug';
import { useMemo } from 'react';

// Use the global supabase client - no separate instance needed
export function useSupabase(): SupabaseClient {
  const { user } = useAuthStore();

  const client = useMemo(() => {
    if (user) {
      gameDebugger.info('supabase', 'User authenticated, returning client', { userId: user.id });
    } else {
      gameDebugger.info('supabase', 'No user, returning client');
    }
    return supabase;
  }, [user]);

  return client;
}

// Legacy export for compatibility
export { supabase as defaultSupabase } from '@/lib/supabase';

// Función para limpiar cache (útil para logout)
export function clearSupabaseCache(): void {
  gameDebugger.info('auth', 'Clearing supabase cache');
}