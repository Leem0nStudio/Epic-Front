import { RPGUnit } from './types';

export const SAMPLE_NOVICE: any = {
  id: 'unit_1',
  player_id: 'player_1',
  name: 'Arthur',
  level: 1,
  baseStats: { hp: 100, atk: 10, def: 10, matk: 10, mdef: 10, agi: 10 },
  growthRates: { hp: 10, atk: 1.5, def: 1.2, matk: 1.2, mdef: 1.2, agi: 1.2 },
  affinity: 'physical',
  currentJobId: 'novice',
  unlockedJobs: ['novice'],
  equippedWeaponId: undefined,
  equippedCardIds: [],
  equippedSkillIds: []
};
