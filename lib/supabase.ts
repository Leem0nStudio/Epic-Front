import { createClient } from '@supabase/supabase-js';
import { UnitData, JobDefinition } from './rpg-system/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  username: string;
  currency: number;
  premium_currency: number;
  party_size_limit: number;
};

// Use the consolidated types from the RPG system
export type Unit = UnitData;
export type Job = JobDefinition;
