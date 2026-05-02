'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Gift, Coins, Diamond, Zap } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { Button } from '@/components/ui/Button';
import { DailyBonusDisplay } from '@/components/ui/DailyBonus';
import { supabase } from '@/lib/supabase';

interface DailyRewardsViewProps {
  onBack: () => void;
}

export function DailyRewardsView({ onBack }: DailyRewardsViewProps) {
  const [streak, setStreak] = useState(1);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDailyRewardsState = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('player_daily_rewards')
      .select('*')
      .eq('player_id', user.id)
      .single();

    if (data) {
      setStreak(data.streak || 1);
      setLastClaimDate(data.last_claim_date);
    }
  };

  useEffect(() => {
    loadDailyRewardsState();
  }, []);

  const handleClaim = async () => {
    if (!supabase) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const rewards = [
        { day: 1, currency: 100, premium: 0 },
        { day: 2, currency: 150, premium: 5 },
        { day: 3, currency: 200, premium: 10 },
        { day: 4, currency: 250, premium: 10 },
        { day: 5, currency: 300, premium: 15 },
        { day: 6, currency: 350, premium: 20 },
        { day: 7, currency: 500, premium: 50 },
      ];
      
      const currentReward = rewards[(streak - 1) % 7];
      
      const { error } = await supabase.rpc('rpc_claim_daily_reward', {
        p_reward_currency: currentReward.currency,
        p_reward_premium: currentReward.premium,
        p_reward_exp: streak * 50
      });

      if (error) throw error;

      setStreak(prev => prev + 1);
      setLastClaimDate(new Date().toISOString().split('T')[0]);
      setMessage({ 
        type: 'success', 
        text: `+${currentReward.currency} 🪙 +${currentReward.premium} 💎` 
      });

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al reclamar' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/80 via-[#0B1A2A]/60 to-[#020508]/95 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10"
        >
          <ChevronLeft className="text-white" size={24} />
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl border border-purple-500/40">
            <Gift className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Recompensas Diarias</h1>
            <p className="text-white/40 text-xs">¡No olvides reclamar cada día!</p>
          </div>
        </div>

        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Streak Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/30"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-6xl">🔥</div>
              <div>
                <div className="text-4xl font-black text-white">{streak}</div>
                <div className="text-amber-400 text-sm font-medium">Días de Racha</div>
              </div>
            </div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center p-3 rounded-lg mb-4 ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400' 
                    : 'bg-red-500/20 border border-red-500/40 text-red-400'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </motion.div>

          {/* Daily Bonus Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <DailyBonusDisplay
              streak={streak}
              lastClaimDate={lastClaimDate}
              onClaim={handleClaim}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20"
          >
            <div className="text-blue-300 text-sm font-medium mb-2">💡 ¿Cómo funciona?</div>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• Reclama tu recompensa diaria para mantener tu racha</li>
              <li>• Cada 7 días el ciclo se reinicia con bonus especial</li>
              <li>• Si te saltas un día, la racha se reinicia</li>
              <li>• Las recompensas aumentan con tu racha</li>
            </ul>
          </motion.div>

          {/* Rewards Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-black/30 rounded-xl border border-white/5"
          >
            <div className="text-white/50 text-xs font-medium mb-3">PRÓXIMAS RECOMPENSAS</div>
            <div className="grid grid-cols-7 gap-2">
              {[
                { day: 1, c: 100, g: 0 },
                { day: 2, c: 150, g: 5 },
                { day: 3, c: 200, g: 10 },
                { day: 4, c: 250, g: 10 },
                { day: 5, c: 300, g: 15 },
                { day: 6, c: 350, g: 20 },
                { day: 7, c: 500, g: 50 },
              ].map((r, i) => (
                <div 
                  key={r.day}
                  className={`text-center p-2 rounded-lg ${
                    i < (streak - 1) % 7 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : i === (streak - 1) % 7 
                        ? 'bg-yellow-500/20 border-2 border-yellow-400 animate-pulse'
                        : 'bg-white/5'
                  }`}
                >
                  <div className="text-[10px] text-white/40">Día {r.day}</div>
                  <div className="text-xs">🪙{r.c}</div>
                  <div className="text-[10px] text-cyan-400">💎{r.g}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}