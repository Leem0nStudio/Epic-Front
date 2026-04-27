export interface UnitStats {
  hp: number;
  atk: number;
  def: number;
  matk: number;
  mdef: number;
  agi: number;
}

export type BaseStats = UnitStats;
export type StatKey = keyof UnitStats;

export type Affinity = 'physical' | 'magic' | 'support' | 'ranged';
export type WeaponCategory = 'sword' | 'staff' | 'dagger' | 'bow' | 'spear' | 'shield';

export interface EvolutionRequirements {
  minLevel: number;
  materials: { itemId: string; amount: number }[];
  currencyCost: number;
  requiredJobCore?: string; // New: Job Core requirement
}

export interface SkillUnlocked {
  id: string;
  name: string;
  type: 'basic' | 'active' | 'burst' | 'ultimate';
  powerMod: number;
  description: string;
  // Metadata for combat engine
  cooldown?: number;
  effects?: any[];
}

export interface JobDefinition {
  id: string;
  version: string;
  name: string;
  tier: number;
  parent_job_id: string | null;
  stat_modifiers: UnitStats; // These act as multipliers (e.g. 1.2 = +20%)
  allowed_weapons: string[];
  skills_unlocked: SkillUnlocked[];
  passive_effects: string[];
  evolution_requirements: EvolutionRequirements;
}

export interface UnitData {
  id: string;
  player_id: string;
  name: string;
  level: number;
  base_stats: UnitStats; // Stats at level 1
  growth_rates: UnitStats; // Growth per level
  affinity: Affinity;
  trait?: string;
  current_job_id: string;
  unlocked_jobs: string[];
  equipped_weapon_instance_id?: string;
  equipped_card_instance_ids: string[]; // Max 3? (Usually cards are tied to weapons/gear but let's stick to unit for now)
  equipped_skill_instance_ids: string[]; // Max 2 from Gacha
  sprite_id?: string;
  icon_id?: string;
}

export type RPGUnit = UnitData;

// Shared constants
export const MAX_GACHA_SKILLS = 2;
export const MAX_JOB_SKILLS = 3;
export const MAX_PARTY_SIZE = 5;
