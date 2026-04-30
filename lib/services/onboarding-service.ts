import { supabase } from '@/lib/supabase';
import { generateNovice } from '@/lib/rpg-system/recruitment';

export class OnboardingService {
    /**
     * Initializes a brand new player account atomically via RPC.
     * Includes retry logic with exponential backoff.
     */
    static async initializePlayer(username: string, maxRetries: number = 3): Promise<{ username: string; success: boolean }> {
        if (!supabase) throw new Error("Supabase client not initialized");

        // Requirement: Player starts with exactly 3 Novice units (physical, ranged, magic)
        const novices = [
            generateNovice('physical'),
            generateNovice('ranged'),
            generateNovice('magic')
        ];

        let lastError: any = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const { error } = await supabase.rpc('rpc_initialize_player', {
                    p_username: username,
                    p_novices: novices
                });

                if (error) {
                    // If RPC doesn't exist (not deployed), throw immediately with friendly message
                    if (error.message?.includes('does not exist') || error.code === 'P0002') {
                        throw new Error('El servicio de inicialización no está disponible. Por favor, contacta al soporte o intenta más tarde.');
                    }
                    throw error;
                }

                // Create initial recruitment slots for the tavern
                const { RecruitmentService } = await import('./recruitment-service');
                await RecruitmentService.refreshTavern();

                return {
                    username,
                    success: true
                };
            } catch (err: any) {
                lastError = err;

                // Don't retry if it's a "function does not exist" error
                if (err.message?.includes('no está disponible') || err.message?.includes('does not exist')) {
                    throw err;
                }

                if (attempt < maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError || new Error('No se pudo inicializar el jugador después de varios intentos');
    }
}
