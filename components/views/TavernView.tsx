'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AssetHelper } from '@/lib/utils/asset-helper';
import {
  ChevronLeft,
  UserPlus,
  Timer,
  Trash2,
  Check,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface TavernViewProps {
  saveData: any;
  onNavigate: (view: any) => void;
  onClaim: (slotId: string) => void;
  onDiscard: (slotId: string) => void;
}

export function TavernView({ saveData, onNavigate, onClaim, onDiscard }: TavernViewProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const getStatus = (availableAt: string) => {
    const isAvailable = new Date(availableAt).getTime() <= now;
    if (isAvailable) return 'READY';

    const diff = new Date(availableAt).getTime() - now;
    const mins = Math.ceil(diff / 60000);
    return `${mins}m`;
  };

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A] to-transparent opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10 shadow-2xl">
        <button onClick={() => onNavigate('home')} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Gremio</button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Taberna de Reclutamiento</span>
            <span className="text-[8px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Aventureros en Espera</span>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pb-24">
         <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Info size={48} className="text-white" /></div>
            <h3 className="text-white text-sm font-black uppercase tracking-wider mb-2 italic">Sistema de Reclutamiento</h3>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-medium">Nuevos aventureros llegan a la taberna cada 4 horas. ¡Dales una oportunidad para unirse a tu causa!</p>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {saveData.recruitmentQueue.map((slot: any) => {
               const unit = slot.unit_data;
               const status = getStatus(slot.available_at);
               const isReady = status === 'READY';

               return (
                 <motion.div
                   key={slot.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={`relative p-5 rounded-[28px] border transition-all ${isReady ? 'bg-white/5 border-white/10 hover:border-[#F5C76B]/40' : 'bg-black/40 border-white/5 opacity-60 grayscale'}`}
                 >
                   <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-2xl border ${isReady ? 'border-[#F5C76B]/20 bg-[#F5C76B]/5' : 'border-white/5 bg-white/5'} flex items-center justify-center overflow-hidden`}>
                         {isReady ? (
                           <img
                             src={AssetHelper.getUnitSprite(unit.spriteId, 'novice')}
                             className="w-[180%] transform translate-y-2"
                             style={{imageRendering: 'pixelated'}}
                             alt={unit.name}
                           />
                         ) : (
                           <UserPlus size={20} className="text-white/10" />
                         )}
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-xs font-black uppercase tracking-wider ${isReady ? 'text-white' : 'text-white/20'}`}>
                           {isReady ? unit.name : 'Aventurero Incógnito'}
                         </span>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-[#F5C76B] italic">NOVICE</span>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[10px] font-black text-white/40 uppercase">{unit.affinity}</span>
                         </div>
                      </div>

                      <div className="ml-auto flex flex-col items-end gap-2">
                         <div className={`px-2 py-1 rounded-lg border text-[8px] font-black tracking-widest uppercase ${isReady ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
                            {isReady ? <div className="flex items-center gap-1"><Sparkles size={8} /> Disponible</div> : <div className="flex items-center gap-1"><Timer size={8} /> {status}</div>}
                         </div>
                      </div>
                   </div>

                   {isReady && (
                     <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => onClaim(slot.id)}
                          className="flex-1 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] text-black font-black py-3 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          <Check size={14} /> Contratar
                        </button>
                        <button
                          onClick={() => onDiscard(slot.id)}
                          className="w-12 h-12 bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-xl flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                   )}
                 </motion.div>
               );
            })}
         </div>
      </div>
    </div>
  );
}
