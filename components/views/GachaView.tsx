'use client';
import { AssetService } from '@/lib/services/asset-service';

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Diamond, Coins, Star, Sword, Box, ScrollText } from 'lucide-react';
import { GachaService } from '@/lib/services/gacha-service';
import { motion, AnimatePresence } from 'motion/react';

interface GachaViewProps {
  profile: any;
  onNavigate: (view: any) => void;
}

export function GachaView({ profile, onNavigate }: GachaViewProps) {
  const [results, setResults] = useState<any[]>([]);
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = async (amount: number, currency: 'soft' | 'premium') => {
    setIsPulling(true);
    try {
      const items = await GachaService.pull(amount, currency);
      setResults(items);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsPulling(false);
    }
  };

  const rarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'from-yellow-400 to-orange-600 shadow-orange-500/50';
      case 'epic': return 'from-purple-400 to-indigo-600 shadow-purple-500/50';
      case 'rare': return 'from-blue-400 to-cyan-600 shadow-blue-500/50';
      default: return 'from-gray-400 to-gray-600 shadow-gray-500/50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] bg-cover bg-center bg-no-repeat p-4 overflow-hidden relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('gacha')}')` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-white tracking-widest uppercase italic">Invocación</h1>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <Coins size={14} className="text-[#F5C76B]" />
            <span className="text-xs font-bold text-white">{profile.currency}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <Diamond size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-white">{profile.premium_currency}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="grid grid-cols-5 gap-3 w-full max-w-md bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl"
            >
              <div className="col-span-5 flex items-center justify-between mb-2">
                <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Resultados de Invocación</h2>
                <button onClick={() => setResults([])} className="text-[10px] font-black text-[#F5C76B] uppercase">Cerrar</button>
              </div>
              {results.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${rarityColor(item.item_rarity)} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-black/40 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                      {item.item_type === 'weapon' ? <Sword size={24} className="text-white/80" /> :
                     item.item_type === 'card' ? <Sparkles size={24} className="text-white/80" /> :
                     item.item_type === 'skill' ? <ScrollText size={24} className="text-white/80" /> :
                     item.item_type === 'job_core' ? <img src={AssetService.getIconUrl(AssetService.getJobIconId(item.item_id.replace('core_', '')))} className="w-8 h-8 object-contain" /> :
                     <Box size={24} className="text-white/80" />}
                      <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    </div>
                  </div>
                  <span className="text-[7px] font-black text-white/60 uppercase truncate w-full text-center tracking-tighter">{item.item_name}</span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-48 h-48 relative flex items-center justify-center mb-12"
              >
                <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full" />
                <Sparkles size={120} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
              </motion.div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isPulling}
                  onClick={() => handlePull(1, 'soft')}
                  className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-white/5 transition-colors relative overflow-hidden group"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#F5C76B]/20" />
                  <Coins size={24} className="text-[#F5C76B]" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-white/40 tracking-widest mb-1">NORMAL</p>
                    <p className="text-lg font-black text-white">x1</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 opacity-60">
                    <Coins size={12} className="text-[#F5C76B]" />
                    <span className="text-xs font-bold text-white">100</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isPulling}
                  onClick={() => handlePull(10, 'premium')}
                  className="bg-gradient-to-br from-[#1a1c2e] to-[#0B1A2A] border border-cyan-500/20 p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-cyan-500/40 transition-all relative overflow-hidden group shadow-xl"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-cyan-500/40" />
                  <Diamond size={24} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-cyan-400/60 tracking-widest mb-1">PREMIUM</p>
                    <p className="text-lg font-black text-white">x10</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Diamond size={12} className="text-cyan-400" />
                    <span className="text-xs font-bold text-white">450</span>
                    <span className="text-[8px] font-black text-cyan-400 bg-cyan-500/10 px-1 rounded-sm ml-1">-10%</span>
                  </div>
                </motion.button>
              </div>

              <div className="mt-12 flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 text-white/40">
                   <div className="h-[1px] w-12 bg-white/5" />
                   <span className="text-[9px] font-black tracking-[0.4em] uppercase">Garantía Pity</span>
                   <div className="h-[1px] w-12 bg-white/5" />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                     <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                     <span className="text-[8px] font-black text-white/60 tracking-wider">ÉPICO EN: <span className="text-purple-400">10</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                     <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                     <span className="text-[8px] font-black text-white/60 tracking-wider">UR EN: <span className="text-orange-400">80</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {isPulling && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center flex-col gap-4">
           <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-t-[#F5C76B] border-white/5 rounded-full"
           />
           <p className="text-[10px] font-black text-[#F5C76B] tracking-[0.5em] animate-pulse">INVOCANDO...</p>
        </div>
      )}
    </div>
  );
}
