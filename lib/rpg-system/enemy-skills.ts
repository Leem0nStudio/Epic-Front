import { SkillDefinition } from '../types/combat';

export const ENEMY_SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  'basic_attack': {
    id: 'basic_attack',
    name: 'Ataque Básico',
    type: 'active',
    cooldown: 0,
    effects: [{ type: 'damage', scaling: 'atk', power: 1.0, target: 'enemy' }]
  },
  'aoe_damage': {
    id: 'aoe_damage',
    name: 'Impacto Devastador',
    type: 'active',
    cooldown: 3,
    effects: [{ type: 'damage', scaling: 'atk', power: 1.2, target: 'all_enemies' }],
    description: 'Golpea a todos los enemigos.'
  },
  'heal': {
    id: 'heal',
    name: 'Regeneración Oscura',
    type: 'active',
    cooldown: 4,
    effects: [{ type: 'heal', scaling: 'matk', power: 2.0, target: 'self' }],
    description: 'Recupera HP.'
  },
  'taunt': {
    id: 'taunt',
    name: 'Provocación',
    type: 'active',
    cooldown: 5,
    effects: [{ type: 'taunt', target: 'self', duration: 2 }],
    description: 'Atrae los ataques enemigos.'
  },
  'debuff_slow': {
    id: 'debuff_slow',
    name: 'Limo Pegajoso',
    type: 'active',
    cooldown: 3,
    effects: [{
      type: 'apply_status',
      target: 'enemy',
      status: 'slow',
      chance: 1.0,
      duration: 2
    }],
    description: 'Reduce la agilidad del objetivo.'
  },
  'debuff_poison': {
    id: 'debuff_poison',
    name: 'Nube Tóxica',
    type: 'active',
    cooldown: 3,
    effects: [{
      type: 'apply_status',
      target: 'all_enemies',
      status: 'poison',
      chance: 0.5,
      duration: 3
    }],
    description: 'Envenena a los enemigos.'
  }
};
