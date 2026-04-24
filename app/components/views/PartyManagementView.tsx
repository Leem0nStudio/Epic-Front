import React, { useState } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, Sparkles, Wand2, ArrowRight } from 'lucide-react';
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
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('home')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider">FORMACIÓN DE COMBATE</h1>
      </div>

      {/* Party Layout */}
      <div className="bg-[#1a110a] border border-[#382618] p-4 rounded-lg shadow-inner mb-6 relative">
         <div className="grid grid-cols-3 gap-4 h-[200px]">
            {[0, 1, 2, 3, 4].map((idx) => {
              const unit = activePartyUnits[idx];
              const isLocked = idx >= partySizeLimit;

              return (
                <div
                  key={idx}
                  onClick={() => !isLocked && setSelectedSlot(idx)}
                  className={`relative rounded border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2
                    ${selectedSlot === idx ? 'border-[#c79a5d] bg-[#c79a5d]/10' : 'border-[#382618] bg-black/20'}
                    ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-[#5a4227]'}
                    ${idx === 3 || idx === 4 ? 'col-span-1.5' : ''}
                  `}
                >
                  {isLocked ? (
                    <Shield size={24} className="text-[#a68a68]" />
                  ) : unit ? (
                    <>
                      <div className="w-16 h-16 relative">
                         <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[180%] max-w-none transform translate-y-2 translate-x-[-10%] brightness-110" style={{imageRendering: 'pixelated'}} />
                      </div>
                      <div className="absolute -bottom-2 bg-[#382618] px-2 py-0.5 rounded border border-[#5a4227] shadow-lg">
                        <span className="text-[10px] font-bold text-[#eacf9b]">LV.{unit.level}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-10 h-10 border-2 border-dashed border-[#382618] rounded-full flex items-center justify-center">
                       <Zap size={20} className="text-[#382618]" />
                    </div>
                  )}
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-[#a68a68]">P{idx+1}</span>
                </div>
              );
            })}
         </div>
         {/* Label */}
         <div className="absolute top-1/2 left-0 w-full flex justify-between px-2 pointer-events-none opacity-20">
            <span className="text-[10px] font-bold -rotate-90">REAGUARDIA</span>
            <span className="text-[10px] font-bold -rotate-90">VANGUARDIA</span>
         </div>
      </div>

      {/* Unit Selector (If slot selected) */}
      <AnimatePresence>
        {selectedSlot !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 flex flex-col gap-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-[#a68a68] tracking-widest uppercase">Elegir para Posición {selectedSlot + 1}</h3>
               <button onClick={() => setSelectedSlot(null)} className="text-[10px] font-bold text-[#c79a5d]">CANCELAR</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2">
               {/* Option to clear slot */}
               <button
                 onClick={() => { onRemoveFromParty(selectedSlot); setSelectedSlot(null); }}
                 className="shrink-0 bg-black/40 border border-dashed border-[#b53c22]/50 p-3 rounded text-center text-[11px] font-bold text-[#ea7a5d] hover:bg-[#b53c22]/10 transition-colors"
               >
                 VACIAR POSICIÓN
               </button>

               {saveData.roster.filter((u: any) => !saveData.party.includes(u.id)).map((unit: any) => (
                 <div
                   key={unit.id}
                   onClick={() => { onAssignToParty(selectedSlot, unit.id); setSelectedSlot(null); }}
                   className="shrink-0 bg-[#2c1d11] border border-[#5a4227] p-3 rounded flex items-center gap-4 hover:border-[#c79a5d] transition-all cursor-pointer group"
                 >
                    <div className="w-12 h-12 bg-black/40 rounded border border-[#382618] flex items-center justify-center overflow-hidden">
                       <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[180%] max-w-none transform translate-y-1 brightness-90" style={{imageRendering: 'pixelated'}} />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between">
                          <span className="font-bold text-[#f2e6d5]">{unit.name}</span>
                          <span className="text-[10px] font-bold text-[#eacf9b]">LV.{unit.level}</span>
                       </div>
                       <div className="flex gap-4 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-[#a68a68]">
                             <Sword size={10} /> <span>{unit.base_stats.atk}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#a68a68]">
                             <Heart size={10} /> <span>{unit.base_stats.hp}</span>
                          </div>
                       </div>
                    </div>
                    <ArrowRight size={16} className="text-[#382618] group-hover:text-[#c79a5d] transition-colors" />
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedSlot && (
         <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center px-8 gap-4">
            <Users size={48} />
            <p className="text-sm italic">Selecciona una posición en la formación para asignar o cambiar unidades de tu reserva.</p>
         </div>
      )}
    </div>
  );
}

function Users({ size }: { size: number }) {
  return (
    <div className="flex gap-[-10px]">
       <div className="w-12 h-12 rounded-full border-2 border-[#5a4227] bg-[#1a110a] flex items-center justify-center translate-x-2">
          <Shield size={24} className="text-[#a68a68]" />
       </div>
       <div className="w-12 h-12 rounded-full border-2 border-[#c79a5d] bg-[#2c1d11] flex items-center justify-center z-10 scale-110">
          <Sword size={24} className="text-[#eacf9b]" />
       </div>
       <div className="w-12 h-12 rounded-full border-2 border-[#5a4227] bg-[#1a110a] flex items-center justify-center -translate-x-2">
          <Wand2 size={24} className="text-[#a68a68]" />
       </div>
    </div>
  )
}
