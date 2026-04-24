import { JobDefinition } from './types';

export const JOB_DATABASE: Record<string, JobDefinition> = {
  novice: {
    id: 'novice', version: '1.0.0', name: 'Novice', tier: 0, parentJobId: null,
    statModifiers: { hp: 1.0, atk: 1.0, def: 1.0, matk: 1.0, mdef: 1.0, agi: 1.0 },
    allowedWeapons: ['dagger', 'sword'],
    skillsUnlocked: [{ id: 'bash', name: 'Bash', type: 'basic', powerMod: 1.0, description: 'Ataque básico.' }],
    passiveEffects: [], evolutionRequirements: { minLevel: 1, materials: [], currencyCost: 0 }
  },
  swordman: {
    id: 'swordman', version: '1.0.0', name: 'Swordman', tier: 1, parentJobId: 'novice',
    statModifiers: { hp: 1.2, atk: 1.15, def: 1.1, matk: 0.8, mdef: 0.9, agi: 1.0 },
    allowedWeapons: ['sword'], skillsUnlocked: [], passiveEffects: [],
    evolutionRequirements: { minLevel: 10, materials: [], currencyCost: 1000 }
  },
  mage: {
    id: 'mage', version: '1.0.0', name: 'Mage', tier: 1, parentJobId: 'novice',
    statModifiers: { hp: 0.8, atk: 0.7, def: 0.8, matk: 1.4, mdef: 1.3, agi: 0.9 },
    allowedWeapons: ['staff'], skillsUnlocked: [], passiveEffects: [],
    evolutionRequirements: { minLevel: 10, materials: [], currencyCost: 1000 }
  }
};
