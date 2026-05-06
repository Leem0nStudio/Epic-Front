// Progression Service - Sistema de progresión v2.0
// Similar a Ragnarok Online / Brave Frontier
// Maneja: level up, job levels, transcendence, potentials, skill trees

import { supabase } from '@/lib/supabase';
import { gameDebugger } from '@/lib/debug';
import {
  getPlayerExpForLevel,
  getUnitExpForLevel,
  getJobLevelExpForLevel,
  calculatePlayerLevelFromExp,
  calculateUnitLevelFromExp,
  calculateJobLevelFromExp,
  getLevelBonusStats,
  getJobLevelBonusStats
} from '@/lib/config/level-curve';
import type { UnitStats } from '@/lib/types/game-types';

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  expNeeded: number;
  bonuses?: Partial<UnitStats>;
}

export interface JobLevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  newJobLevel: number;
  skillPointsGained: number;
  bonuses?: Partial<UnitStats>;
}

export class ProgressionService {
  /**
   * Progresa la experiencia del jugador y maneja level ups
   */
  static async addPlayerExp(playerId: string, expGained: number): Promise<LevelUpResult | null> {
    if (!supabase) return null;

    const { data: player } = await supabase
      .from('players')
      .select('level, exp')
      .eq('id', playerId)
      .single();

    if (!player) return null;

    const newExp = player.exp + expGained;
    const newLevel = calculatePlayerLevelFromExp(newExp);
    const leveledUp = newLevel > player.level;

    const { error } = await supabase
      .from('players')
      .update({ 
        exp: newExp,
        level: newLevel,
        ...(leveledUp ? { energy: 30, max_energy: 30 } : {})
      })
      .eq('id', playerId);

    if (error) {
      gameDebugger.error('game-state', 'Failed to add player exp', error);
      return null;
    }

    gameDebugger.info('game-state', 'Player exp added', { playerId, expGained, newLevel, leveledUp });

    return {
      leveledUp,
      newLevel,
      expNeeded: getPlayerExpForLevel(newLevel + 1) - newExp,
      bonuses: leveledUp ? getLevelBonusStats(newLevel) : undefined
    };
  }

  /**
   * Progresa la experiencia de una unidad
   */
  static async addUnitExp(unitId: string, expGained: number): Promise<JobLevelUpResult | null> {
    if (!supabase) return null;

    const { data: unit } = await supabase
      .from('units')
      .select('level, exp, current_job_id, job_levels')
      .eq('id', unitId)
      .single();

    if (!unit) return null;

    const newExp = unit.exp + expGained;
    const newLevel = calculateUnitLevelFromExp(newExp);
    const leveledUp = newLevel > unit.level;

    // Get current job level info
    const jobLevels = unit.job_levels || {};
    const currentJobLevel = jobLevels[unit.current_job_id]?.level || 1;
    const currentJobExp = jobLevels[unit.current_job_id]?.exp || 0;

    // Calculate job level progression
    const newJobExp = currentJobExp + Math.floor(expGained / 2); // Half exp goes to job level
    const newJobLevel = calculateJobLevelFromExp(newJobExp);
    const jobLeveledUp = newJobLevel > currentJobLevel;
    const skillPointsGained = jobLeveledUp ? Math.floor((newJobLevel - currentJobLevel) / 10) + 1 : 0;

    // Update job levels
    const updatedJobLevels = {
      ...jobLevels,
      [unit.current_job_id]: {
        jobId: unit.current_job_id,
        level: newJobLevel,
        exp: newJobExp,
        skillPoints: (jobLevels[unit.current_job_id]?.skillPoints || 0) + skillPointsGained,
        skillsUnlocked: jobLevels[unit.current_job_id]?.skillsUnlocked || []
      }
    };

    const { error } = await supabase
      .from('units')
      .update({
        exp: newExp,
        level: newLevel,
        job_levels: updatedJobLevels
      })
      .eq('id', unitId);

    if (error) {
      gameDebugger.error('game-state', 'Failed to add unit exp', error);
      return null;
    }

    gameDebugger.info('game-state', 'Unit exp added', { 
      unitId, 
      expGained, 
      newLevel, 
      newJobLevel,
      skillPointsGained 
    });

    return {
      leveledUp,
      newLevel,
      skillPointsGained,
      newJobLevel,
      bonuses: leveledUp || jobLeveledUp 
        ? { 
            ...getLevelBonusStats(newLevel),
            ...(jobLeveledUp ? getJobLevelBonusStats(newJobLevel) : {})
          } 
        : undefined
    };
  }

