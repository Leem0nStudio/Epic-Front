import { JobDefinition } from './types';

/**
 * Static Job Definitions.
 * Note: In production these should be fetched from the 'jobs' table.
 */
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
        allowed_weapons: ['sword', 'dagger'],
        skills_unlocked: [
            { id: 'bash', name: 'Bash', type: 'active', powerMod: 1.5, description: 'Strong physical strike' }
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
        stat_modifiers: { hp: 1.5, atk: 1.3, def: 1.4, matk: 0.7, mdef: 1.0, agi: 0.9 },
        allowed_weapons: ['sword'],
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
    {
        id: 'mage',
        version: '1.0.0',
        name: 'Mage',
        tier: 1,
        parent_job_id: 'novice',
        stat_modifiers: { hp: 0.8, atk: 0.7, def: 0.8, matk: 1.4, mdef: 1.3, agi: 0.9 },
        allowed_weapons: ['staff', 'dagger'],
        skills_unlocked: [
            { id: 'fire_bolt', name: 'Fire Bolt', type: 'active', powerMod: 1.8, description: 'Fire magic strike' }
        ],
        passive_effects: [],
        evolution_requirements: { minLevel: 10, materials: [], currencyCost: 1000 }
    }
];
