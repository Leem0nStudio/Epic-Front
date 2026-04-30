import { supabase } from '@/lib/supabase';

export interface DailyReward {
  day: number;
  currency: number;
  premium_currency: number;
  exp: number;
  message: string;
}

export class DailyRewardsService {
  /**
   * Get the current day streak and available rewards
   */
  static async getDailyRewardsStatus(): Promise<{
    currentStreak: number;
    canClaim: boolean;
    nextReward: DailyReward | null;
    rewards: DailyReward[];
  }> {
    if (!supabase) {
      return { currentStreak: 0, canClaim: false, nextReward: null, rewards: [] };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { currentStreak: 0, canClaim: false, nextReward: null, rewards: [] };

    // Get or create player daily rewards record
    const { data, error } = await supabase
      .from('player_daily_rewards')
      .select('*')
      .eq('player_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily rewards:', error);
    }

    const rewards = this.getRewardsList();
    let currentStreak = data?.streak || 0;
    let lastClaimDate = data?.last_claim_date ? new Date(data.last_claim_date) : null;
    let canClaim = false;

    // Check if can claim today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastClaimDate) {
      canClaim = true;
    } else {
      const lastClaimDay = new Date(lastClaimDate);
      lastClaimDay.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - lastClaimDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        canClaim = true;
      } else if (diffDays === 0) {
        // Already claimed today
        canClaim = false;
      } else {
        // Streak broken
        currentStreak = 0;
        canClaim = true;
      }
    }

    const nextReward = rewards[currentStreak % rewards.length];

    return {
      currentStreak,
      canClaim,
      nextReward,
      rewards
    };
  }

  /**
   * Claim daily reward
   */
  static async claimDailyReward(): Promise<{ success: boolean; message: string }> {
    if (!supabase) return { success: false, message: 'No supabase connection' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not authenticated' };

    try {
      const status = await this.getDailyRewardsStatus();
      
      if (!status.canClaim) {
        return { success: false, message: 'Already claimed today' };
      }

      const reward = status.nextReward;
      if (!reward) return { success: false, message: 'No reward available' };

      // Add rewards
      const { error: rpcError } = await supabase.rpc('rpc_add_currency', {
        p_currency_amount: reward.currency,
        p_premium_amount: reward.premium_currency
      });

      if (rpcError) throw rpcError;

      // Update player EXP
      if (reward.exp > 0) {
        const { data: player } = await supabase
          .from('players')
          .select('exp, level')
          .eq('id', user.id)
          .single();

        if (player) {
          let newExp = player.exp + reward.exp;
          let newLevel = player.level;
          
          while (newExp >= newLevel * 100) {
            newExp -= newLevel * 100;
            newLevel++;
          }

          await supabase
            .from('players')
            .update({ exp: newExp, level: newLevel })
            .eq('id', user.id);
        }
      }

      // Update streak
      const newStreak = status.currentStreak + 1;
      const today = new Date().toISOString().split('T')[0];

      await supabase
        .from('player_daily_rewards')
        .upsert({
          player_id: user.id,
          streak: newStreak,
          last_claim_date: today
        });

      return { success: true, message: `¡Recompensa reclamada! +${reward.currency} oro, +${reward.premium_currency} gems` };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  /**
   * Get the list of rewards
   */
  static getRewardsList(): DailyReward[] {
    return [
      { day: 1, currency: 100, premium_currency: 10, exp: 50, message: 'Día 1' },
      { day: 2, currency: 150, premium_currency: 15, exp: 75, message: 'Día 2' },
      { day: 3, currency: 200, premium_currency: 20, exp: 100, message: 'Día 3' },
      { day: 4, currency: 250, premium_currency: 25, exp: 125, message: 'Día 4' },
      { day: 5, currency: 300, premium_currency: 30, exp: 150, message: 'Día 5' },
      { day: 6, currency: 400, premium_currency: 40, exp: 200, message: 'Día 6' },
      { day: 7, currency: 500, premium_currency: 50, exp: 300, message: '¡Día 7 - Bono especial!' }
    ];
  }
}
