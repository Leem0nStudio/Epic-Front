import { supabase } from '@/lib/supabase';

export class PartyService {
    /**
     * Gets the current party configuration for a player.
     */
    static async getParty() {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('party')
            .select(`
                slot_index,
                unit:units (*)
            `)
            .eq('player_id', user.id)
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
        const { data: player } = await supabase
            .from('players')
            .select('party_size_limit')
            .eq('id', user.id)
            .single();

        if (player && slotIndex >= player.party_size_limit) {
            throw new Error(`Espacio ${slotIndex + 1} bloqueado. Límite: ${player.party_size_limit}`);
        }

        const { error } = await supabase
            .from('party')
            .upsert({
                player_id: user.id,
                slot_index: slotIndex,
                unit_id: unitId
            }, { onConflict: 'player_id,slot_index' });

        if (error) throw error;
        return { success: true };
    }

    /**
     * Unlocks a new party slot.
     */
    static async unlockSlot(newLimit: number) {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
            .from('players')
            .update({ party_size_limit: newLimit })
            .eq('id', user.id);

        if (error) throw error;
        return { success: true };
    }
}
