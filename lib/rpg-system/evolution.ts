import { RPGUnit, BaseStats } from './types';
import { JOB_DATABASE } from './data';

export interface PlayerResources {
    currency: number;
    inventory: Record<string, number>; // itemId -> amount
}

export interface EvolutionResult {
    success: boolean;
    message: string;
    costApplied?: { currency: number; materials: { itemId: string; amount: number }[] };
}

/**
 * Checks if a unit meets all the requirements to evolve into the target job.
 */
export function canEvolve(unit: RPGUnit, targetJobId: string, resources: PlayerResources): EvolutionResult {
    const targetJob = JOB_DATABASE[targetJobId];
    
    if (!targetJob) {
        return { success: false, message: 'Invalid target job class.' };
    }

    // Standard RO evolution logic: Strict parent progression 
    // Example: To become Knight, you MUST currently be a Swordman
    if (targetJob.parentJobId !== unit.currentJobId) {
        return { success: false, message: `Must be a [${targetJob.parentJobId}] to evolve into [${targetJob.name}].` };
    }

    const reqs = targetJob.evolutionRequirements;

    // 1. Level check
    if (unit.level < reqs.minLevel) {
        return { success: false, message: `Requires level ${reqs.minLevel}. Current level: ${unit.level}.` };
    }

    // 2. Currency check
    if (resources.currency < reqs.currencyCost) {
        return { success: false, message: `Not enough currency. Need ${reqs.currencyCost}, but have ${resources.currency}.` };
    }

    // 3. Material check
    const missingMats: string[] = [];
    for (const mat of reqs.materials) {
        const playerAmount = resources.inventory[mat.itemId] || 0;
        if (playerAmount < mat.amount) {
            missingMats.push(`${mat.itemId} (${playerAmount}/${mat.amount})`);
        }
    }

    if (missingMats.length > 0) {
        return { success: false, message: `Missing evolution materials: ${missingMats.join(', ')}` };
    }

    return { success: true, message: 'Evolution requirements met.' };
}

/**
 * Mutates and returns a NEW unit object and updated resources if the evolution is valid.
 */
export function evolveUnit(unit: RPGUnit, targetJobId: string, resources: PlayerResources) {
    const check = canEvolve(unit, targetJobId, resources);
    if (!check.success) {
        throw new Error(`Evolution Failed: ${check.message}`);
    }

    const reqs = JOB_DATABASE[targetJobId].evolutionRequirements;

    // Deduct cost and materials from resources
    const newResources: PlayerResources = { 
        ...resources,
        currency: resources.currency - reqs.currencyCost,
        inventory: { ...resources.inventory } 
    };

    reqs.materials.forEach(mat => {
        newResources.inventory[mat.itemId] -= mat.amount;
    });

    // Create the evolved unit
    const newUnit: RPGUnit = {
        ...unit,
        currentJobId: targetJobId,
        // Make sure previous jobs are kept in memory so player can revert if we implement that feature
        unlockedJobs: [...Array.from(new Set([...unit.unlockedJobs, targetJobId]))]
    };

    return { newUnit, newResources };
}

/**
 * Permite a un jugador cambiar a un trabajo que ya había desbloqueado antes pagando un coste de reseteo.
 */
export function changeJob(unit: RPGUnit, targetJobId: string, currency: number, cost: number = 1000) {
    if (!unit.unlockedJobs.includes(targetJobId)) {
        throw new Error('This unit has not unlocked this job class yet.');
    }

    if (currency < cost) {
        throw new Error(`Requires ${cost} currency to switch to an alternate job.`);
    }

    return {
        newUnit: { ...unit, currentJobId: targetJobId },
        newCurrency: currency - cost
    };
}

/**
 * Utility to calculate final combat stats.
 * Base stat + (Growth rate * Level) * Job Modifier Multiplier.
 */
export function calculateCurrentStats(unit: RPGUnit): BaseStats {
    const job = JOB_DATABASE[unit.currentJobId] || JOB_DATABASE['novice'];
    const mods = job.statModifiers;

    const calcField = (field: keyof BaseStats) => {
        const baseAndGrowth = unit.baseStats[field] + (unit.growthRates[field] * unit.level);
        return Math.floor(baseAndGrowth * mods[field]); // Multiply by Job affinity
    };

    return {
        hp: calcField('hp'),
        atk: calcField('atk'),
        def: calcField('def'),
        matk: calcField('matk'),
        mdef: calcField('mdef'),
        agi: calcField('agi'),
    };
}
