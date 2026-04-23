import { supabase } from '@/lib/supabase';
import { generateNovice } from '@/lib/rpg-system/recruitment';

export class OnboardingService {
    /**
     * Initializes a brand new player account atomically via RPC.
     */
    static async initializePlayer(username: string) {
        if (!supabase) throw new Error("Supabase client not initialized");

        // Generate the 3 mandatory starting Novices data on client
        const novices = [
            generateNovice('physical'),
            generateNovice('ranged'),
            generateNovice('magic')
        ];

        const { error } = await supabase.rpc('rpc_initialize_player', {
            p_username: username,
            p_novices: novices
        });

        if (error) throw error;

        // Fetch the created data to return
        const { data: units } = await supabase.from('units').select('*');

        return {
            username,
            units: units || []
        };
    }
}
