import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UnitData, JobDefinition } from './rpg-system/types';
import { gameDebugger } from './debug';

// Lazy initialization - validate at runtime, not at import
let _supabase: SupabaseClient | null = null;
let _initialized = false;
let _initError: string | null = null;

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured. Please set it in .env.local');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Please set it in .env.local');
  }

  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder') {
    throw new Error('Using placeholder Supabase credentials. Please configure real values in .env.local');
  }

  return { supabaseUrl, supabaseAnonKey };
}

function initializeSupabase() {
  if (_initialized) return _supabase;
  
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    gameDebugger.info('supabase', 'Initializing Supabase client', { url: supabaseUrl });
    
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'epic-front',
        },
      },
    });
    
    _initialized = true;
    return _supabase;
  } catch (e: any) {
    _initError = e.message;
    gameDebugger.error('supabase', 'Failed to initialize Supabase', e);
    throw e;
  }
}

// Export as a getter that initializes lazily
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_initialized && prop === 'then') return undefined;
    const client = initializeSupabase();
    return (client as any)[prop];
  },
  apply(_target, _thisArg, args) {
    const client = initializeSupabase();
    return (client as any)(...args);
  }
});

// Also export a function to check if initialized
export function isSupabaseConfigured(): boolean {
  try {
    getSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

export function getSupabaseError(): string | null {
  return _initError;
}

export type Player = {
  id: string;
  username: string;
  currency: number;
  premium_currency: number;
  party_size_limit: number;
  energy?: number;
  max_energy?: number;
  level?: number;
  exp?: number;
};

export type Unit = UnitData;
export type Job = JobDefinition;