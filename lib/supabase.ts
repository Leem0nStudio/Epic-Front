import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  username: string;
  currency: number;
  premium_currency: number;
  party_size_limit: number;
};

export type Unit = {
  id: string;
  player_id: string;
  name: string;
  level: number;
  base_stats: any;
  growth_rates: any;
  affinity: string;
  trait: string;
  current_job_id: string;
  unlocked_jobs: string[];
  equipped_weapon_instance_id?: string;
  equipped_card_instance_ids: string[];
  equipped_skill_instance_ids: string[];
};

export type Job = {
    id: string;
    version: string;
    name: string;
    tier: number;
    parent_job_id: string | null;
    stat_modifiers: any;
    allowed_weapons: string[];
    skills_unlocked: any;
    passive_effects: string[];
    evolution_requirements: any;
};
