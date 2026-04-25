import { supabase } from '../supabase';
import { UnitService } from './unit-service';
import { CombatUnit, SkillDefinition, StatKey } from '../types/combat';

export class CombatAdapter {
  /**
   * Fetches full data for a unit and converts it to a CombatUnit.
   */
  static async dbUnitToCombatUnit(
    unitId: string,
    side: 'player' | 'enemy',
    position: number
  ): Promise<CombatUnit> {
    const details = await UnitService.getUnitDetails(unitId);

    // Convert final stats to the structure we need
    const stats = {
      hp: details.finalStats.hp,
      atk: details.finalStats.atk,
      def: details.finalStats.def,
      matk: details.finalStats.matk,
      mdef: details.finalStats.mdef,
      agi: details.finalStats.agi,
    };

    // Skills conversion (ensure they match the SkillDefinition interface)
    const skills: SkillDefinition[] = (details.skills || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      type: s.type || 'active',
      cooldown: s.cooldown || 0,
      effects: s.effects || [],
      description: s.description
    }));

    // Add a basic attack skill if none exists
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
   * Creates a sample enemy CombatUnit.
   */
  static createEnemy(
    id: string,
    name: string,
    level: number,
    position: number
  ): CombatUnit {
    const baseStats = {
      hp: 100 + (level * 20),
      atk: 15 + (level * 3),
      def: 10 + (level * 2),
      matk: 5 + (level * 2),
      mdef: 5 + (level * 2),
      agi: 8 + Math.floor(level / 2)
    };

    return {
      id,
      instanceId: id,
      name,
      side: 'enemy',
      position,
      row: position < 3 ? 'front' : 'back',
      stats: baseStats,
      currentHp: baseStats.hp,
      maxHp: baseStats.hp,
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
