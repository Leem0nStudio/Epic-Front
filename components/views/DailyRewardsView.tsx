'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Coins, Diamond, Zap, CheckCircle2 } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { Button } from '@/components/ui/Button';
import { ViewShell } from '@/components/ui/ViewShell';
import { supabase } from '@/lib/supabase';

interface DailyRewardsViewProps {
  onBack: () => void;
}

export function DailyRewardsView({ onBack }: DailyRewardsViewProps) {
  const [streak, setStreak] = useState(1);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: player } = await supabase
        .from('players')
        .select('last_login_bonus_at, login_streak')
        .eq('id', user.id)
        .single();

      if (player) {
        setStreak(player.login_streak || 1);
        setLastClaimDate(player.last_login_bonus_at);

        if (player.last_login_bonus_at) {
          const lastDate = new Date(player.last_login_bonus_at).toDateString();
          const today = new Date().toDateString();
          setClaimedToday(lastDate === today);
        }
      }
    }
    loadData();
  }, []);

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      if (!supabase) return;
      const { error } = await supabase.rpc('rpc_claim_daily_bonus');
      if (error) throw error;
      setClaimedToday(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <ViewShell title="RECOMPENSAS" subtitle="Bonos Diarios" onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-8">

        {/* Streak Hero */}
        <div className="bg-gradient-to-br from-[#F5C76B]/20 to-amber-900/40 border border-[#F5C76B]/30 rounded-[32px] p-8 text-center relative overflow-hidden">
           <div className="relative z-10">
              <div className="w-20 h-20 bg-[#F5C76B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_#F5C76B66]">
                 <Gift size={40} className="text-[#0B1A2A]" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase font-display">Racha de {streak} Días</h2>
              <p className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.3em] mt-2">Continúa regresando para mejores premios</p>
           </div>
           <div className="absolute inset-0 bg-[url('/assets/ui/pattern.png')] opacity-10" />
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-4 gap-3">
          {days.map((day) => {
            const isCompleted = day < streak || (day === streak && claimedToday);
            const isCurrent = day === streak && !claimedToday;

            return (
              <div
                key={day}
                className={`relative rounded-2xl border p-3 flex flex-col items-center gap-2 transition-all ${
                  isCompleted ? 'bg-[#F5C76B]/10 border-[#F5C76B]/40' :
                  isCurrent ? 'bg-white/10 border-white/40 scale-105 shadow-xl' :
                  'bg-black/40 border-white/5 opacity-40'
                }`}
              >
                <span className="text-[8px] font-black text-white/40 uppercase">Día {day}</span>
                {day % 7 === 0 ? <Diamond size={16} className="text-cyan-400" /> : <Coins size={16} className="text-[#F5C76B]" />}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                     <CheckCircle2 size={10} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action */}
        <div className="mt-auto">
           <Button
             variant="primary"
             size="game"
             className="w-full h-20"
             onClick={handleClaim}
             disabled={claimedToday || isLoading}
           >
              {claimedToday ? 'RECLAMADO' : 'RECLAMAR PREMIO'}
           </Button>
           {claimedToday && (
             <p className="text-center text-white/40 text-[10px] font-black uppercase mt-4 tracking-widest">Vuelve mañana para tu siguiente bono</p>
           )}
        </div>
      </div>
    </ViewShell>
  );
}
