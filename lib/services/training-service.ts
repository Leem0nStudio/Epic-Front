import { supabase } from '@/lib/supabase';

export interface TrainingResult {
  success: boolean;
  unitId: string;
  expGained: number;
  newLevel?: number;
  message?: string;
}

export class TrainingService {
  /**
   * Train a unit to gain EXP
   * Costs energy and gives EXP based on training type
   */
  static async trainUnit(
    unitId: string,
    trainingType: 'basic' | 'intensive' | 'elite' = 'basic'
  ): Promise<TrainingResult> {
    if (!supabase) return { success: false, unitId, expGained: 0, message: 'No supabase connection' };

    const energyCosts = {
      basic: 5,
      intensive: 15,
      elite: 30
    };

    const expGains = {
      basic: 25,
      intensive: 75,
      elite: 200
    };

    const energyCost = energyCosts[trainingType];
    const expGain = expGains[trainingType];

    try {
      // Check if player has enough energy
      const { data: player } = await supabase
        .from('players')
        .select('energy')
        .single();

      if (!player || player.energy < energyCost) {
        return { success: false, unitId, expGained: 0, message: 'Insufficient energy' };
      }

      // Deduct energy
      const { error: energyError } = await supabase.rpc('rpc_deduct_energy', { p_cost: energyCost });
      if (energyError) throw energyError;

      // Award EXP to unit
      const { error: expError } = await supabase.rpc('rpc_award_unit_exp', {
        p_unit_id: unitId,
        p_exp_gain: expGain
      });

      if (expError) throw expError;

      return {
        success: true,
        unitId,
        expGained: expGain,
        message: `Unit gained ${expGain} EXP!`
      };
    } catch (e: any) {
      return { success: false, unitId, expGained: 0, message: e.message };
    }
  }

  /**
   * Get training options available
   */
  static getTrainingOptions() {
    return [
      {
        id: 'basic',
        name: 'Entrenamiento Básico',
        description: 'Entrenamiento ligero para ganar EXP moderada',
        energyCost: 5,
        expGain: 25,
        icon: '⚔️'
      },
      {
        id: 'intensive',
        name: 'Entrenamiento Intensivo',
        description: 'Sesión rigurosa con mayor ganancia de EXP',
        energyCost: 15,
        expGain: 75,
        icon: '🔥'
      },
      {
        id: 'elite',
        name: 'Entrenamiento Élite',
        description: 'Entrenamiento extremo para máxima ganancia',
        energyCost: 30,
        expGain: 200,
        icon: '💎'
      }
    ];
  }
}
