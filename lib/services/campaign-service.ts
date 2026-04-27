import { supabase } from '@/lib/supabase';
import { Stage, PlayerStageProgress, StageReward, Chapter } from '../rpg-system/campaign-types';

export class CampaignService {
    private static chaptersCache: Chapter[] | null = null;

    static async getChapters(): Promise<Chapter[]> {
        if (this.chaptersCache) return this.chaptersCache;
        
        if (!supabase) {
            const { CAMPAIGN_CHAPTERS } = await import('../rpg-system/campaign-data');
            return CAMPAIGN_CHAPTERS;
        }

        try {
            const { data: chapters, error } = await supabase
                .from('chapters')
                .select('*, stages(*)')
                .order('index_num');

            if (error || !chapters || chapters.length === 0) {
                console.warn("No chapters in DB, using fallback data");
                const { CAMPAIGN_CHAPTERS } = await import('../rpg-system/campaign-data');
                return CAMPAIGN_CHAPTERS;
            }

            this.chaptersCache = chapters.map(ch => ({
                id: ch.id,
                index: ch.index_num,
                name: ch.name,
                description: ch.description || '',
                unlock_requirements: ch.unlock_requirements || null,
                stages: (ch.stages || []).map((s: any) => ({
                    id: s.id,
                    chapter_id: s.chapter_id,
                    index: s.index_num,
                    name: s.name,
                    description: s.description || '',
                    energy_cost: s.energy_cost,
                    enemies: s.enemies || [],
                    rewards: s.rewards || { currency: 0, exp: 0, materials: [] },
                    first_clear_rewards: s.first_clear_rewards,
                    star_conditions: s.star_conditions || [],
                    unlock_requirements: s.unlock_requirements || null
                }))
            }));

            return this.chaptersCache;
        } catch (e) {
            console.error("Error loading chapters from DB:", e);
            const { CAMPAIGN_CHAPTERS } = await import('../rpg-system/campaign-data');
            return CAMPAIGN_CHAPTERS;
        }
    }

    static async getStageById(stageId: string): Promise<Stage | null> {
        const chapters = await this.getChapters();
        for (const chapter of chapters) {
            const stage = chapter.stages.find(s => s.id === stageId);
            if (stage) return stage;
        }
        return null;
    }

    static async getPlayerProgress(): Promise<PlayerStageProgress[]> {
        if (!supabase) return [];
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('campaign_progress')
            .select('*')
            .eq('player_id', user.id);

        if (error) {
            console.error("Error fetching campaign progress:", error);
            return [];
        }

        return (data || []).map(d => ({
            stage_id: d.stage_id,
            stars: d.stars,
            cleared: true,
            best_turns: d.best_turns
        }));
    }

    static async completeStage(stageId: string, stats: { turns: number, deaths: number }) {
        if (!supabase) return;
        const stage = await this.getStageById(stageId);
        if (!stage) throw new Error("Stage not found");

        let stars = 0;
        stage.star_conditions?.forEach(condition => {
            let met = false;
            switch (condition.type) {
                case 'win': met = true; break;
                case 'no_deaths':
                case 'all_survived': met = stats.deaths === 0; break;
                case 'turn_limit': met = stats.turns <= (condition.value || 999); break;
            }
            if (met) stars++;
        });

        const progress = await this.getPlayerProgress();
        const isFirstClear = !progress.some(p => p.stage_id === stageId);

        const baseRewards = (isFirstClear && stage.first_clear_rewards)
            ? stage.first_clear_rewards
            : stage.rewards;

        const grantedMaterials = (baseRewards.materials || [])
            .filter((m: any) => Math.random() < m.chance)
            .map((m: any) => ({ itemId: m.itemId, amount: m.amount }));

        const finalRewards = {
            isFirstClear,
            currency: baseRewards.currency,
            premium_currency: baseRewards.premium_currency || 0,
            exp: baseRewards.exp,
            materials: grantedMaterials
        };

        const { error } = await supabase.rpc('rpc_complete_stage', {
            p_stage_id: stageId,
            p_stars: stars,
            p_turns: stats.turns,
            p_rewards: finalRewards
        });

        if (error) throw error;

        return {
            stars,
            rewards: finalRewards
        };
    }

    static async deductEnergy(amount: number) {
        if (!supabase) return true;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: player } = await supabase
            .from('players')
            .select('energy')
            .eq('id', user.id)
            .single();

        if (!player || player.energy < amount) return false;

        const { error } = await supabase
            .from('players')
            .update({ energy: player.energy - amount })
            .eq('id', user.id);

        return !error;
    }

    static invalidateCache() {
        this.chaptersCache = null;
    }
}