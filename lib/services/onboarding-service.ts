import { supabase } from '@/lib/supabase';
import { generateNovice } from '@/lib/rpg-system/recruitment';

export interface OnboardingResult {
    username: string;
    success: boolean;
    isDemoMode: boolean;
}

export class OnboardingService {
    static isDemoMode = false;

    static enableDemoMode() {
        this.isDemoMode = true;
        if (typeof window !== 'undefined') {
            localStorage.setItem('demo_mode', 'true');
        }
    }

    static disableDemoMode() {
        this.isDemoMode = false;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('demo_mode');
        }
    }

    static checkDemoMode(): boolean {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('demo_mode') === 'true';
        }
        return false;
    }

    /**
     * Initializes a brand new player account atomically via RPC.
     * Includes fallback to demo mode if RPC is not available.
     */
    static async initializePlayer(username: string, maxRetries: number = 3): Promise<OnboardingResult> {
        if (!supabase) {
            this.enableDemoMode();
            return { username, success: true, isDemoMode: true };
        }

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
                    if (error.message?.includes('does not exist') || error.code === 'P0002') {
                        return this.fallbackToDemoMode(username);
                    }
                    throw error;
                }

                const { RecruitmentService } = await import('./recruitment-service');
                await RecruitmentService.refreshTavern();

                return { username, success: true, isDemoMode: false };
            } catch (err: any) {
                lastError = err;

                if (err.message?.includes('no está disponible') || err.message?.includes('does not exist')) {
                    return this.fallbackToDemoMode(username);
                }

                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError || new Error('No se pudo inicializar el jugador después de varios intentos');
    }

    private static fallbackToDemoMode(username: string): OnboardingResult {
        this.enableDemoMode();
        console.warn('[Onboarding] RPC not available, running in DEMO mode');
        return { username, success: true, isDemoMode: true };
    }
}
