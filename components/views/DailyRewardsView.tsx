'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, ArrowLeft, Check, Calendar, Trophy } from 'lucide-react';
import { DailyRewardsService, DailyReward } from '@/lib/services/daily-rewards-service';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/contexts/ToastContext';

interface DailyRewardsViewProps {
  onBack: () => void;
  onUpdate: () => void;
}

export function DailyRewardsView({ onBack, onUpdate }: DailyRewardsViewProps) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<{
    currentStreak: number;
    canClaim: boolean;
    nextReward: DailyReward | null;
    rewards: DailyReward[];
  } | null>(null);
  const [claiming, setClaiming] = useState(false);

  const loadStatus = async () => {
    const data = await DailyRewardsService.getDailyRewardsStatus();
    setStatus(data);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await DailyRewardsService.claimDailyReward();
      if (res.success) {
        showToast(res.message, 'success');
        await loadStatus();
        onUpdate();
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setClaiming(false);
    }
  };

  if (!status) return null;

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 z-10">
        <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex flex-col">
          <h1 className="view-title">Recompensas Diarias</h1>
          <span className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
            Racha actual: {status.currentStreak} días
          </span>
        </div>
      </div>

      {/* Current Streak Display */}
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-3xl text-center">
        <Trophy size={32} className="text-[#F5C76B] mx-auto mb-2" />
        <p className="text-2xl font-black text-[#F5C76B] font-display">{status.currentStreak}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Días consecutivos</p>
      </div>

      {/* Rewards Grid */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {status.rewards.map((reward, idx) => {
          const isActive = idx === status.currentStreak % status.rewards.length;
          const isClaimed = idx < (status.currentStreak % status.rewards.length);
          
          return (
            <motion.div
              key={reward.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-[#F5C76B]/10 border-[#F5C76B]/40' 
                  : isClaimed
                  ? 'bg-white/5 border-white/10 opacity-60'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-[#F5C76B]/20' : 'bg-white/5'
                  }`}>
                    <Calendar size={18} className={isActive ? 'text-[#F5C76B]' : 'text-white/40'} />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase">{reward.message}</p>
                    <p className="text-[9px] text-white/40">Día {reward.day}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#F5C76B] font-black text-sm">+{reward.currency} oro</p>
                  <p className="text-[10px] text-white/40">+{reward.premium_currency} gems • +{reward.exp} EXP</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Claim Button */}
      <div className="mt-6">
        <Button
          onClick={handleClaim}
          disabled={!status.canClaim || claiming}
          variant="action"
          size="game"
          className="w-full"
        >
          <Gift size={20} />
          {claiming ? 'Reclamando...' : status.canClaim ? '¡Reclamar Recompensa!' : 'Ya reclamado hoy'}
        </Button>
      </div>
    </div>
  );
}
