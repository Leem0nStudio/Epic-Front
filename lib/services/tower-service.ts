import { supabase } from '@/lib/supabase';

export interface TowerProgress {
  highestFloor: number;
  floorsCompleted: Array<{ floor: number; stars: number }>;
  rewardClaimedUpTo: number;
  seasonId: string;
}

export interface FloorResult {
  success: boolean;
  floor: number;
  stars: number;
  currencyReward: number;
  expReward: number;
}

export class TowerService {
  static async getProgress(): Promise<TowerProgress | null> {
    const { data, error } = await supabase.rpc('rpc_tower_get_progress');
    if (error) throw error;
    if (data?.error) return null;
    return data;
  }

  static async completeFloor(floor: number, stars: number): Promise<FloorResult> {
    const { data, error } = await supabase.rpc('rpc_tower_complete_floor', {
      p_floor: floor,
      p_stars: stars,
    });
    if (error) throw error;
    return data;
  }
}
