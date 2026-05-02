'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { LOGIN_BONUS_SCHEDULE, DailyBonus, canClaimDailyBonus } from '@/lib/config/login-bonus';
import { Button } from '@/components/ui/Button';

interface DailyBonusDisplayProps {
  streak: number;
  lastClaimDate: string | null;
  onClaim?: () => void;
  isLoading?: boolean;
}

export function DailyBonusDisplay({ streak, lastClaimDate, onClaim, isLoading }: DailyBonusDisplayProps) {
  const { canClaim, hoursUntilNext, streakBroken } = canClaimDailyBonus(lastClaimDate);
  const currentBonus = LOGIN_BONUS_SCHEDULE[(streak - 1) % 7];

  return (
    <div className="space-y-4">
      {/* Streak Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-white font-bold">Racha: {streak} días</div>
            {streakBroken && (
              <div className="text-red-400 text-xs">Racha reiniciada</div>
            )}
          </div>
        </div>
        {canClaim && (
          <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
            <span className="text-green-400 text-sm">¡Disponible!</span>
          </div>
        )}
      </div>

      {/* Week Progress */}
      <div className="grid grid-cols-7 gap-1">
        {LOGIN_BONUS_SCHEDULE.map((day, index) => {
          const isClaimed = index < (streak % 7);
          const isToday = index === ((streak - 1) % 7);
          
          return (
            <motion.div
              key={day.day}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative p-2 rounded-lg text-center
                ${isClaimed ? 'bg-yellow-500/20 border border-yellow-500/40' : ''}
                ${isToday && canClaim ? 'bg-green-500/20 border-2 border-green-400 animate-pulse' : ''}
                ${isToday && !canClaim ? 'bg-amber-500/20 border border-amber-500/40' : ''}
                ${!isClaimed && !isToday ? 'bg-white/5 border border-white/10' : ''}
              `}
            >
              <div className="text-white/50 text-xs">Día {day.day}</div>
              <div className="text-lg">
                {isClaimed ? '✅' : day.premiumCurrency > 0 ? '💎' : '🪙'}
              </div>
              <div className="text-white/30 text-xs">{day.currency}</div>
              {day.isSpecial && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-xs flex items-center justify-center">
                  ★
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current Reward */}
      {canClaim && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-500/40"
        >
          <div className="text-center mb-4">
            <div className="text-amber-300 text-sm mb-1">Recompensa de hoy</div>
            <div className="text-2xl font-bold text-white">
              {currentBonus.currency} 🪙 + {currentBonus.premiumCurrency} 💎
            </div>
            {currentBonus.item && (
              <div className="text-purple-300 text-sm">+ {currentBonus.item}</div>
            )}
          </div>
          
          <Button
            onClick={onClaim}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold"
          >
            {isLoading ? 'Reclamando...' : '🎁 Reclamar Recompensa'}
          </Button>
        </motion.div>
      )}

      {!canClaim && (
        <div className="text-center p-4 bg-white/5 rounded-lg">
          <div className="text-white/50">Próxima recompensa en</div>
          <div className="text-2xl font-bold text-white">{hoursUntilNext}h</div>
        </div>
      )}
    </div>
  );
}