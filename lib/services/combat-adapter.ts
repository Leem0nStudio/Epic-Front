import { supabase } from '../supabase';
import { UnitService } from './unit-service';
import { CombatUnit, SkillDefinition, StatKey } from '../types/combat';
import { MAX_GACHA_SKILLS, MAX_JOB_SKILLS } from '../rpg-system/types';

export class CombatAdapter {
  /**
   * Fetches full data for a unit and converts it to a CombatUnit.
   * Merges Job skills (fixed) and Gacha skills (equippable).
   */
  static async dbUnitToCombatUnit(
    unitId: string,
    side: 'player' | 'enemy',
    position: number
  ): Promise<CombatUnit> {
    const details = await UnitService.getUnitDetails(unitId);

    const stats = {
      hp: details.finalStats.hp,
      atk: details.finalStats.atk,
      def: details.finalStats.def,
      matk: details.finalStats.matk,
      mdef: details.finalStats.mdef,
      agi: details.finalStats.agi,
    };

    // 1. Get Job Skills (up to MAX_JOB_SKILLS)
    const jobSkills: SkillDefinition[] = (details.job.skills_unlocked || [])
      .slice(0, MAX_JOB_SKILLS)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        type: (s.type === 'ultimate' || s.type === 'burst') ? 'burst' : 'active',
        cooldown: s.cooldown || 0,
        effects: s.effects || [{
          type: 'damage',
          scaling: details.unit.affinity === 'magic' ? 'matk' : 'atk',
          power: s.powerMod || 1.0,
          target: 'enemy'
        }],
        description: s.description
      }));

    // 2. Get Equipped Gacha Skills (up to MAX_GACHA_SKILLS)
    const gachaSkills: SkillDefinition[] = (details.skills || [])
      .slice(0, MAX_GACHA_SKILLS)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.skillType === 'burst' ? 'burst' : 'active',
        cooldown: s.cooldown || 0,
        effects: s.effects || [{
          type: 'damage',
          scaling: s.scaling?.stat || 'atk',
          power: s.scaling?.multiplier || 1.0,
          target: 'enemy'
        }],
        description: s.description
      }));

    const skills = [...jobSkills, ...gachaSkills];

    // Add a basic attack if no skills exist (shouldn't happen with Job skills)
    if (skills.length === 0) {
      skills.push({
        id: 'basic_attack',
        name: 'Ataque Básico',
        type: 'active',
        cooldown: 0,
        effects: [{
          type: 'damage',
          scaling: 'atk',
          power: 1.0,
          target: 'enemy'
        }]
      });
    }

    return {
      id: unitId,
      instanceId: unitId,
      name: details.unit.name,
      side,
      position,
      row: position < 3 ? 'front' : 'back',
      stats,
      currentHp: stats.hp,
      maxHp: stats.hp,
      burst: 0,
      skills,
      cooldowns: {},
      statusEffects: [],
      isDead: false,
      isStunned: false,
      isTaunting: false
    };
  }

  /**
   * Creates a sample enemy CombatUnit with balanced early-game scaling.
   */
  static createEnemy(
    id: string,
    name: string,
    level: number,
    position: number
  ): CombatUnit {
    const base_stats = {
      hp: Math.floor(60 + (level * 12)),
      atk: Math.floor(6 + (level * 1.5)),
      def: Math.floor(4 + (level * 1.2)),
      matk: Math.floor(4 + (level * 1.2)),
      mdef: Math.floor(4 + (level * 1.2)),
      agi: Math.floor(4 + (level * 0.8))
    };

    return {
      id,
      instanceId: id,
      name,
      side: 'enemy',
      position,
      row: position < 3 ? 'front' : 'back',
      stats: base_stats,
      currentHp: base_stats.hp,
      maxHp: base_stats.hp,
      burst: 0,
      skills: [{
        id: 'enemy_strike',
        name: 'Golpe Brutal',
        type: 'active',
        cooldown: 0,
        effects: [{
          type: 'damage',
          scaling: 'atk',
          power: 1.1,
          target: 'enemy'
        }]
      }],
      cooldowns: {},
      statusEffects: [],
      isDead: false,
      isStunned: false,
      isTaunting: false
    };
  }
}
