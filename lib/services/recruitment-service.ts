import { supabase } from '@/lib/supabase';
import { generateNovice } from '@/lib/rpg-system/recruitment';

export class RecruitmentService {
    /**
     * Hybrid Recruitment System:
     * - Time-based: 1 every 4 hours, max 3 slots.
     * - Bonus: Triggered by milestones/bosses (implemented via direct call).
     */
    static async refreshTavern() {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: existingSlots } = await supabase
            .from('recruitment_queue')
            .select('*')
            .eq('player_id', user.id)
            .eq('is_claimed', false);

        // Fill empty slots up to 3
        const currentCount = existingSlots?.length || 0;
        if (currentCount < 3) {
            const slotsToCreate = 3 - currentCount;
            const newSlots = [];

            for (let i = 0; i < slotsToCreate; i++) {
                // Find first available slot index
                const usedIndices = existingSlots?.map(s => s.slot_index) || [];
                let slotIdx = 0;
                while (usedIndices.includes(slotIdx)) slotIdx++;

                // 4 hour cooldown per slot
                const availableAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

                newSlots.push({
                    player_id: user.id,
                    slot_index: slotIdx,
                    unit_data: generateNovice(),
                    available_at: availableAt
                });
            }

            const { error } = await supabase.from('recruitment_queue').insert(newSlots);
            if (error) throw error;
        }
    }

    /**
     * Bonus recruit (e.g. from dungeon/boss/milestone)
     * Instantly available.
     */
    static async addBonusRecruit() {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('recruitment_queue').insert({
            player_id: user.id,
            slot_index: 99, // Special index for bonus
            unit_data: generateNovice(),
            available_at: new Date().toISOString() // Instant
        });
    }

    static async claimRecruit(slotId: string) {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: slot, error: slotError } = await supabase
            .from('recruitment_queue')
            .select('*')
            .eq('id', slotId)
            .single();

        if (slotError) throw slotError;
        if (new Date(slot.available_at) > new Date()) throw new Error("Recruit not available yet");

        // Mark as claimed
        await supabase.from('recruitment_queue').update({ is_claimed: true }).eq('id', slotId);

        // Add to units
        const unitData = slot.unit_data;
        const { data: unit, error: unitError } = await supabase
            .from('units')
            .insert({
                player_id: user.id,
                name: unitData.name,
                level: 1,
                base_stats: unitData.baseStats,
                growth_rates: unitData.growthRates,
                affinity: unitData.affinity,
                trait: unitData.trait,
                current_job_id: 'novice',
                unlocked_jobs: ['novice'],
                sprite_id: unitData.spriteId,
                icon_id: unitData.iconId
            })
            .select()
            .single();

        if (unitError) throw unitError;

        // Auto-refresh tavern for next time-based slot
        await this.refreshTavern();

        return unit;
    }

    static async discardRecruit(slotId: string) {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { error } = await supabase
            .from('recruitment_queue')
            .update({ is_claimed: true })
            .eq('id', slotId);

        if (error) throw error;

        await this.refreshTavern();
    }
}
