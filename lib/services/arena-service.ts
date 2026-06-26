import { supabase } from '@/lib/supabase';

export interface ArenaOpponent {
  opponentId: string;
  opponentName: string;
  opponentPower: number;
  opponentPoints: number;
  opponentWins: number;
  opponentLosses: number;
  opponentRankTier: string;
}

export interface ArenaRanking {
  points: number;
  wins: number;
  losses: number;
  streak: number;
  rankTier: string;
  rewardClaimed: boolean;
}

export interface LeaderboardEntry {
  rankNum: number;
  playerId: string;
  playerName: string;
  points: number;
  wins: number;
  losses: number;
  rankTier: string;
}

export class ArenaService {
  static async findOpponents(): Promise<ArenaOpponent[]> {
    const { data, error } = await supabase.rpc('rpc_arena_find_opponents');
    if (error) throw error;
    return data || [];
  }

  static async getRanking(): Promise<ArenaRanking | null> {
    const { data, error } = await supabase.rpc('rpc_arena_get_ranking');
    if (error) throw error;
    if (data?.error) return null;
    return data;
  }

  static async submitResult(defenderId: string, result: 'win' | 'loss' | 'draw'): Promise<{ matchId: string; pointsChange: number; newPoints: number }> {
    const { data, error } = await supabase.rpc('rpc_arena_submit_result', {
      p_defender_id: defenderId,
      p_result: result,
    });
    if (error) throw error;
    return data;
  }

  static async getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('rpc_arena_get_leaderboard', { p_limit: limit });
    if (error) throw error;
    return (data || []).map((e: Record<string, unknown>) => ({
      rankNum: e.rank_num,
      playerId: e.player_id,
      playerName: e.player_name,
      points: e.points,
      wins: e.wins,
      losses: e.losses,
      rankTier: e.rank_tier,
    }));
  }
}
