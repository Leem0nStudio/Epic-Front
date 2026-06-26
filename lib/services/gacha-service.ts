import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { GachaState } from '../rpg-system/gacha-types';
import { gameDebugger } from '../debug';

export interface PullResult {
    item_id: string;
    item_name: string;
    rarity: string;
    item_type: string;
    spark_count: number;
}

interface GachaRpcResponse {
    res_item_id: string;
    res_item_name: string;
    res_item_rarity: string;
    res_item_type: string;
    res_spark_count: number;
}

export class GachaService {
    /**
     * Performs a secure gacha pull using the database RPC.
     * Supports banner selection for rate-up banners.
     */
    static async pull(amount: number = 1, currencyType: 'soft' | 'premium' = 'soft', bannerId: string = 'standard'): Promise<PullResult[]> {
        if (!supabase) throw new Error("Supabase client not initialized");

        gameDebugger.info('gacha', `Starting pull: ${amount}x ${currencyType} on banner ${bannerId}`);

        const { data, error } = await supabase.rpc('rpc_pull_gacha', {
            p_amount: amount,
            p_currency_type: currencyType,
            p_banner_id: bannerId,
        });

        if (error) {
            gameDebugger.error('gacha', 'RPC error', error);
            logger.error('error', 'Gacha RPC Error', error);
            throw error;
        }

        gameDebugger.info('gacha', `Pull completed, got ${(data || []).length} items`, data);

        return (data || []).map((item: GachaRpcResponse) => ({
            item_id: item.res_item_id,
            item_name: item.res_item_name,
            rarity: item.res_item_rarity,
            item_type: item.res_item_type,
            spark_count: item.res_spark_count,
        }));
    }

    /**
     * Helper for standard Multi pull (10 items)
     */
    static async pullMulti(currencyType: 'soft' | 'premium' = 'soft', bannerId: string = 'standard') {
        return this.pull(10, currencyType, bannerId);
    }

    /**
     * Fetch current gacha pity state for the user
     */
    static async getGachaState(): Promise<GachaState | null> {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('gacha_state')
            .select('*')
            .eq('player_id', user.id)
            .single();

        if (error) return null;
        return data;
    }
}
