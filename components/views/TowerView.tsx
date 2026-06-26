'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Shield, Sword, Crown, Clock, Flame, Lock, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ViewShell } from '@/components/ui/ViewShell';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { TowerService, type TowerProgress, type FloorResult } from '@/lib/services/tower-service';
import { gameDebugger } from '@/lib/debug';

interface TowerViewProps {
  onBack: () => void;
  onBattleStart?: (floor: number) => void;
}

export function TowerView({ onBack, onBattleStart }: TowerViewProps) {
  const [progress, setProgress] = useState<TowerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completingFloor, setCompletingFloor] = useState<number | null>(null);

  const loadProgress = useCallback(async () => {
    try {
      const data = await TowerService.getProgress();
      setProgress(data);
    } catch (e) {
      gameDebugger.error('tower', 'Failed to load tower progress', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const handleChallengeFloor = async (floor: number) => {
    if (onBattleStart) {
      onBattleStart(floor);
      return;
    }
    // Fallback: complete floor directly (for testing)
    setCompletingFloor(floor);
    try {
      const result: FloorResult = await TowerService.completeFloor(floor, 3);
      gameDebugger.info('tower', `Floor ${floor} completed`, result);
      await loadProgress();
    } catch (e) {
      gameDebugger.error('tower', `Failed to complete floor ${floor}`, e);
    } finally {
      setCompletingFloor(null);
    }
  };

  const highestFloor = progress?.highestFloor || 0;
  const nextFloor = highestFloor + 1;
  const totalFloors = 100;

  // Generate floor list (show 10 floors around current)
  const startFloor = Math.max(1, nextFloor - 3);
  const endFloor = Math.min(totalFloors, nextFloor + 6);
  const floors = Array.from({ length: endFloor - startFloor + 1 }, (_, i) => {
    const floorNum = startFloor + i;
    const isCompleted = floorNum <= highestFloor;
    const isUnlocked = floorNum <= nextFloor;
    const isBoss = floorNum % 10 === 0;
    const stars = isCompleted ? 3 : 0; // Simplified: all completed floors get 3 stars
    const enemyPower = Math.floor(100 + (floorNum * 150) + (floorNum * floorNum * 5));
    return { floorNum, isCompleted, isUnlocked, isBoss, stars, enemyPower };
  }).reverse();

  // Calculate time left
  const seasonEnd = progress?.seasonId ? null : null; // Would need season data
  const timeLeft = '30D 00H';

  return (
    <ViewShell
      title="TORRE INFINITA"
      subtitle="Ascensión del Guardián"
      onBack={onBack}
      background="battle"
      loading={isLoading}
    >
      <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">

        {/* Tower Info Bar */}
        <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted frame-earthstone shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Flame size={24} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">PISO MÁS ALTO</p>
                <p className="text-lg font-black text-white font-display">PISO {highestFloor}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">PRÓXIMO</p>
              <p className="text-2xl font-black text-[#F5C76B] font-display">{nextFloor}</p>
            </div>
          </div>
        </NineSlicePanel>

        {/* Energy Cost Info */}
        <div className="flex items-center gap-2 px-1 shrink-0">
          <Zap size={12} className="text-blue-400" />
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
            COSTO: {3 + Math.floor(nextFloor / 10)} ENERGÍA · RECOMPENSAS ESCALAN CON EL PISO
          </span>
        </div>

        {/* Floors List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {floors.map((f) => (
            <motion.div
              key={f.floorNum}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.02 }}
            >
              <NineSlicePanel
                type="border"
                variant="default"
                className={`p-4 flex items-center justify-between glass-frosted transition-all ${
                  f.isUnlocked && !f.isCompleted
                    ? 'hover:border-[#F5C76B]/40 cursor-pointer'
                    : f.isCompleted
                    ? 'bg-green-500/5'
                    : 'opacity-40 grayscale pointer-events-none'
                }`}
                onClick={() => f.isUnlocked && !f.isCompleted ? handleChallengeFloor(f.floorNum) : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-display text-sm ${
                    f.isBoss
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : f.isUnlocked
                      ? 'bg-[#F5C76B]/10 border-[#F5C76B]/20 text-[#F5C76B]'
                      : 'bg-white/5 border-white/10 text-white/20'
                  }`}>
                    {f.floorNum}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase font-display leading-none">
                      {f.isBoss ? 'PISO DE JEFE' : `Piso ${f.floorNum}`}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Sword size={9} className="text-white/20" />
                      <span className="text-[9px] font-black text-white/40 font-stats">{f.enemyPower.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {f.isCompleted ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(i => <Crown key={i} size={10} className="text-[#F5C76B] fill-[#F5C76B]" />)}
                    </div>
                  ) : !f.isUnlocked ? (
                    <Lock size={14} className="text-white/10" />
                  ) : completingFloor === f.floorNum ? (
                    <span className="text-[9px] font-black text-white/40 animate-pulse">...</span>
                  ) : (
                    <ChevronRight size={14} className="text-white/20" />
                  )}
                </div>
              </NineSlicePanel>
            </motion.div>
          ))}
        </div>

        {/* Season Timer */}
        <div className="flex items-center gap-2 px-2 shrink-0">
          <Clock size={12} className="text-white/20" />
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">REINICIO EN: {timeLeft}</p>
        </div>
      </div>
    </ViewShell>
  );
}
