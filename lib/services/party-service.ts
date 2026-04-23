import { supabase } from '@/lib/supabase';

export class PartyService {
    /**
     * Gets the current party configuration for a player.
     */
    static async getParty() {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data, error } = await supabase
            .from('party_slots')
            .select(`
                slot_index,
                unit:units (*)
            `)
            .order('slot_index', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Updates a party slot with a unit ID.
     */
    static async assignToParty(slotIndex: number, unitId: string | null) {
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Check party size limit
        const { data: profile } = await supabase
            .from('profiles')
            .select('party_size_limit')
            .eq('id', user.id)
            .single();

        if (profile && slotIndex >= profile.party_size_limit) {
            throw new Error(`Party slot ${slotIndex} is locked. Max size: ${profile.party_size_limit}`);
        }

        const { error } = await supabase
            .from('party_slots')
            .upsert({
                owner_id: user.id,
                slot_index: slotIndex,
                unit_id: unitId
            }, { onConflict: 'owner_id,slot_index' });

        if (error) throw error;
        return { success: true };
    }

    /**
     * Unlocks a new party slot (increases party_size_limit).
     */
    static async unlockSlot(newLimit: number) {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
            .from('profiles')
            .update({ party_size_limit: newLimit })
            .eq('id', user.id);

        if (error) throw error;
        return { success: true };
    }
}
