import { supabase } from '@/lib/supabase';

export class EquipmentService {
    /**
     * Equips an item to a unit.
     */
    static async equipItem(unitId: string, itemInstanceId: string, slot: 'weapon' | 'card' | 'skill') {
        if (!supabase) return;

        // Fetch unit and job to check slot limits
        const { data: unit } = await supabase.from('units').select('*, current_job_id').eq('id', unitId).single();
        if (!unit) throw new Error("Unit not found");

        const { data: job } = await supabase.from('jobs').select('tier').eq('id', unit.current_job_id).single();
        const tier = job?.tier || 0;

        if (slot === 'weapon') {
            const { error } = await supabase
                .from('units')
                .update({ equipped_weapon_instance_id: itemInstanceId })
                .eq('id', unitId);
            if (error) throw error;
        } else if (slot === 'card') {
            const currentCards = unit.equipped_card_instance_ids || [];

            // Limit to 4 cards (Base requirement: 4 slots)
            if (currentCards.length >= 4) throw new Error("Máximo 4 cartas equipadas");

            const newCards = [...currentCards, itemInstanceId];
            const { error } = await supabase
                .from('units')
                .update({ equipped_card_instance_ids: newCards })
                .eq('id', unitId);
            if (error) throw error;
        } else if (slot === 'skill') {
            const currentSkills = unit.equipped_skill_instance_ids || [];

            // Skill Limits: Novice: 1, Job1: 2, Job2: 3, Job3: 4+Ult
            const limit = tier === 0 ? 1 : tier === 1 ? 2 : tier === 2 ? 3 : 5;
            if (currentSkills.length >= limit) throw new Error(`Límite de habilidades alcanzado para Tier ${tier} (${limit})`);

            const newSkills = [...currentSkills, itemInstanceId];
            const { error } = await supabase
                .from('units')
                .update({ equipped_skill_instance_ids: newSkills })
                .eq('id', unitId);
            if (error) throw error;
        }

        return { success: true };
    }

    /**
     * Unequips an item from a unit.
     */
    static async unequipItem(unitId: string, itemInstanceId: string, slot: 'weapon' | 'card' | 'skill') {
        if (!supabase) return;

        if (slot === 'weapon') {
            const { error } = await supabase
                .from('units')
                .update({ equipped_weapon_instance_id: null })
                .eq('id', unitId);
            if (error) throw error;
        } else {
            const field = slot === 'card' ? 'equipped_card_instance_ids' : 'equipped_skill_instance_ids';
            const { data: unit } = await supabase.from('units').select(field).eq('id', unitId).single();
            if (!unit) return;

            const currentItems = (unit as any)?.[field] || [];
            const newItems = currentItems.filter((id: string) => id !== itemInstanceId);

            const { error } = await supabase
                .from('units')
                .update({ [field]: newItems })
                .eq('id', unitId);
            if (error) throw error;
        }

        return { success: true };
    }
}
