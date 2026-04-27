import { supabase } from '@/lib/supabase';
import { generateNovice } from '@/lib/rpg-system/recruitment';

export class RecruitmentService {
    /**
     * Hybrid Recruitment System:
     * - Time-based: 1 every 4 hours, max 3 slots.
     */
    static async refreshTavern() {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: existingSlots } = await supabase
            .from('recruitment_queue')
            .select('*')
            .eq('player_id', user.id)
            .eq('is_claimed', false);

        const currentCount = existingSlots?.length || 0;
        if (currentCount < 3) {
            const slotsToCreate = 3 - currentCount;
            const newSlots = [];

            for (let i = 0; i < slotsToCreate; i++) {
                const usedIndices = existingSlots?.map(s => s.slot_index) || [];
                let slotIdx = 0;
                while (usedIndices.includes(slotIdx)) slotIdx++;

                const availableAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

                newSlots.push({
                    player_id: user.id,
                    slot_index: slotIdx,
                    unit_data: generateNovice(),
                    available_at: availableAt
                });
            }

            await supabase.from('recruitment_queue').insert(newSlots);
        }
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

        await supabase.from('recruitment_queue').update({ is_claimed: true }).eq('id', slotId);

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

        await this.refreshTavern();
        return unit;
    }

    static async discardRecruit(slotId: string) {
        if (!supabase) return;
        await supabase.from('recruitment_queue').update({ is_claimed: true }).eq('id', slotId);
        await this.refreshTavern();
    }
}
