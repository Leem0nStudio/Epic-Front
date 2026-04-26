'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Sparkles,
  Diamond,
  Coins,
  History,
  Zap,
  Package,
  Star,
  Info
} from 'lucide-react';
import { GachaService } from '@/lib/services/gacha-service';
import { GachaState } from '@/lib/rpg-system/gacha-types';

interface GachaViewProps {
  profile: any;
  onNavigate: (view: any) => void;
}

export function GachaView({ profile, onNavigate }: GachaViewProps) {
  const [pulling, setPulling] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [gachaState, setGachaState] = useState<GachaState | null>(null);

  useEffect(() => {
    async function loadState() {
      const state = await GachaService.getGachaState();
      setGachaState(state);
    }
    loadState();
  }, [results]);

  const handlePull = async (amount: number, type: 'soft' | 'premium') => {
    setPulling(true);
    try {
      const res = await GachaService.pull(amount, type);
      setResults(res);
    } catch (e: any) {
      alert(e.message || "Error al realizar invocación");
    } finally {
      setPulling(false);
    }
  };

  const rarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10 shadow-2xl">
        <button onClick={() => onNavigate('home')} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Volver</button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Invocación</span>
            <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Nexo de Etherea</span>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative flex flex-col items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.1),transparent)] pointer-events-none" />

        {/* Banner Section */}
        <div className="w-full aspect-video bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-[32px] border border-white/10 relative overflow-hidden mb-8 group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <Sparkles size={48} className="text-[#F5C76B] mb-4 drop-shadow-[0_0_15px_rgba(245,199,107,0.5)]" />
              <h2 className="text-2xl font-black text-white tracking-widest uppercase italic drop-shadow-2xl">Cofre de Componentes</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-2 font-bold">Obtén Cartas, Armas y Habilidades Legendarias</p>
           </div>

           {/* Pity Counter */}
           <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-4">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                 <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">SR: {10 - (gachaState?.pulls_since_epic || 0)} Pulls</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                 <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">UR: {50 - (gachaState?.pulls_since_legendary || 0)} Pulls</span>
              </div>
           </div>
        </div>

        {/* Currency Display */}
        <div className="flex gap-4 mb-12">
           <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
              <Coins size={14} className="text-[#F5C76B]" />
              <span className="text-xs font-black text-white">{profile.currency}</span>
           </div>
           <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
              <Diamond size={14} className="text-cyan-400" />
              <span className="text-xs font-black text-white">{profile.premium_currency}</span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
           <button
             disabled={pulling}
             onClick={() => handlePull(1, 'soft')}
             className="group relative bg-white/5 border border-white/10 p-6 rounded-[32px] hover:border-[#F5C76B]/40 transition-all active:scale-95 flex items-center justify-between"
           >
              <div className="flex flex-col text-left">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Invocación Única</span>
                 <span className="text-sm font-black text-white uppercase tracking-wider italic mt-1">1 Componente</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                 <Coins size={12} className="text-[#F5C76B]" />
                 <span className="text-xs font-black text-white">100</span>
              </div>
           </button>

           <button
             disabled={pulling}
             onClick={() => handlePull(10, 'premium')}
             className="group relative bg-gradient-to-br from-[#F5C76B]/10 to-indigo-500/10 border border-[#F5C76B]/20 p-6 rounded-[32px] hover:border-[#F5C76B]/60 transition-all active:scale-95 flex items-center justify-between"
           >
              <div className="flex flex-col text-left">
                 <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest">Multi-Invocación</span>
                 <span className="text-sm font-black text-white uppercase tracking-wider italic mt-1">10 Componentes</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F5C76B] px-3 py-1.5 rounded-xl text-black">
                 <Diamond size={12} className="fill-current" />
                 <span className="text-xs font-black">450</span>
              </div>
              <div className="absolute -top-3 -right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-lg transform rotate-12">-10% DESC</div>
           </button>
        </div>
      </div>

      {/* Results Overlay */}
      <AnimatePresence>
        {(pulling || results) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8"
          >
            {pulling ? (
              <div className="flex flex-col items-center gap-6">
                 <motion.div
                   animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-20 h-20 rounded-full border-2 border-t-[#F5C76B] border-white/5"
                 />
                 <p className="text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.5em] animate-pulse italic">Manifestando Destino...</p>
              </div>
            ) : (
              <div className="w-full max-w-md">
                 <h3 className="text-2xl font-black text-white tracking-[0.3em] uppercase italic text-center mb-8">Hallazgos Extraídos</h3>
                 <div className="grid grid-cols-2 gap-3 mb-10 overflow-y-auto max-h-[400px] p-2">
                    {results?.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 text-center"
                      >
                         <div className={`w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border ${rarityColor(item.item_rarity)}/20`}>
                            <Package size={20} className={rarityColor(item.item_rarity)} />
                         </div>
                         <span className={`text-[9px] font-black uppercase tracking-wider ${rarityColor(item.item_rarity)}`}>{item.item_name}</span>
                         <span className="text-[7px] text-white/20 font-black uppercase tracking-[0.2em]">{item.item_type}</span>
                      </motion.div>
                    ))}
                 </div>
                 <button
                   onClick={() => setResults(null)}
                   className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                 >
                   Cerrar Portal
                 </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
