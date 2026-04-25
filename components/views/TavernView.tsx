'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, UserPlus, Clock, Star, Coins, Sword, Heart, Zap, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { RecruitmentService } from '@/lib/services/recruitment-service';

interface TavernViewProps {
  saveData: any;
  onNavigate: (view: any) => void;
  onClaim: (slotId: string) => void;
  onDiscard: (slotId: string) => void;
}

export function TavernView({ saveData, onNavigate, onClaim }: TavernViewProps) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDiscard = async (slotId: string) => {
    if (!confirm("¿Deseas descartar este recluta? Se generará uno nuevo en el siguiente ciclo.")) return;
    try {
        await RecruitmentService.discardRecruit(slotId);
        window.location.reload();
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-center gap-4 mb-6 z-10">
        <button onClick={() => onNavigate('home')} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-white tracking-widest uppercase italic">Gremio de Reclutamiento</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar z-10">
        {saveData.tavernSlots.map((slot: any) => {
          const unit = slot.unit_data;
          const availableAt = new Date(slot.available_at).getTime();
          const isReady = now >= availableAt;
          const timeLeft = Math.max(0, Math.floor((availableAt - now) / 1000));

          const hours = Math.floor(timeLeft / 3600);
          const mins = Math.floor((timeLeft % 3600) / 60);
          const secs = timeLeft % 60;

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-black/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden transition-all ${isReady ? 'border-[#F5C76B]/40 shadow-[0_0_20px_rgba(245,199,107,0.1)]' : 'opacity-60'}`}
            >
              {!isReady && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20">
                  <Clock size={32} className="text-white/40" />
                  <p className="text-sm font-black text-white/60 tracking-widest font-mono">
                    {hours.toString().padStart(2, '0')}:{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                  </p>
                </div>
              )}

              <div className="flex gap-6">
                <div className="w-24 h-24 bg-black/60 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[180%] transform translate-y-3" style={{imageRendering: 'pixelated'}} alt="Unit Sprite" />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black text-white text-lg tracking-wider uppercase">{unit.name}</h3>
                        <span className="text-[10px] font-black text-[#F5C76B] bg-[#F5C76B]/10 px-1.5 rounded border border-[#F5C76B]/20 italic">NOVICE</span>
                    </div>
                    {isReady && (
                        <button onClick={() => handleDiscard(slot.id)} className="text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    )}
                  </div>

                  <div className="flex gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Afinidad</span>
                      <span className="text-[10px] font-bold text-white uppercase">{unit.affinity}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Rasgo</span>
                      <span className="text-[10px] font-bold text-[#F5C76B] uppercase">{unit.trait || 'Ninguno'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60"><Sword size={10} className="text-[#F5C76B]" /> {unit.base_stats?.atk || unit.baseStats?.atk}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60"><Heart size={10} className="text-red-400" /> {unit.base_stats?.hp || unit.baseStats?.hp}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60"><Zap size={10} className="text-cyan-400" /> {unit.base_stats?.agi || unit.baseStats?.agi}</div>
                  </div>
                </div>
              </div>

              {isReady && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onClaim(slot.id)}
                  className="w-full mt-5 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] text-black font-black py-3 rounded-xl uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Reclutar Unidad
                </motion.button>
              )}
            </motion.div>
          );
        })}

        {saveData.tavernSlots.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
             <UserPlus size={48} />
             <p className="text-xs font-black tracking-widest uppercase">No hay candidatos esperando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