  /**
   * Invierte puntos de skill en un skill del tree
   */
  static async investSkillPoint(
    unitId: string, 
    jobId: string, 
    skillId: string,
    skillTier: number
  ): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Demo mode' };

    const { data: unit } = await supabase
      .from('units')
      .select('job_levels, job_skills')
      .eq('id', unitId)
      .single();

    if (!unit) return { success: false, message: 'Unit not found' };

    const jobLevels = unit.job_levels || {};
    const jobSkills = unit.job_skills || {};
    const currentPoints = jobLevels[jobId]?.skillPoints || 0;
    const currentSkillLevel = jobSkills[jobId]?.[skillId] || 0;

    if (currentPoints < 1) {
      return { success: false, message: 'No skill points available' };
    }

    // Check prerequisites (simplified - would need full skill tree data)
    if (skillTier > 1 && currentSkillLevel === 0) {
      return { success: false, message: 'Unlock previous tier first' };
    }

    // Deduct point and add skill
    const newJobLevels = {
      ...jobLevels,
      [jobId]: {
        ...jobLevels[jobId],
        skillPoints: currentPoints - 1
      }
    };

    const newJobSkills = {
      ...jobSkills,
      [jobId]: {
        ...(jobSkills[jobId] || {}),
        [skillId]: currentSkillLevel + 1
      }
    };

    const { error } = await supabase
      .from('units')
      .update({
        job_levels: newJobLevels,
        job_skills: newJobSkills
      })
      .eq('id', unitId);

    if (error) {
      gameDebugger.error('game-state', 'Failed to invest skill point', error);
      return { success: false, message: 'Error investing skill point' };
    }

