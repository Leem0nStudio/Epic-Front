import { supabase } from '@/lib/supabase';
import { JobDefinition, UnitData } from './types';

/**
 * Service to handle Job Evolution business logic.
 * Evolution requirements (level, currency, materials) are validated in Postgres RPC
 * but we provide helper methods for the UI to display available paths.
 */
export class EvolutionService {
    
    /**
     * Gets all potential next jobs for a unit based on its current job.
     */
    static async getAvailableEvolutions(unit: UnitData): Promise<JobDefinition[]> {
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('parent_job_id', unit.currentJobId);

        if (error) {
            console.error('Error fetching evolution paths:', error);
            return [];
        }

        // Map database response to JobDefinition interface
        return (jobs || []).map(j => ({
            id: j.id,
            version: j.version,
            name: j.name,
            tier: j.tier,
            parentJobId: j.parent_job_id,
            statModifiers: j.stat_modifiers,
            allowedWeapons: j.allowed_weapons,
            skillsUnlocked: j.skills_unlocked,
            passiveEffects: j.passive_effects,
            evolutionRequirements: j.evolution_requirements
        }));
    }

    /**
     * Checks if a unit meets the requirements for a specific evolution.
     * Returns a detailed status object for UI feedback.
     */
    static checkEvolutionRequirements(unit: UnitData, targetJob: JobDefinition, playerCurrency: number, playerInventory: any[]) {
        const reqs = targetJob.evolutionRequirements;
        const levelMet = unit.level >= reqs.minLevel;
        const currencyMet = playerCurrency >= reqs.currencyCost;

        const materialStatus = reqs.materials.map(m => {
            const owned = playerInventory.find(inv => inv.item_id === m.itemId)?.quantity || 0;
            return {
                itemId: m.itemId,
                required: m.amount,
                owned: owned,
                met: owned >= m.amount
            };
        });

        const allMaterialsMet = materialStatus.every(m => m.met);

        return {
            isMet: levelMet && currencyMet && allMaterialsMet,
            level: { required: reqs.minLevel, current: unit.level, met: levelMet },
            currency: { required: reqs.currencyCost, current: playerCurrency, met: currencyMet },
            materials: materialStatus
        };
    }
}
