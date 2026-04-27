import { supabase } from '../supabase';
import { UnitService } from './unit-service';
import { CombatUnit, SkillDefinition, StatKey } from '../types/combat';
import { MAX_GACHA_SKILLS, MAX_JOB_SKILLS } from '../rpg-system/types';

export class CombatAdapter {
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
    if (skills.length === 0) {
      skills.push({
        id: 'basic_attack',
        name: 'Ataque Básico',
        type: 'active',
        cooldown: 0,
        effects: [{ type: 'damage', scaling: 'atk', power: 1.0, target: 'enemy' }]
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
      isTaunting: false,
      sprite_id: details.unit.sprite_id,
      icon_id: details.unit.icon_id
    };
  }

  static createFromUnit(unit: any, position: number): CombatUnit {
    const stats = {
      hp: unit.base_stats?.hp || 100,
      atk: unit.base_stats?.atk || 10,
      def: unit.base_stats?.def || 10,
      matk: unit.base_stats?.matk || 10,
      mdef: unit.base_stats?.mdef || 10,
      agi: unit.base_stats?.agi || 10,
    };
    return {
      id: unit.id || `u-${position}`,
      instanceId: unit.id || `u-${position}`,
      name: unit.name || 'Héroe',
      side: 'player',
      position,
      row: position < 3 ? 'front' : 'back',
      stats,
      currentHp: stats.hp,
      maxHp: stats.hp,
      burst: 0,
      skills: unit.skills || [{ id: 'basic_attack', name: 'Ataque Básico', type: 'active', cooldown: 0, effects: [{ type: 'damage', scaling: 'atk', power: 1.0, target: 'enemy' }] }],
      cooldowns: {},
      statusEffects: [],
      isDead: false,
      isStunned: false,
      isTaunting: false
    };
  }

  static createEnemy(id: string, name: string, level: number, position: number): CombatUnit {
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
      skills: [{ id: 'enemy_strike', name: 'Golpe Brutal', type: 'active', cooldown: 0, effects: [{ type: 'damage', scaling: 'atk', power: 1.1, target: 'enemy' }] }],
      cooldowns: {},
      statusEffects: [],
      isDead: false,
      isStunned: false,
      isTaunting: false
    };
  }
}
