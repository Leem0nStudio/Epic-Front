import { BaseStats, JobDefinition } from '../rpg-system/types';

export interface DBUnit {
    id: string;
    name: string;
    level: number;
    base_stats: BaseStats;
    growth_rates: BaseStats;
    affinity: string;
    trait?: string;
    current_job_id: string;
    unlocked_jobs: string[];
}

export interface DBItem {
    id: string;
    name: string;
    stats?: Partial<BaseStats>;
    config?: {
        effectType?: string;
        weaponCategory?: string;
    };
}

/**
 * Advanced stat calculation logic that integrates Job modifiers,
 * equipment (Weapons), and Card effects.
 */
export function calculateFinalStats(
    unit: DBUnit,
    jobDef: JobDefinition,
    equippedWeapon: DBItem | null = null,
    equippedCards: DBItem[] = []
): BaseStats {
    const mods = jobDef.stat_modifiers;

    const calculateStat = (field: keyof BaseStats) => {
        // 1. Level-based Growth: Base + (Growth * (Level - 1))
        const baseAndGrowth = unit.base_stats[field] + (unit.growth_rates[field] * (unit.level - 1));

        // 2. Job Multiplier
        let total = baseAndGrowth * (mods[field] || 1.0);

        // 3. Equipment Flat Bonuses
        if (equippedWeapon && equippedWeapon.stats && equippedWeapon.stats[field]) {
            total += equippedWeapon.stats[field]!;
        }

        // 4. Card Percentage Bonuses
        let cardMultiplier = 1.0;
        equippedCards.forEach(card => {
            if (card.stats && card.stats[field]) {
                if (card.config?.effectType === 'statBoost') {
                    cardMultiplier += card.stats[field]!;
                }
            }
        });

        return Math.floor(total * cardMultiplier);
    };

    return {
        hp: calculateStat('hp'),
        atk: calculateStat('atk'),
        def: calculateStat('def'),
        matk: calculateStat('matk'),
        mdef: calculateStat('mdef'),
        agi: calculateStat('agi')
    };
}
