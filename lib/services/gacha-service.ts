import { supabase } from '@/lib/supabase';

export class GachaService {
    /**
     * Performs a secure gacha pull using the database RPC.
     * All randomization and currency deduction happens on the server.
     */
    static async pull(amount: number = 1) {
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.rpc('rpc_pull_gacha', {
            p_amount: amount
        });

        if (error) throw error;
        return data; // Returns list of {item_id, item_name, item_rarity}
    }
}
