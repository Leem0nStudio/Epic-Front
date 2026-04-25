import { supabase } from '@/lib/supabase';

export class GachaService {
    /**
     * Performs a secure gacha pull using the database RPC.
     * Includes multi-pull logic and currency selection.
     */
    static async pull(amount: number = 1, currencyType: 'soft' | 'premium' = 'soft') {
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.rpc('rpc_pull_gacha', {
            p_amount: amount,
            p_currency_type: currencyType
        });

        if (error) throw error;

        // Return type: Array<{item_id, item_name, item_rarity, item_type}>
        return data;
    }

    /**
     * Helper for standard Multi pull (10 items)
     */
    static async pullMulti(currencyType: 'soft' | 'premium' = 'soft') {
        return this.pull(10, currencyType);
    }
}
