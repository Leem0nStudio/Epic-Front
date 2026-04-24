import { supabase } from '@/lib/supabase';

export class ConfigService {
    private static activeVersion: string | null = null;
    private static cache: Record<string, any> = {};

    /**
     * Fetches the latest active game configuration.
     * This is used for "Balance Patches" without full deploys.
     */
    static async syncConfig() {
        if (!supabase) return;

        const { data, error } = await supabase
            .from('game_configs')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error syncing config:', error);
            return;
        }

        this.activeVersion = data.version;
        this.cache = data.config_data || {};
        console.log(`Game Config Synced: v${this.activeVersion}`);
    }

    static getActiveVersion() {
        return this.activeVersion;
    }

    static getSetting(key: string) {
        return this.cache[key];
    }
}
