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
    // Default stats to avoid undefined errors
    const defaultStats: UnitStats = { hp: 100, atk: 10, def: 10, matk: 10, mdef: 10, agi: 10 };

    // Normalize unit stats (handle potential casing or missing data from DB)
    const base = unit.base_stats || defaultStats;
    const growth = unit.growth_rates || { hp: 0, atk: 0, def: 0, matk: 0, mdef: 0, agi: 0 };
    const mods = jobDef?.statModifiers || { hp: 1, atk: 1, def: 1, matk: 1, mdef: 1, agi: 1 };

    const calculateStat = (field: keyof UnitStats) => {
        const baseVal = Number(base[field]) || defaultStats[field];
        const growthVal = Number(growth[field]) || 0;
        const modVal = Number(mods[field]) || 1.0;

        // 1. Level-based Growth: Base + (Growth * (Level - 1))
        const levelBonus = growthVal * (Math.max(1, unit.level) - 1);
        const growthedBase = baseVal + levelBonus;

        // 2. Job Multiplier
        let total = growthedBase * modVal;

        // 3. Equipment Bonuses (Weapon)
        if (equippedWeapon) {
            const weaponStats = equippedWeapon.stat_bonuses || equippedWeapon.stats || {};
            total += Number(weaponStats[field]) || 0;
        }

        // 4. Card Multipliers
        let cardMultiplier = 1.0;
        if (Array.isArray(equippedCards)) {
            equippedCards.forEach(card => {
                const val = card.effect_value || card.stats || {};
                if (card.effect_type === 'statBoost' || typeof val[field] === 'number') {
                    const bonus = Number(val[field]) || 0;
                    // Treat small decimals as percentages (e.g., 0.1 = 10%)
                    // and larger numbers as absolute if effect_type isn't statBoost
                    if (bonus < 2 && bonus > 0) {
                        cardMultiplier += bonus;
                    } else if (bonus >= 2) {
                        total += bonus; // Treat as flat add if large
                    }
                }
            });
        }

        return Math.floor(Math.max(1, total * cardMultiplier));
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
