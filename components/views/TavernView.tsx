'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const slots = saveData.tavernSlots || [];

  const getStatus = (availableAt: string) => {
    const isAvailable = new Date(availableAt) <= new Date();
    if (isAvailable) return 'READY';

    const diff = new Date(availableAt).getTime() - Date.now();
    const mins = Math.ceil(diff / 60000);
    return `${mins}m`;
  };

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10 shadow-2xl">
        <button onClick={() => onNavigate('home')} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Volver</button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Taberna Real</span>
            <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Reclutamiento de Novatos</span>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />

        <div className="mb-8 text-center relative">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">Aventureros en Espera</h2>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mt-2">Nuevos novatos llegan al gremio cada 4 horas</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {slots.map((slot: any, i: number) => {
            const status = getStatus(slot.available_at);
            const isReady = status === 'READY';
            const unit = slot.unit_data;

            return (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white/5 border ${isReady ? 'border-[#F5C76B]/20' : 'border-white/5'} rounded-[32px] p-6 overflow-hidden group`}
              >
                <div className="flex items-start justify-between relative z-10">
                   <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-2xl border ${isReady ? 'border-[#F5C76B]/20 bg-[#F5C76B]/5' : 'border-white/5 bg-white/5'} flex items-center justify-center overflow-hidden`}>
                         {isReady ? (
                           <img
                             src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
                             className="w-[180%] transform translate-y-2"
                             style={{imageRendering: 'pixelated'}}
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
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isReady ? 'bg-[#F5C76B] text-black' : 'bg-white/5 text-white/20'} uppercase`}>
                              {isReady ? unit.affinity : 'Pendiente'}
                            </span>
                            {unit.trait && isReady && (
                                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">{unit.trait}</span>
                            )}
                         </div>
                      </div>
                   </div>

                   <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isReady ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-black/40 border-white/5 text-white/40'}`}>
                      {isReady ? <Sparkles size={10} /> : <Timer size={10} />}
                      <span className="text-[9px] font-black uppercase tracking-widest">{status}</span>
                   </div>
                </div>

                {isReady && (
                    <div className="mt-6 flex gap-3 relative z-10">
                        <button
                          onClick={() => onClaim(slot.id)}
                          className="flex-1 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] text-black font-black text-[9px] uppercase tracking-widest py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            <Check size={14} /> Reclutar
                        </button>
                        <button
                          onClick={() => onDiscard(slot.id)}
                          className="w-12 bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C76B]/5 blur-[60px] rounded-full pointer-events-none -mr-16 -mt-16 group-hover:bg-[#F5C76B]/10 transition-colors" />
              </motion.div>
            );
          })}

          {slots.length === 0 && (
             <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                <Timer size={48} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Taberna Vacía...</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
