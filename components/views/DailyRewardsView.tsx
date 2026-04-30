'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, ArrowLeft, Check, Calendar, Trophy, Star, Sparkles, Coins, Diamond } from 'lucide-react';
import { DailyRewardsService, DailyReward } from '@/lib/services/daily-rewards-service';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/contexts/ToastContext';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';

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
     
    setTimeout(() => setStatus(data), 0);
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

  if (!status) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1A2A] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-t-[#F5C76B] border-white/10 rounded-full" />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#F5C76B]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-5 mb-8 z-10">
        <button 
          onClick={onBack} 
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg btn-back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase font-display leading-none">
            Premios Diarios
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-8 bg-gradient-to-l from-[#F5C76B] to-transparent" />
            <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest font-stats">
              Protocolo de Lealtad
            </span>
          </div>
        </div>
      </div>

      {/* Streak Header */}
      <div className="mb-8 z-10">
        <NineSlicePanel type="border" className="p-6 text-center glass-frosted frame-earthstone relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5C76B]/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Trophy size={20} className="text-[#F5C76B] drop-shadow-[0_0_10px_rgba(245,199,107,0.5)]" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] font-stats italic">Tu Racha Actual</span>
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-black text-white italic tracking-tighter font-display drop-shadow-2xl">
                {status.currentStreak}
              </span>
              <span className="text-sm font-black text-[#F5C76B] uppercase tracking-widest font-stats italic">Días</span>
            </div>
            <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${(status.currentStreak % 7) / 7 * 100}%` }} 
                 className="h-full bg-[#F5C76B] shadow-[0_0_10px_#F5C76B]" 
               />
            </div>
          </div>
        </NineSlicePanel>
      </div>

      {/* Rewards List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar z-10">
        {status.rewards.map((reward, idx) => {
          const isActive = idx === status.currentStreak % status.rewards.length;
          const isClaimed = idx < (status.currentStreak % status.rewards.length);
          
          return (
            <motion.div
              key={reward.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <NineSlicePanel
                type="border"
                className={`p-4 rounded-2xl glass-frosted frame-earthstone transition-all ${
                  isActive 
                    ? 'border-[#F5C76B]/60 bg-[#F5C76B]/10 shadow-[0_0_20px_rgba(245,199,107,0.1)]' 
                    : isClaimed
                    ? 'opacity-40 grayscale-[0.5]'
                    : 'border-white/5 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner border ${
                      isActive ? 'bg-[#F5C76B]/20 border-[#F5C76B]/30' : 'bg-white/5 border-white/5'
                    }`}>
                      {isClaimed ? <Check size={20} className="text-green-400" /> : <Calendar size={20} className={isActive ? 'text-[#F5C76B]' : 'text-white/20'} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-wider font-display">
                        {reward.message}
                      </h4>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest font-stats">
                        Día {reward.day} de Reclutamiento
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-1.5 text-[#F5C76B]">
                      <Coins size={10} />
                      <span className="text-xs font-black font-stats">+{reward.currency}</span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                       <div className="flex items-center gap-1 text-cyan-400">
                          <Diamond size={8} />
                          <span className="text-[9px] font-black font-stats">+{reward.premium_currency}</span>
                       </div>
                       <div className="flex items-center gap-1 text-purple-400">
                          <Star size={8} />
                          <span className="text-[9px] font-black font-stats">+{reward.exp} XP</span>
                       </div>
                    </div>
                  </div>
                </div>
              </NineSlicePanel>
            </motion.div>
          );
        })}
      </div>

      {/* Claim Button Section */}
      <div className="mt-8 z-10">
        <Button
          onClick={handleClaim}
          disabled={!status.canClaim || claiming}
          variant="primary"
          className="w-full !rounded-[2rem] py-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="flex items-center justify-center gap-3 relative z-10">
            {claiming ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-t-black border-black/10 rounded-full" />
            ) : status.canClaim ? (
              <>
                <Sparkles size={20} className="text-black" />
                <span className="text-sm font-black uppercase italic tracking-[0.2em]">RECLAMAR RECOMPENSA</span>
              </>
            ) : (
              <>
                <Check size={20} className="text-black/40" />
                <span className="text-sm font-black uppercase italic tracking-[0.2em] text-black/40">VUELVE MAÑANA</span>
              </>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}
