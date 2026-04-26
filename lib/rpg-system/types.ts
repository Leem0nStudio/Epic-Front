export interface UnitStats {
  hp: number;
  atk: number;
  def: number;
  matk: number;
  mdef: number;
  agi: number;
}

export type BaseStats = UnitStats;
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
  parentJobId: string | null;
  statModifiers: UnitStats;
  allowedWeapons: string[];
  skillsUnlocked: SkillUnlocked[];
  passiveEffects: string[];
  evolutionRequirements: EvolutionRequirements;
}

export interface UnitData {
  id: string;
  player_id: string;
  name: string;
  level: number;
  baseStats: UnitStats;
  growthRates: UnitStats;
  affinity: Affinity;
  trait?: string;
  currentJobId: string;
  unlockedJobs: string[];
  equippedWeaponId?: string;
  equippedCardIds: string[];
  equippedSkillIds: string[];
}

export type RPGUnit = UnitData;
