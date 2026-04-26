import { supabase } from '@/lib/supabase';

export class QuestService {
    /**
     * Complete a simple quest and grant rewards.
     */
    static async completeQuest(amountZeny: number, amountGems: number) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: player } = await supabase
            .from('players')
            .select('currency, premium_currency')
            .eq('id', user.id)
            .single();

        if (!player) return;

        const { error } = await supabase
            .from('players')
            .update({
                currency: BigInt(player.currency) + BigInt(amountZeny),
                premium_currency: BigInt(player.premium_currency) + BigInt(amountGems)
            })
            .eq('id', user.id);

        if (error) throw error;
        return { success: true };
    }
}
