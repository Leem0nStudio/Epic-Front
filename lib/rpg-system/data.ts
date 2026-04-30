import { JobDefinition } from './types';

export const INITIAL_JOBS: JobDefinition[] = [
    {
        id: 'novice',
        version: '1.0.0',
        name: 'Novice',
        tier: 0,
        parent_job_id: null,
        stat_modifiers: { hp: 1.0, atk: 1.0, def: 1.0, matk: 1.0, mdef: 1.0, agi: 1.0 },
        allowed_weapons: ['dagger', 'sword'],
        skills_unlocked: [
            { id: 'first_aid', name: 'First Aid', type: 'active', powerMod: 0.5, description: 'Small heal' }
        ],
        passive_effects: [],
        evolution_requirements: { minLevel: 1, materials: [], currencyCost: 0 }
    },
    {
        id: 'swordman',
        version: '1.0.0',
        name: 'Swordman',
        tier: 1,
        parent_job_id: 'novice',
        stat_modifiers: { hp: 1.2, atk: 1.15, def: 1.1, matk: 0.8, mdef: 0.9, agi: 1.0 },
        allowed_weapons: ['sword', 'spear'],
        skills_unlocked: [
            { id: 'bash', name: 'Bash', type: 'active', powerMod: 1.5, description: 'Strong physical strike' },
            { id: 'magnum_break', name: 'Magnum Break', type: 'burst', powerMod: 2.5, description: 'Fire AoE' }
        ],
        passive_effects: ['HP Recovery+10%'],
        evolution_requirements: { minLevel: 10, materials: [], currencyCost: 1000 }
    },
    {
        id: 'knight',
        version: '1.0.0',
        name: 'Knight',
        tier: 2,
        parent_job_id: 'swordman',
        stat_modifiers: { hp: 1.5, atk: 1.4, def: 1.3, matk: 0.7, mdef: 0.8, agi: 1.1 },
        allowed_weapons: ['sword', 'spear'],
        skills_unlocked: [
            { id: 'bowling_bash', name: 'Bowling Bash', type: 'active', powerMod: 3.0, description: 'Double hit physical' }
        ],
        passive_effects: ['Spear Mastery'],
        evolution_requirements: {
            minLevel: 40,
            materials: [],
            currencyCost: 5000,
            requiredJobCore: 'core_knight'
        }
    },
    // Tier 3 Jobs (Level 70+)
    {
        id: 'paladin',
        version: '1.0.0',
        name: 'Paladin',
        tier: 3,
        parent_job_id: 'knight',
        stat_modifiers: { hp: 1.8, atk: 1.2, def: 1.6, matk: 0.9, mdef: 1.3, agi: 0.8 },
        allowed_weapons: ['sword', 'mace'],
        skills_unlocked: [
            { id: 'holy_shield', name: 'Holy Shield', type: 'active', powerMod: 2.0, description: 'Holy damage + shield' },
            { id: 'divine_heal', name: 'Divine Heal', type: 'active', powerMod: 3.0, description: 'Powerful healing' }
        ],
        passive_effects: ['Holy Resistance+20%', 'Heal Bonus+15%'],
        evolution_requirements: {
            minLevel: 70,
            materials: [],
            currencyCost: 15000,
            requiredJobCore: 'core_paladin'
        }
    },
    {
        id: 'crusader',
        version: '1.0.0',
        name: 'Crusader',
        tier: 3,
        parent_job_id: 'knight',
        stat_modifiers: { hp: 2.0, atk: 1.4, def: 1.5, matk: 0.6, mdef: 1.0, agi: 0.7 },
        allowed_weapons: ['sword', 'spear'],
        skills_unlocked: [
            { id: 'grand_cross', name: 'Grand Cross', type: 'active', powerMod: 3.5, description: 'Holy AoE damage' },
            { id: 'defender', name: 'Defender', type: 'active', powerMod: 0, description: 'Physical damage reduction' }
        ],
        passive_effects: ['Physical Damage Reduction+10%'],
        evolution_requirements: {
            minLevel: 70,
            materials: [],
            currencyCost: 15000,
            requiredJobCore: 'core_crusader'
        }
    },
    {
        id: 'sage',
        version: '1.0.0',
        name: 'Sage',
        tier: 3,
        parent_job_id: 'wizard',
        stat_modifiers: { hp: 0.8, atk: 0.5, def: 0.6, matk: 2.2, mdef: 1.8, agi: 0.9 },
        allowed_weapons: ['staff', 'book'],
        skills_unlocked: [
            { id: 'lord_of_vermin', name: 'Lord of Vermin', type: 'active', powerMod: 5.0, description: 'Summon vermin army' },
            { id: 'stone_curse', name: 'Stone Curse', type: 'active', powerMod: 0, description: 'Petrify enemy' }
        ],
        passive_effects: ['SP Cost-15%', 'Status Effect Chance+10%'],
        evolution_requirements: {
            minLevel: 70,
            materials: [],
            currencyCost: 15000,
            requiredJobCore: 'core_sage'
        }
    },
    {
        id: 'archmage',
        version: '1.0.0',
        name: 'Archmage',
        tier: 3,
        parent_job_id: 'wizard',
        stat_modifiers: { hp: 0.6, atk: 0.5, def: 0.5, matk: 2.5, mdef: 1.6, agi: 1.0 },
        allowed_weapons: ['staff'],
        skills_unlocked: [
            { id: 'storm_gust', name: 'Storm Gust', type: 'active', powerMod: 4.5, description: 'Frost AoE damage' },
            { id: 'magic_rock', name: 'Magic Rock', type: 'active', powerMod: 0, description: 'Increase MATK' }
        ],
        passive_effects: ['MATK+10%', 'Frost Damage+20%'],
        evolution_requirements: {
            minLevel: 70,
            materials: [],
            currencyCost: 15000,
            requiredJobCore: 'core_archmage'
        }
    },
    // Tier 4 Jobs (Level 90+ Endgame)
    {
        id: 'arch_paladin',
        version: '1.0.0',
        name: 'Arch Paladin',
        tier: 4,
        parent_job_id: 'paladin',
        stat_modifiers: { hp: 2.2, atk: 1.3, def: 2.0, matk: 1.0, mdef: 1.5, agi: 0.7 },
        allowed_weapons: ['sword', 'mace'],
        skills_unlocked: [
            { id: 'sanctuary', name: 'Sanctuary', type: 'active', powerMod: 6.0, description: 'Ultimate holy AoE' },
            { id: 'divine_protection', name: 'Divine Protection', type: 'active', powerMod: 0, description: 'All healing bonus' }
        ],
        passive_effects: ['All Healing+25%', 'Holy Damage+15%'],
        evolution_requirements: {
            minLevel: 90,
            materials: [],
            currencyCost: 50000,
            requiredJobCore: 'core_arch_paladin'
        }
    },
    {
        id: 'grand_archmage',
        version: '1.0.0',
        name: 'Grand Archmage',
        tier: 4,
        parent_job_id: 'sage',
        stat_modifiers: { hp: 0.7, atk: 0.4, def: 0.5, matk: 3.0, mdef: 2.0, agi: 1.1 },
        allowed_weapons: ['staff', 'book'],
        skills_unlocked: [
            { id: 'meteor_storm', name: 'Meteor Storm', type: 'active', powerMod: 7.0, description: 'Ultimate fire storm' },
            { id: 'magic_mastery', name: 'Magic Mastery', type: 'active', powerMod: 0, description: 'All magic damage bonus' }
        ],
        passive_effects: ['All Magic Damage+20%', 'SP Recovery+15%'],
        evolution_requirements: {
            minLevel: 90,
            materials: [],
            currencyCost: 50000,
            requiredJobCore: 'core_grand_archmage'
        }
    }
];
