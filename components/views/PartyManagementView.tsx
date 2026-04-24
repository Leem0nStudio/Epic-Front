'use client';

import React, { useState } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PartyManagementViewProps {
  saveData: any;
  activePartyUnits: any[];
  onNavigate: (view: any) => void;
  onAssignToParty: (slotIndex: number, unitId: string | null) => void;
  onRemoveFromParty: (slotIndex: number) => void;
}

export function PartyManagementView({ saveData, activePartyUnits, onNavigate, onAssignToParty, onRemoveFromParty }: PartyManagementViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const partySizeLimit = saveData.profile.party_size_limit;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors"><ChevronLeft size={20} /></button>
          <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider uppercase">Formación</h1>
        </div>
      </div>
      <div className="bg-[#1a110a] border-2 border-[#382618] p-6 rounded-xl shadow-inner mb-6 relative">
         <div className="flex flex-wrap justify-center gap-4">
            {[0, 1, 2, 3, 4].map((idx) => {
              const unit = activePartyUnits[idx];
              const isLocked = idx >= partySizeLimit;
              return (
                <div key={idx} onClick={() => !isLocked && setSelectedSlot(idx)} className={`relative w-20 h-24 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${selectedSlot === idx ? 'border-[#c79a5d] bg-[#c79a5d]/10' : 'border-[#382618] bg-black/40'} ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:border-[#5a4227] active:scale-95'}`}>
                  {isLocked ? <Shield size={24} className="text-[#382618]" /> : unit ? (<><img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[160%] transform translate-y-2" style={{imageRendering: 'pixelated'}} /><div className="absolute -bottom-2 bg-[#382618] border border-[#5a4227] px-1 rounded shadow-lg"><span className="text-[8px] font-black text-[#eacf9b]">LV.{unit.level}</span></div></>) : (<div className="w-8 h-8 border-2 border-dashed border-[#382618] rounded-full flex items-center justify-center"><Zap size={16} className="text-[#382618]" /></div>)}
                  <span className="absolute top-1 left-1 text-[7px] font-black text-[#382618] uppercase">P{idx+1}</span>
                </div>
              );
            })}
         </div>
      </div>
      <AnimatePresence mode="wait">
        {selectedSlot !== null ? (
          <motion.div key="selector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex-1 flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between"><h3 className="text-[10px] font-black text-[#a68a68] uppercase tracking-widest">Posición {selectedSlot + 1}</h3><button onClick={() => setSelectedSlot(null)} className="text-[10px] font-black text-[#b53c22] uppercase tracking-widest">Cerrar</button></div>
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2">
               {activePartyUnits[selectedSlot] && (<button onClick={() => { onRemoveFromParty(selectedSlot); setSelectedSlot(null); }} className="w-full bg-black/40 border-2 border-dashed border-[#b53c22]/50 p-3 rounded-lg text-[10px] font-black text-[#ea7a5d] uppercase tracking-widest">Retirar</button>)}
               {saveData.roster.filter((u: any) => !activePartyUnits.some(pu => pu?.id === u.id)).map((unit: any) => (
                 <div key={unit.id} onClick={() => { onAssignToParty(selectedSlot, unit.id); setSelectedSlot(null); }} className="bg-[#2c1d11] border-2 border-[#5a4227] p-3 rounded-xl flex items-center gap-4 hover:border-[#c79a5d] cursor-pointer">
                    <div className="w-12 h-12 bg-[#0d0805] border border-[#382618] rounded-lg flex items-center justify-center overflow-hidden"><img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[160%] transform translate-y-1" style={{imageRendering: 'pixelated'}} /></div>
                    <div className="flex-1 flex flex-col"><span className="font-black text-[#f2e6d5] uppercase text-sm">{unit.name}</span><div className="flex gap-4 mt-1"><div className="flex items-center gap-1 text-[9px] text-[#a68a68] font-bold"><Sword size={10} /> {unit.base_stats.atk}</div><div className="flex items-center gap-1 text-[9px] text-[#a68a68] font-bold"><Heart size={10} /> {unit.base_stats.hp}</div></div></div>
                    <ArrowRight size={16} className="text-[#382618]" />
                 </div>
               ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-3 overflow-hidden">
             <h3 className="text-[10px] font-black text-[#a68a68] tracking-widest uppercase">Todas las Unidades ({saveData.roster.length})</h3>
             <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2">
                {saveData.roster.map((unit: any) => (
                    <div key={unit.id} onClick={() => { saveData.selectedUnitId = unit.id; onNavigate('unit_details'); }} className="bg-[#1a110a] border-2 border-[#382618] p-3 rounded-xl flex items-center gap-4 hover:border-[#5a4227] cursor-pointer">
                        <div className="w-12 h-12 bg-[#0d0805] border border-[#382618] rounded-lg flex items-center justify-center overflow-hidden"><img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[160%] transform translate-y-1" style={{imageRendering: 'pixelated'}} /></div>
                        <div className="flex-1 flex flex-col"><span className="font-black text-[#f2e6d5] uppercase text-sm">{unit.name}</span><div className="flex gap-2"><span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-[#5a4227] text-[#a68a68] uppercase">{unit.current_job_id}</span><span className="text-[10px] font-black text-[#eacf9b]">LV.{unit.level}</span></div></div>
                        <ArrowRight size={16} className="text-[#382618]" />
                    </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
