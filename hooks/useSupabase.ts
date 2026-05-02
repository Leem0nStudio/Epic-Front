import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

// Configuración centralizada y validada
const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (url === 'https://placeholder.supabase.co' || key === 'placeholder') {
    throw new Error('Supabase configuration not properly set. Please configure your environment variables.');
  }

  return { url, key };
};

// Cache de clientes por usuario para evitar recreación
const clientCache = new Map<string, SupabaseClient>();

export function useSupabase(): SupabaseClient {
  const { user } = useAuthStore();

  return useMemo(() => {
    const config = getSupabaseConfig();
    const userId = user?.id;
    const cacheKey = userId || 'anonymous';

    if (clientCache.has(cacheKey)) {
      return clientCache.get(cacheKey)!;
    }

    const client = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: userId ? { 'X-User-ID': userId } : {},
      },
    });

    clientCache.set(cacheKey, client);
    return client;
  }, [user]);
}

// Función para limpiar cache (útil para logout)
export function clearSupabaseCache(): void {
  clientCache.clear();
}