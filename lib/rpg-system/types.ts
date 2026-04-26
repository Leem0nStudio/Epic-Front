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
  requiredJobCore?: string;
}

export interface SkillUnlocked {
  id: string;
  name: string;
  type: 'basic' | 'active' | 'burst' | 'ultimate';
  powerMod: number;
  description: string;
  cooldown?: number;
  effects?: any[];
}

export interface JobDefinition {
  id: string;
  version: string;
  name: string;
  tier: number;
  parent_job_id: string | null;
  stat_modifiers: UnitStats;
  allowed_weapons: string[];
  skills_unlocked: SkillUnlocked[];
  passive_effects: string[] | Record<string, string>; // Unified handling
  evolution_requirements: EvolutionRequirements;
}

export interface UnitData {
  id: string;
  player_id: string;
  name: string;
  level: number;
  base_stats: UnitStats;
  growth_rates: UnitStats;
  affinity: Affinity;
  trait?: string;
  current_job_id: string;
  unlocked_jobs: string[];
  equipped_weapon_instance_id?: string;
  equipped_card_instance_ids: string[];
  equipped_skill_instance_ids: string[];
}

export type RPGUnit = UnitData;

export const MAX_GACHA_SKILLS = 2;
export const MAX_JOB_SKILLS = 3;
export const MAX_PARTY_SIZE = 5;
