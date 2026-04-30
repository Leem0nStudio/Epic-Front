import { EnemyTemplate } from './campaign-types';

// Simplified fallback enemy templates (Ragnarok-style)
// Used when DB `enemy_templates` table is unavailable
export const ENEMY_TEMPLATES_FALLBACK: Record<string, EnemyTemplate> = {
    'slime_1': {
        id: 'slime_1',
        name: 'Limo Débil',
        level: 1,
        position: 0,
        skillIds: ['basic_attack']
    },
    'slime_2': {
        id: 'slime_2',
        name: 'Limo Pegajoso',
        level: 2,
        position: 1,
        skillIds: ['basic_attack', 'debuff_slow']
    },
    'bat_1': {
        id: 'bat_1',
        name: 'Murciélago',
        level: 2,
        position: 0,
        skillIds: ['basic_attack']
    },
    'skeleton_1': {
        id: 'skeleton_1',
        name: 'Esqueleto Guerrero',
        level: 3,
        position: 0,
        skillIds: ['basic_attack', 'taunt']
    },
    'skeleton_2': {
        id: 'skeleton_2',
        name: 'Esqueleto Guerrero',
        level: 3,
        position: 2,
        skillIds: ['basic_attack', 'taunt']
    },
    'ghost_1': {
        id: 'ghost_1',
        name: 'Espectro',
        level: 4,
        position: 1,
        skillIds: ['basic_attack', 'debuff_poison']
    },
    'spirit_1': {
        id: 'spirit_1',
        name: 'Espíritu de Luz',
        level: 8,
        position: 1,
        skillIds: ['aoe_damage', 'heal']
    },
    'knight_40': {
        id: 'knight_40',
        name: 'Caballero Lv40',
        level: 40,
        position: 0,
        skillIds: ['bash', 'taunt']
    },
    'mage_40': {
        id: 'mage_40',
        name: 'Mago Lv40',
        level: 40,
        position: 0,
        skillIds: ['fire_bolt', 'ice_arrow']
    }
};