    gameDebugger.info('game-state', 'Skill point invested', { unitId, jobId, skillId, tier: skillTier });
    return { success: true, message: `Skill ${skillId} upgraded to level ${currentSkillLevel + 1}` };
  }

  /**
   * Realiza transcendence (awakening) de una unidad
   */
  static async transcendUnit(unitId: string): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Demo mode' };

    const { data: unit } = await supabase
      .from('units')
      .select('level, current_job_id, transcendence_level')
      .eq('id', unitId)
      .single();

    if (!unit) return { success: false, message: 'Unit not found' };

    // Requirements for transcendence
    const MAX_TRANSCENDENCE = 5;
    const REQUIRED_LEVEL = 99;

    if (unit.transcendence_level >= MAX_TRANSCENDENCE) {
      return { success: false, message: 'Maximum transcendence level reached' };
    }

    if (unit.level < REQUIRED_LEVEL) {
      return { success: false, message: `Requires level ${REQUIRED_LEVEL} to transcend` };
    }

    // Check if job can transcend (would need transcendence_requirement field in jobs)
    // For now, just allow it

    const { error } = await supabase
      .from('units')
      .update({
        transcendence_level: unit.transcendence_level + 1
      })
      .eq('id', unitId);

    if (error) {
      gameDebugger.error('game-state', 'Failed to transcend unit', error);
      return { success: false, message: 'Error during transcendence' };
    }

    gameDebugger.info('game-state', 'Unit transcended', { unitId, newLevel: unit.transcendence_level + 1 });
    return { 
      success: true, 
      message: `Transcendence level ${unit.transcendence_level + 1} achieved!` 
    };
  }

  /**
   * Desbloquea un potencial al alcanzar ciertos requisitos
   */
  static async unlockPotential(unitId: string, potentialId: string): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Demo mode' };

    const { data: unit } = await supabase
      .from('units')
      .select('level, current_job_id, job_levels, potentials_unlocked, transcendence_level')
      .eq('id', unitId)
      .single();

    if (!unit) return { success: false, message: 'Unit not found' };

    // Check if already unlocked
    const potentials = unit.potentials_unlocked || [];
    if (potentials.includes(potentialId)) {
      return { success: false, message: 'Potential already unlocked' };
    }

    // Get potential requirements
    const { data: potential } = await supabase
      .from('potentials')
      .select('*')
      .eq('id', potentialId)
      .single();

    if (!potential) return { success: false, message: 'Potential not found' };

    // Check requirements
    let canUnlock = false;
    switch (potential.requirement_type) {
      case 'level':
        canUnlock = unit.level >= potential.requirement_value;
        break;
      case 'job_level':
        const jobLevels = unit.job_levels || {};
        const currentJobLevel = jobLevels[unit.current_job_id]?.level || 0;
        canUnlock = currentJobLevel >= potential.requirement_value;
        break;
      case 'transcendence':
        canUnlock = unit.transcendence_level >= potential.requirement_value;
        break;
    }

    if (!canUnlock) {
      return { success: false, message: `Requirements not met: ${potential.requirement_type} ${potential.requirement_value}` };
    }

    // Unlock potential
    const newPotentials = [...potentials, potentialId];
    const { error } = await supabase
      .from('units')
      .update({ potentials_unlocked: newPotentials })
      .eq('id', unitId);

    if (error) {
      gameDebugger.error('game-state', 'Failed to unlock potential', error);
      return { success: false, message: 'Error unlocking potential' };
    }

    gameDebugger.info('game-state', 'Potential unlocked', { unitId, potentialId });
    return { success: true, message: `${potential.name} unlocked!` };
  }

  /**
   * Obtiene el estado de progresión de una unidad
   */
  static async getUnitProgression(unitId: string): Promise<{
    level: number;
    exp: number;
    jobLevels: Record<string, { level: number; exp: number; skillPoints: number }>;
    transcendenceLevel: number;
    potentials: string[];
  } | null> {
    if (!supabase) return null;

    const { data: unit } = await supabase
      .from('units')
      .select('level, exp, job_levels, potentials_unlocked, transcendence_level')
      .eq('id', unitId)
      .single();

    if (!unit) return null;

    return {
      level: unit.level,
      exp: unit.exp,
      jobLevels: unit.job_levels || {},
      transcendenceLevel: unit.transcendence_level || 0,
      potentials: unit.potentials_unlocked || []
    };
  }

  /**
   * Calcula stats finales incluyendo bonuses de progresión
   */
  static calculateProgressionStats(
    baseStats: UnitStats,
    unitLevel: number,
    currentJobId: string,
    jobLevels: Record<string, any>,
    transcendenceLevel: number,
    potentials: string[]
  ): UnitStats {
    // Start with base stats
    let finalStats = { ...baseStats };

    // Add level bonus stats
    const levelBonus = getLevelBonusStats(unitLevel);
    finalStats.hp += levelBonus.hp || 0;
    finalStats.atk += levelBonus.atk || 0;
    finalStats.def += levelBonus.def || 0;
    finalStats.matk += levelBonus.matk || 0;
    finalStats.mdef += levelBonus.mdef || 0;
    finalStats.agi += levelBonus.agi || 0;

    // Add job level bonus
    const jobLevel = jobLevels[currentJobId]?.level || 1;
    const jobBonus = getJobLevelBonusStats(jobLevel);
    finalStats.hp += jobBonus.hp || 0;
    finalStats.atk += jobBonus.atk || 0;
    finalStats.def += jobBonus.def || 0;
    finalStats.agi += jobBonus.agi || 0;

    // Add transcendence bonus (each level adds 10% to all stats)
    if (transcendenceLevel > 0) {
      const transBonus = 1 + (transcendenceLevel * 0.1);
      finalStats.hp = Math.floor(finalStats.hp * transBonus);
      finalStats.atk = Math.floor(finalStats.atk * transBonus);
      finalStats.def = Math.floor(finalStats.def * transBonus);
      finalStats.matk = Math.floor(finalStats.matk * transBonus);
      finalStats.mdef = Math.floor(finalStats.mdef * transBonus);
      finalStats.agi = Math.floor(finalStats.agi * transBonus);
    }

    // TODO: Add potential bonuses (would need to fetch from potentials table)

    return finalStats;
  }
}