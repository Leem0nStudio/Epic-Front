'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Sparkles, Coins } from 'lucide-react';
import { motion } from 'motion/react';

interface TavernViewProps {
  saveData: any;
  onNavigate: (view: any) => void;
  onClaim: (slotId: string) => void;
  onDiscard: (slotId: string) => void;
}

export function TavernView({ saveData, onNavigate, onClaim, onDiscard }: TavernViewProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors"><ChevronLeft size={20} /></button>
          <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider uppercase">Taberna</h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
        {saveData.tavernSlots.map((slot: any) => {
          const isAvailable = now >= new Date(slot.available_at).getTime();
          const timeLeft = Math.max(0, new Date(slot.available_at).getTime() - now);
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          return (
            <motion.div key={slot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative bg-[#1a110a] border-2 rounded-xl p-4 flex flex-col gap-3 transition-all ${isAvailable ? 'border-[#c79a5d]' : 'border-[#382618] opacity-60'}`}>
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 rounded-xl backdrop-blur-[1px]">
                   <Clock className="text-[#a68a68] mb-2" size={32} />
                   <span className="text-[#eacf9b] font-mono font-bold text-xl">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                 <div className="w-20 h-20 bg-[#0d0805] border-2 border-[#5a4227] rounded-lg overflow-hidden flex items-center justify-center shrink-0"><img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[180%] transform translate-y-3" style={{imageRendering: 'pixelated'}} /></div>
                 <div className="flex-1">
                    <div className="flex items-center justify-between"><span className="font-serif font-black text-[#f2e6d5] text-lg uppercase">{slot.unit_data.name}</span><span className={`text-[8px] font-black px-2 py-1 rounded border uppercase ${slot.unit_data.affinity === 'physical' ? 'border-[#b53c22] text-[#ea7a5d]' : slot.unit_data.affinity === 'magic' ? 'border-[#44aaff] text-[#44aaff]' : 'border-[#b59d22] text-[#ead15d]'}`}>{slot.unit_data.affinity}</span></div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <div className="bg-black/40 rounded p-1 flex items-center justify-between border border-[#382618]"><span className="text-[8px] text-[#a68a68] font-bold">ATK</span><span className="text-[10px] text-[#eacf9b] font-mono">+{slot.unit_data.growthRates.atk}</span></div>
                       <div className="bg-black/40 rounded p-1 flex items-center justify-between border border-[#382618]"><span className="text-[8px] text-[#a68a68] font-bold">HP</span><span className="text-[10px] text-[#eacf9b] font-mono">+{slot.unit_data.growthRates.hp}</span></div>
                    </div>
                 </div>
              </div>
              {slot.unit_data.trait && (<div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-[#382618]"><Sparkles size={14} className="text-[#c79a5d]" /><span className="text-[10px] text-[#a68a68] uppercase font-bold tracking-wider">Rasgo: <b className="text-[#eacf9b]">{slot.unit_data.trait}</b></span></div>)}
              {isAvailable && (<button onClick={() => onClaim(slot.id)} className="w-full bg-gradient-to-b from-[#c79a5d] to-[#8c5a2b] text-[#1a110a] font-black py-3 rounded-lg uppercase tracking-widest text-sm shadow-lg">Reclutar</button>)}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
