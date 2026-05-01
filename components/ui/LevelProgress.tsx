'use client';

import { motion } from 'motion/react';
import { PROGRESSION_LEVELS, getUnlockForLevel } from '@/lib/config/level-curve';

interface LevelProgressProps {
  level: number;
  currentExp: number;
  showUnlocks?: boolean;
  compact?: boolean;
}

export function LevelProgress({ level, currentExp, showUnlocks = true, compact = false }: LevelProgressProps) {
  const currentConfig = PROGRESSION_LEVELS.find(c => c.level === level);
  const nextConfig = PROGRESSION_LEVELS.find(c => c.level === level + 1);
  
  if (!currentConfig) return null;
  
  const expForNext = nextConfig ? nextConfig.expRequired - currentConfig.expRequired : 0;
  const expInLevel = nextConfig ? currentExp - currentConfig.expRequired : 0;
  const percentToNext = expForNext > 0 ? Math.min(100, Math.floor((expInLevel / expForNext) * 100)) : 100;
  
  const nextUnlock = showUnlocks ? getUnlockForLevel(level + 1) : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm shadow-lg">
          {level}
        </div>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentToNext}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs text-white/50">{percentToNext}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Level Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-2xl font-black text-black">{level}</span>
            </div>
            {level >= 40 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">
                ⭐
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-bold">Nivel {level}</div>
            <div className="text-white/50 text-sm">
              {expInLevel.toLocaleString()} / {expForNext.toLocaleString()} EXP
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">{percentToNext}%</div>
          <div className="text-white/30 text-xs">al siguiente nivel</div>
        </div>
      </div>

      {/* Progress Bar with Milestones */}
      <div className="relative">
        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentToNext}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        {/* Milestone markers */}
        {[25, 50, 75].map((mark) => (
          <div 
            key={mark}
            className="absolute top-0 h-4 w-0.5 bg-white/20"
            style={{ left: `${mark}%` }}
          />
        ))}
      </div>

      {/* Next Unlock Preview */}
      {nextUnlock && nextUnlock.unlockId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
        >
          <div className="text-2xl">🔓</div>
          <div className="flex-1">
            <div className="text-purple-300 text-sm">Desbloquea en nivel {nextUnlock.level}</div>
            <div className="text-white font-medium">{nextUnlock.unlockName}</div>
          </div>
          <div className="text-white/30 text-xs">
            {Math.max(0, nextUnlock.expRequired - currentExp).toLocaleString()} EXP
          </div>
        </motion.div>
      )}
    </div>
  );
}