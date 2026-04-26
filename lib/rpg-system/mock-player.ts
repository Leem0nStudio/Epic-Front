import { RPGUnit } from './types';

export const SAMPLE_NOVICE: any = {
  id: 'unit_1',
  player_id: 'player_1',
  name: 'Arthur',
  level: 1,
  base_stats: { hp: 100, atk: 10, def: 10, matk: 10, mdef: 10, agi: 10 },
  growth_rates: { hp: 10, atk: 1.5, def: 1.2, matk: 1.2, mdef: 1.2, agi: 1.2 },
  affinity: 'physical',
  current_job_id: 'novice',
  unlocked_jobs: ['novice'],
  equipped_weapon_instance_id: undefined,
  equipped_card_instance_ids: [],
  equipped_skill_instance_ids: []
};
