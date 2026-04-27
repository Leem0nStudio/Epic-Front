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
 * Advanced stat calculation logic.
 * Corrected to handle DB field names (snake_case) and logic consistency.
 */
export function calculateFinalStats(
    unit: DBUnit,
    jobDef: JobDefinition,
    equippedWeapon: any | null = null,
    equippedCards: any[] = []
): UnitStats {
    const defaultStats: UnitStats = { hp: 100, atk: 10, def: 10, matk: 10, mdef: 10, agi: 10 };

    const base = unit.base_stats || defaultStats;
    const growth = unit.growth_rates || { hp: 0, atk: 0, def: 0, matk: 0, mdef: 0, agi: 0 };
    const jobMods = jobDef?.stat_modifiers || { hp: 1, atk: 1, def: 1, matk: 1, mdef: 1, agi: 1 };

    const calculateStat = (field: keyof UnitStats) => {
        const baseVal = Number(base[field]) || defaultStats[field];
        const growthVal = Number(growth[field]) || 0;
        const jobMod = Number(jobMods[field]) || 1.0;

        // 1. Level-based Growth
        const levelBonus = growthVal * (Math.max(1, unit.level) - 1);
        const growthedBase = baseVal + levelBonus;

        // 2. Job Multiplier
        let total = growthedBase * jobMod;

        // 3. Equipment Bonuses
        if (equippedWeapon) {
            const weaponStats = equippedWeapon.stat_bonuses || equippedWeapon.stats || {};
            total += Number(weaponStats[field]) || 0;
        }

        // 4. Card Bonuses
        let cardMultiplier = 1.0;
        let cardFlat = 0;

        if (Array.isArray(equippedCards)) {
            equippedCards.forEach(card => {
                // Handle both CamelCase and snake_case for DB compatibility
                const target = card.effect_target || card.effectTarget;
                const value = Number(card.effect_value || card.effectValue || 0);
                const type = card.effect_type || card.effectType;

                if (target === field) {
                    if (type === 'statBoost') {
                        cardMultiplier += value;
                    } else {
                        cardFlat += value;
                    }
                }
            });
        }

        return Math.floor(Math.max(1, (total + cardFlat) * cardMultiplier));
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
