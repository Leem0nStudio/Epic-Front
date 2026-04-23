import { JobDefinition } from './types';

// The Database defining the evolution tree paths
export const JOB_DATABASE: Record<string, JobDefinition> = {
  
  // TIER 0: Base Job
  novice: {
    id: 'novice',
    name: 'Novice',
    tier: 0,
    parentJobId: null,
    statModifiers: { hp: 1.0, atk: 1.0, def: 1.0, matk: 1.0, mdef: 1.0, agi: 1.0 },
    allowedWeapons: ['dagger', 'sword'],
    skillsUnlocked: [
      { id: 'bash', name: 'Bash', type: 'basic', powerMod: 1.0, description: 'Basic physical attack.' }
    ],
    passiveEffects: ['Play Dead: Can avoid combat once per stage.'],
    evolutionRequirements: { minLevel: 1, materials: [], currencyCost: 0 }
  },

  // TIER 1: Path branch 1 (Physical)
  swordman: {
    id: 'swordman',
    name: 'Swordman',
    tier: 1,
    parentJobId: 'novice',
    statModifiers: { hp: 1.2, atk: 1.15, def: 1.1, matk: 0.8, mdef: 0.9, agi: 1.0 },
    allowedWeapons: ['sword', 'dagger'],
    skillsUnlocked: [
      { id: 'magnum_break', name: 'Magnum Break', type: 'active', powerMod: 1.5, description: 'AoE Fire attack.' },
      { id: 'provoke', name: 'Provoke', type: 'active', powerMod: 0, description: 'Draws enemy aggro for 3 turns.' }
    ],
    passiveEffects: ['HP Recovery: Increases passive HP regen by 10%.'],
    evolutionRequirements: { minLevel: 10, materials: [], currencyCost: 1000 } // Costs 1000 gold when reaching lvl 10
  },

  // TIER 2: Path branch 1 (Physical)
  knight: {
    id: 'knight',
    name: 'Knight',
    tier: 2,
    parentJobId: 'swordman',
    statModifiers: { hp: 1.5, atk: 1.3, def: 1.4, matk: 0.7, mdef: 1.0, agi: 0.9 },
    allowedWeapons: ['sword'],
    skillsUnlocked: [
      { id: 'bowling_bash', name: 'Bowling Bash', type: 'burst', powerMod: 3.0, description: 'Massive AoE physical hit that knocks back enemies.' }
    ],
    passiveEffects: ['Peco Peco Ride: Mobility increased, allowing quicker turn priority.'],
    evolutionRequirements: { 
      minLevel: 40, 
      materials: [{ itemId: 'iron_ore', amount: 10 }, { itemId: 'badge_of_courage', amount: 1 }], 
      currencyCost: 5000 
    }
  },

  // TIER 3: Path branch 1 (Physical)
  rune_knight: {
    id: 'rune_knight',
    name: 'Rune Knight',
    tier: 3,
    parentJobId: 'knight',
    statModifiers: { hp: 2.0, atk: 1.8, def: 1.6, matk: 1.2, mdef: 1.3, agi: 1.1 },
    allowedWeapons: ['sword'],
    skillsUnlocked: [
      { id: 'dragon_breath', name: 'Dragon Breath', type: 'ultimate', powerMod: 5.0, description: 'Ultimate fire damage calculated based on current HP.' }
    ],
    passiveEffects: ['Rune Mastery: Can use magic combat runes to buff the party.'],
    evolutionRequirements: { 
      minLevel: 70, 
      materials: [{ itemId: 'rare_dragon_scale', amount: 5 }, { itemId: 'heroic_emblem', amount: 1 }], 
      currencyCost: 50000 
    }
  },

  // TIER 1: Path branch 2 (Magical)
  mage: {
    id: 'mage',
    name: 'Mage',
    tier: 1,
    parentJobId: 'novice',
    statModifiers: { hp: 0.8, atk: 0.7, def: 0.8, matk: 1.4, mdef: 1.3, agi: 0.9 },
    allowedWeapons: ['staff', 'dagger'],
    skillsUnlocked: [
      { id: 'fire_bolt', name: 'Fire Bolt', type: 'active', powerMod: 1.8, description: 'Calls down bolts of fire from the sky.' }
    ],
    passiveEffects: ['SP Recovery: Increases mana regeneration per turn.'],
    evolutionRequirements: { minLevel: 10, materials: [], currencyCost: 1000 }
  },

  // TIER 2: Path branch 2 (Magical)
  wizard: {
    id: 'wizard',
    name: 'Wizard',
    tier: 2,
    parentJobId: 'mage',
    statModifiers: { hp: 0.85, atk: 0.6, def: 0.8, matk: 1.8, mdef: 1.5, agi: 1.0 },
    allowedWeapons: ['staff'],
    skillsUnlocked: [
      { id: 'storm_gust', name: 'Storm Gust', type: 'burst', powerMod: 3.5, description: 'Massive AoE blizzard that can freeze targets.' }
    ],
    passiveEffects: ['Area Magic Mastery: Cast times for AoE spells reduced by 20%.'],
    evolutionRequirements: { 
      minLevel: 40, 
      materials: [{ itemId: 'magic_crystal', amount: 10 }, { itemId: 'spellbook_page', amount: 5 }], 
      currencyCost: 5000 
    }
  },

  // TIER 3: Path branch 2 (Magical)
  warlock: {
    id: 'warlock',
    name: 'Warlock',
    tier: 3,
    parentJobId: 'wizard',
    statModifiers: { hp: 1.0, atk: 0.5, def: 1.0, matk: 2.5, mdef: 2.0, agi: 1.1 },
    allowedWeapons: ['staff'],
    skillsUnlocked: [
      { id: 'comet', name: 'Comet', type: 'ultimate', powerMod: 6.0, description: 'Devastating cosmic ultimate attack that burns enemies.' }
    ],
    passiveEffects: ['Reading Spellbook: Can store magic spells for instant cast out of turn.'],
    evolutionRequirements: { 
      minLevel: 70, 
      materials: [{ itemId: 'rare_meteor_fragment', amount: 5 }, { itemId: 'ancient_grimoire', amount: 1 }], 
      currencyCost: 50000 
    }
  }
};
