import { BaseStats, WeaponCategory } from './types';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type GachaItemType = 'card' | 'weapon' | 'skill' | 'job_core' | 'cosmetic';

export interface BaseGachaItem {
    id: string;
    name: string;
    description: string;
    type: GachaItemType;
    rarity: Rarity;
}

// ==== CARDS ====
export type CardEffectType = 'statBoost' | 'conditionalEffect' | 'skillModifier';
export interface CardItem extends BaseGachaItem {
    type: 'card';
    effectType: CardEffectType;
    effectTarget: string; // e.g., 'atk', 'hp', 'bleed_chance', 'crit_rate'
    effectValue: number; // e.g., 0.20 for +20%
    applicableJobs: string[]; // e.g., ['swordman', 'knight'] or ['ALL']
}

// ==== WEAPONS ====
export interface WeaponItem extends BaseGachaItem {
    type: 'weapon';
    weaponCategory: WeaponCategory;
    statBonuses: Partial<BaseStats>;
    specialEffect?: string; // Optional unique passive modifier
}

// ==== SKILLS ====
export interface SkillItem extends BaseGachaItem {
    type: 'skill';
    cooldown: number; // in turns
    skillType: 'active' | 'burst' | 'passive';
    scaling: {
        stat: keyof BaseStats;
        multiplier: number;
    };
    effect?: string; // e.g., 'Heals party', 'Stuns target'
}

// ==== JOB CORES ====
export interface JobCoreItem extends BaseGachaItem {
    type: 'job_core';
    unlocksJobId: string;
}

// Union Type for logic handling
export type AnyGachaItem = CardItem | WeaponItem | SkillItem | JobCoreItem;

// ==== PLAYER INVENTORY EXTENSION ====
export interface ExtendedInventory {
    currency: number; // Gold/Standard Money
    premiumCurrency: number; // Gems for gacha
    materials: Record<string, number>;
    weapons: string[];    // Array of weapon instances (IDs)
    cards: string[];      // Array of card IDs
    skills: string[];     // Array of skill IDs
    jobCores: string[];   // Array of job core IDs
}
