import { UnitStats } from './types';

export interface TraitDefinition {
    id: string;
    name: string;
    description: string;
    growthModifiers: Partial<UnitStats>;
    statBonuses?: Partial<UnitStats>;
}

export const TRAITS_DATABASE: Record<string, TraitDefinition> = {
    'strong': {
        id: 'strong',
        name: 'Strong',
        description: '+10% ATK Growth',
        growthModifiers: { atk: 1.10 }
    },
    'arcane': {
        id: 'arcane',
        name: 'Arcane',
        description: '+15% MATK Growth',
        growthModifiers: { matk: 1.15 }
    },
    'durable': {
        id: 'durable',
        name: 'Durable',
        description: '+10% HP Growth',
        growthModifiers: { hp: 1.10 }
    },
    'nimble': {
        id: 'nimble',
        name: 'Nimble',
        description: '+10% AGI Growth',
        growthModifiers: { agi: 1.10 }
    },
    'bulwark': {
        id: 'bulwark',
        name: 'Bulwark',
        description: '+15% DEF Growth',
        growthModifiers: { def: 1.15 }
    }
};

export const TRAIT_ID_LIST = Object.keys(TRAITS_DATABASE);
