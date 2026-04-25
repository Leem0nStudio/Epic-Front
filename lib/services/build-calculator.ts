import { UnitStats, JobDefinition } from '../rpg-system/types';

export interface DBUnit {
    id: string;
    name: string;
    level: number;
    base_stats: UnitStats;
    growth_rates: UnitStats;
    affinity: string;
    trait?: string;
    current_job_id: string;
    unlocked_jobs: string[];
}

/**
 * Advanced stat calculation logic that integrates Job modifiers,
 * equipment (Weapons), and Card effects.
 */
export function calculateFinalStats(
    unit: DBUnit,
    jobDef: JobDefinition,
    equippedWeapon: any | null = null,
    equippedCards: any[] = []
): UnitStats {
    const mods = jobDef.statModifiers;

    const calculateStat = (field: keyof UnitStats) => {
        // 1. Level-based Growth: Base + (Growth * (Level - 1))
        const baseAndGrowth = unit.base_stats[field] + (unit.growth_rates[field] * (unit.level - 1));

        // 2. Job Multiplier
        let total = baseAndGrowth * (mods[field] || 1.0);

        // 3. Equipment Bonuses (Weapon)
        if (equippedWeapon && (equippedWeapon.stat_bonuses || equippedWeapon.stats)) {
            const stats = equippedWeapon.stat_bonuses || equippedWeapon.stats;
            if (stats[field]) {
                total += stats[field];
            }
        }

        // 4. Card Multipliers
        let cardMultiplier = 1.0;
        equippedCards.forEach(card => {
            const val = card.effect_value || card.stats;
            if (val && val[field]) {
                if (card.effect_type === 'statBoost') {
                    cardMultiplier += val[field];
                } else if (typeof val[field] === 'number' && val[field] < 1) {
                    // Assuming percentage if less than 1
                    cardMultiplier += val[field];
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
