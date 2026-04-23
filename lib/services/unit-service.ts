import { supabase } from '@/lib/supabase';

export class UnitService {
  static async getPlayerRoster() {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase.from('units').select('*');
    if (error) throw error;
    return data;
  }

  /**
   * Evolves a unit using a secure atomic RPC.
   */
  static async evolveUnit(unitId: string, targetJobId: string) {
    if (!supabase) throw new Error("Supabase client not initialized");

    const { error } = await supabase.rpc('rpc_evolve_unit', {
      p_unit_id: unitId,
      p_target_job_id: targetJobId
    });

    if (error) throw error;
    return { success: true };
  }
}
