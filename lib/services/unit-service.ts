import { supabase } from '@/lib/supabase';
import { calculateFinalStats } from './build-calculator';

export class UnitService {
  static async getPlayerRoster() {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase.from('units').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  static async getUnitDetails(unitId: string) {
    if (!supabase) throw new Error("Supabase client not initialized");

    // Fetch unit, its job, and all its equipment
    const { data: unit, error: unitError } = await supabase.from('units').select('*').eq('id', unitId).single();
    if (unitError) throw unitError;

    const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', unit.current_job_id).single();
    if (jobError) throw jobError;

    // Fetch equipped weapon details
    let weapon = null;
    if (unit.equipped_weapon_instance_id) {
        const { data: invItem } = await supabase.from('inventory').select('*').eq('id', unit.equipped_weapon_instance_id).single();
        if (invItem) {
            const { data: weaponDef } = await supabase.from('weapons').select('*').eq('id', invItem.item_id).single();
            weapon = { ...invItem, ...weaponDef };
        }
    }

    // Fetch equipped cards details
    let cards: any[] = [];
    if (unit.equipped_card_instance_ids && unit.equipped_card_instance_ids.length > 0) {
        const { data: invItems } = await supabase.from('inventory').select('*').in('id', unit.equipped_card_instance_ids);
        if (invItems) {
            const cardIds = invItems.map(i => i.item_id);
            const { data: cardDefs } = await supabase.from('cards').select('*').in('id', cardIds);
            cards = invItems.map(inv => ({ ...inv, ...(cardDefs?.find(d => d.id === inv.item_id) || {}) }));
        }
    }

    // Fetch equipped skills details
    let skills: any[] = [];
    if (unit.equipped_skill_instance_ids && unit.equipped_skill_instance_ids.length > 0) {
        const { data: invItems } = await supabase.from('inventory').select('*').in('id', unit.equipped_skill_instance_ids);
        if (invItems) {
            const skillIds = invItems.map(i => i.item_id);
            const { data: skillDefs } = await supabase.from('skills').select('*').in('id', skillIds);
            skills = invItems.map(inv => ({ ...inv, ...(skillDefs?.find(d => d.id === inv.item_id) || {}) }));
        }
    }

    // Calculate final stats
    const finalStats = calculateFinalStats(unit, job, weapon, cards);

    return {
        unit,
        job,
        weapon,
        cards,
        skills,
        finalStats
    };
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
