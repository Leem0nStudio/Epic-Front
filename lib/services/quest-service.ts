import { supabase } from '@/lib/supabase';

export class QuestService {
    /**
     * Complete a simple quest and grant rewards.
     */
    static async completeQuest(amountZeny: number, amountGems: number) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('currency, premium_currency')
            .eq('id', user.id)
            .single();

        if (!profile) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                currency: profile.currency + amountZeny,
                premium_currency: profile.premium_currency + amountGems
            })
            .eq('id', user.id);

        if (error) throw error;
        return { success: true };
    }
}
