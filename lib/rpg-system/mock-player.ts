import { RPGUnit } from './types';

// The blank slate character.
export const SAMPLE_NOVICE: RPGUnit = {
  id: 'unit_hero_01',
  name: 'Hero',
  level: 1,
  baseStats: { 
    hp: 100, 
    atk: 20, 
    def: 15, 
    matk: 10, 
    mdef: 10, 
    agi: 10 
  },
  growthRates: { 
    hp: 12.5, 
    atk: 2.2, 
    def: 1.8, 
    matk: 1.5, 
    mdef: 1.5, 
    agi: 1.2 
  },
  affinity: 'physical',
  trait: 'Determined', // Minor passive
  currentJobId: 'novice',
  unlockedJobs: ['novice'],
  equippedWeaponId: null,
  equippedCardsIds: [],
  equippedSkillsIds: []
};
