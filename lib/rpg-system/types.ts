export type Affinity = 'physical' | 'magic' | 'support' | 'ranged';
export type Tier = 0 | 1 | 2 | 3;
export type WeaponCategory = 'sword' | 'staff' | 'bow' | 'dagger' | 'none';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  matk: number;
  mdef: number;
  agi: number;
}

export interface EvolutionRequirement {
  minLevel: number;
  materials: { itemId: string; amount: number }[];
  currencyCost: number;
}

export interface GameSkill {
  id: string;
  name: string;
  type: 'basic' | 'active' | 'burst' | 'ultimate' | 'passive';
  powerMod: number; // Multiplier on attack
  description: string;
}

export interface JobDefinition {
  id: string;
  name: string;
  tier: Tier;
  parentJobId: string | null;
  statModifiers: BaseStats; // Multipliers (e.g. 1.2 = +20%)
  allowedWeapons: WeaponCategory[];
  skillsUnlocked: GameSkill[];
  passiveEffects: string[];
  evolutionRequirements: EvolutionRequirement;
}

export interface RPGUnit {
  id: string;
  name: string;
  level: number;
  baseStats: BaseStats; // Starting stats at level 1
  growthRates: BaseStats; // Added per level
  affinity: Affinity;
  trait?: string; // Optional modifier name
  currentJobId: string;
  unlockedJobs: string[];
  
  // ==== BUILD COMPONENTS (GACHA) ====
  equippedWeaponId: string | null;
  equippedCardsIds: string[]; // e.g. Max 4
  equippedSkillsIds: string[]; // e.g. Max 3 active skills
}
