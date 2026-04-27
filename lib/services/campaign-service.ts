import { supabase } from '@/lib/supabase';
import { CAMPAIGN_CHAPTERS } from '../rpg-system/campaign-data';
import { Stage, PlayerStageProgress, StageReward } from '../rpg-system/campaign-types';

export class CampaignService {
    static getChapters() {
        return CAMPAIGN_CHAPTERS;
    }

    static getStageById(stageId: string): Stage | null {
        for (const chapter of CAMPAIGN_CHAPTERS) {
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
        const stage = this.getStageById(stageId);
        if (!stage) throw new Error("Stage not found");

        // Calculate Stars
        let stars = 0;
        stage.star_conditions.forEach(condition => {
            let met = false;
            switch (condition.type) {
                case 'win': met = true; break;
                case 'no_deaths':
                case 'all_survived': met = stats.deaths === 0; break;
                case 'turn_limit': met = stats.turns <= (condition.value || 999); break;
            }
            if (met) stars++;
        });

        // Calculate Rewards (simple random for materials)
        const progress = await this.getPlayerProgress();
        const isFirstClear = !progress.some(p => p.stage_id === stageId);

        const baseRewards = (isFirstClear && stage.first_clear_rewards)
            ? stage.first_clear_rewards
            : stage.rewards;

        const grantedMaterials = (baseRewards.materials || [])
            .filter(m => Math.random() < m.chance)
            .map(m => ({ itemId: m.itemId, amount: m.amount }));

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

        // DESIGN: If energy is not found or is less than amount, return false
        if (!player || player.energy === undefined || player.energy < amount) return false;

        const { error } = await supabase
            .from('players')
            .update({ energy: player.energy - amount })
            .eq('id', user.id);

        return !error;
    }
}
