import { BaseStats } from './types';

export interface TraitDefinition {
    id: string;
    name: string;
    description: string;
    growthModifiers: Partial<BaseStats>;
}

export const TRAITS_DATABASE: Record<string, TraitDefinition> = {
    strong: {
        id: 'strong',
        name: 'Strong',
        description: '+10% Physical Attack Growth',
        growthModifiers: { atk: 1.1 }
    },
    arcane: {
        id: 'arcane',
        name: 'Arcane',
        description: '+15% Magic Attack Growth',
        growthModifiers: { matk: 1.15 }
    },
    durable: {
        id: 'durable',
        name: 'Durable',
        description: '+10% HP Growth',
        growthModifiers: { hp: 1.1 }
    },
    swift: {
        id: 'swift',
        name: 'Swift',
        description: '+10% Agility Growth',
        growthModifiers: { agi: 1.1 }
    },
    clumsy: {
        id: 'clumsy',
        name: 'Clumsy',
        description: '-10% Agility Growth, +15% HP Growth',
        growthModifiers: { agi: 0.9, hp: 1.15 }
    },
    genius: {
        id: 'genius',
        name: 'Genius',
        description: '+5% to all Magic growths',
        growthModifiers: { matk: 1.05, mdef: 1.05 }
    }
};

export const TRAIT_ID_LIST = Object.keys(TRAITS_DATABASE);
