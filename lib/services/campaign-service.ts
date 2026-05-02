import { supabase } from '@/lib/supabase';
import { Stage, PlayerStageProgress, StageReward, Chapter } from '../rpg-system/campaign-types';
import { gameDebugger } from '../debug';

export class CampaignService {
    private static chaptersCache: Chapter[] | null = null;

    static async getChapters(): Promise<Chapter[]> {
        if (this.chaptersCache) return this.chaptersCache;
        
        gameDebugger.info('game-state', 'Loading chapters from database');

        try {
            const { data: chapters, error } = await supabase
                .from('chapters')
                .select('*, stages(*)')
                .order('index_num');

            if (error) {
                gameDebugger.error('game-state', 'Database error loading chapters', error);
                throw new Error(`Failed to load chapters: ${error.message}`);
            }

            if (!chapters || chapters.length === 0) {
                gameDebugger.error('game-state', 'No chapters found in database - run 04-seed.sql', { 
                    chaptersFound: chapters?.length 
                });
                throw new Error('No chapters found in database. Please run the SQL seed file (04-seed.sql) to populate campaign data.');
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

            gameDebugger.info('game-state', `Loaded ${this.chaptersCache.length} chapters from DB`);
            return this.chaptersCache;
        } catch (e: any) {
            gameDebugger.error('game-state', 'Error loading chapters', e);
            throw e;
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

    static async completeStage(stageId: string, stats: { turns: number, deaths: number }, participatingUnitIds?: string[]) {
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

        const rpcParams: any = {
            p_stage_id: stageId,
            p_stars: stars,
            p_turns: stats.turns,
            p_rewards: finalRewards
        };

        // Add participating units if provided
        if (participatingUnitIds && participatingUnitIds.length > 0) {
            rpcParams.p_participating_units = participatingUnitIds;
        }

        const { data, error } = await supabase.rpc('rpc_complete_stage', rpcParams);

        if (error) throw error;

        // Handle the JSON return from the updated RPC
        const rewardResults = data || {};

        return {
            stars,
            rewards: finalRewards,
            isFirstClear: rewardResults.isFirstClear || false,
            firstClearBonus: rewardResults.firstClearBonus || {},
            currencyGained: rewardResults.currency || 0,
            expGained: rewardResults.exp || 0
        };
    }

    static async deductEnergy(amount: number) {
        if (!supabase) return false;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase.rpc('rpc_deduct_energy', {
            p_cost: amount
        });

        if (error) {
            console.error('Energy deduction failed:', error);
            return false;
        }

        return Boolean(data);
    }

     static invalidateCache() {
         this.chaptersCache = null;
     }

     static async refillEnergyWithGems(gemCost: number = 50): Promise<boolean> {
         if (!supabase) return false;
         
         const { data, error } = await supabase.rpc('rpc_refill_energy_with_gems', {
             p_gem_cost: gemCost
         });

         if (error) {
             console.error('Energy refill failed:', error);
             return false;
         }

         return Boolean(data);
     }

     static async getUnitProgress(unitId: string): Promise<{ level: number, exp: number, nextLevelExp: number, expPercentage: number } | null> {
         if (!supabase) return null;

         const { data, error } = await supabase
             .from('unit_progress')
             .select('*')
             .eq('id', unitId)
             .single();

         if (error || !data) {
             console.error('Failed to get unit progress:', error);
             return null;
         }

         return {
             level: data.level,
             exp: data.exp,
             nextLevelExp: data.next_level_exp,
             expPercentage: data.exp_percentage
         };
     }
}