import { supabase } from '@/lib/supabase';
import { Stage, PlayerStageProgress, StageReward, Chapter } from '../rpg-system/campaign-types';
import { gameDebugger } from '../debug';
import { CAMPAIGN_CHAPTERS } from '../rpg-system/campaign-data';
import { OnboardingService } from './onboarding-service';

export class CampaignService {
    private static chaptersCache: Chapter[] | null = null;

    static async getChapters(): Promise<Chapter[]> {
        if (this.chaptersCache) return this.chaptersCache;

        if (!supabase || OnboardingService.checkDemoMode()) {
            gameDebugger.info('game-state', 'Using demo campaign data');
            this.chaptersCache = CAMPAIGN_CHAPTERS;
            return this.chaptersCache;
        }
        
        gameDebugger.info('game-state', 'Loading chapters from database');

        try {
            const { data: chapters, error } = await supabase
                .from('chapters')
                .select('*, stages(*)')
                .order('index_num');

            if (error || !chapters || chapters.length === 0) {
                gameDebugger.warn('game-state', 'No DB chapters, using fallback', error);
                this.chaptersCache = CAMPAIGN_CHAPTERS;
                return this.chaptersCache;
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
            gameDebugger.warn('game-state', 'Error loading chapters, using fallback', e);
            this.chaptersCache = CAMPAIGN_CHAPTERS;
            return this.chaptersCache;
        }
    }

    static async getStageById(stageId: string): Promise<Stage | null> {
        // Direct query instead of loading all chapters (fixes N+1)
        try {
            const { data: stage, error } = await supabase
                .from('stages')
                .select('*, chapters!inner(id, index_num, name, description, unlock_requirements)')
                .eq('id', stageId)
                .single();

            if (error || !stage) {
                gameDebugger.warn('game-state', 'Stage not found', { stageId });
                return null;
            }

            return {
                id: stage.id,
                chapter_id: stage.chapters.id,
                index: stage.index_num,
                name: stage.name,
                description: stage.description || '',
                energy_cost: stage.energy_cost,
                enemies: stage.enemies || [],
                rewards: stage.rewards || { currency: 0, exp: 0, materials: [] },
                first_clear_rewards: stage.first_clear_rewards,
                star_conditions: stage.star_conditions || [],
                unlock_requirements: stage.unlock_requirements || null
            };
        } catch (e) {
            gameDebugger.error('game-state', 'Error loading stage', e);
            return null;
        }
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
        
        // Validation: ensure stageId is a valid stage identifier (not enemy ID)
        if (stageId && (stageId.includes('slime') || stageId.includes('bat') || stageId.includes('goblin') || stageId.includes('skeleton') || stageId.includes('wolf'))) {
            gameDebugger.warn('campaign', 'Invalid stage ID detected (appears to be enemy ID)', { stageId });
            throw new Error("Invalid stage ID - please restart the battle");
        }
        
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

        if (!supabase || OnboardingService.checkDemoMode()) {
            gameDebugger.info('game-state', 'Demo mode: completing stage without RPC');
            return {
                stars,
                rewards: finalRewards,
                isFirstClear: true,
                firstClearBonus: stage.first_clear_rewards || {},
                currencyGained: finalRewards.currency || 0,
                expGained: finalRewards.exp || 0
            };
        }

        const { data, error } = await supabase.rpc('rpc_complete_stage', rpcParams);

        if (error) throw error;

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
        if (!supabase || OnboardingService.checkDemoMode()) {
            gameDebugger.info('game-state', 'Demo mode: energy check skipped');
            return true;
        }
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
          if (!supabase || OnboardingService.checkDemoMode()) {
              gameDebugger.info('game-state', 'Demo mode: energy refill free');
              return true;
          }
          
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

        // Use units table directly instead of unit_progress VIEW
        // to avoid dependency issues
        const { data, error } = await supabase
            .from('units')
            .select('level, exp')
            .eq('id', unitId)
            .single();

        if (error || !data) {
            gameDebugger.warn('game-state', 'Failed to get unit progress', { unitId, error });
            return null;
        }

        // Calculate next level exp (simple formula)
        const nextLevelExp = data.level * 100; // 100 exp per level
        const expPercentage = Math.min(100, (data.exp / nextLevelExp) * 100);

        return {
            level: data.level,
            exp: data.exp,
            nextLevelExp,
            expPercentage
        };
    }
}