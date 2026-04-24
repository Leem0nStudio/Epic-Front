import { supabase } from '@/lib/supabase';
import { generateNovice } from '@/lib/rpg-system/recruitment';

export class OnboardingService {
    /**
     * Initializes a brand new player account atomically via RPC.
     */
    static async initializePlayer(username: string) {
        if (!supabase) throw new Error("Supabase client not initialized");

        // Requirement: Player starts with exactly 3 Novice units (physical, ranged, magic)
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

        // Create initial recruitment slots for the tavern
        const { RecruitmentService } = await import('./recruitment-service');
        await RecruitmentService.refreshTavern();

        return {
            username,
            success: true
        };
    }
}
