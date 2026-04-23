import { supabase } from '@/lib/supabase';
import { generateNovice } from '@/lib/rpg-system/recruitment';

export class RecruitmentService {
    /**
     * Generates a new batch of recruits if slots are empty or expired.
     */
    static async refreshTavern() {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: existingSlots } = await supabase
            .from('recruitment_slots')
            .select('*')
            .eq('owner_id', user.id)
            .eq('is_claimed', false);

        // If no slots, create initial 3
        if (!existingSlots || existingSlots.length === 0) {
            const newSlots = [
                { owner_id: user.id, slot_index: 0, generated_unit_data: generateNovice('physical'), available_at: new Date().toISOString() },
                { owner_id: user.id, slot_index: 1, generated_unit_data: generateNovice('ranged'), available_at: new Date(Date.now() + 30 * 60000).toISOString() },
                { owner_id: user.id, slot_index: 2, generated_unit_data: generateNovice('magic'), available_at: new Date(Date.now() + 60 * 60000).toISOString() }
            ];

            const { error } = await supabase.from('recruitment_slots').insert(newSlots);
            if (error) throw error;
        }
    }

    /**
     * Claims a recruit and adds it to the player's roster.
     */
    static async claimRecruit(slotId: string) {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: slot, error: slotError } = await supabase
            .from('recruitment_slots')
            .select('*')
            .eq('id', slotId)
            .single();

        if (slotError) throw slotError;
        if (new Date(slot.available_at) > new Date()) throw new Error("Recruit not available yet");

        // 1. Mark as claimed
        await supabase.from('recruitment_slots').update({ is_claimed: true }).eq('id', slotId);

        // 2. Add to units
        const unitData = slot.generated_unit_data;
        const { data: unit, error: unitError } = await supabase
            .from('units')
            .insert({
                owner_id: user.id,
                name: unitData.name,
                level: 1,
                base_stats: unitData.baseStats,
                growth_rates: unitData.growthRates,
                affinity: unitData.affinity,
                trait: unitData.trait,
                current_job_id: 'novice',
                unlocked_jobs: ['novice']
            })
            .select()
            .single();

        if (unitError) throw unitError;

        // 3. Generate a replacement slot for the future
        await supabase.from('recruitment_slots').insert({
            owner_id: user.id,
            slot_index: slot.slot_index,
            generated_unit_data: generateNovice(),
            available_at: new Date(Date.now() + 120 * 60000).toISOString()
        });

        return unit;
    }
}
