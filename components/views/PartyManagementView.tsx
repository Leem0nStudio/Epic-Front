'use client';
import { AssetService } from '@/lib/services/asset-service';

import React, { useState } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, ArrowRight, UserMinus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PartyManagementViewProps {
  saveData: any;
  activePartyUnits: any[];
  onNavigate: (view: any) => void;
  onAssignToParty: (slotIndex: number, unitId: string | null) => void;
  onRemoveFromParty: (slotIndex: number) => void;
  onSelectUnit: (unitId: string) => void;
}

export function PartyManagementView({
    saveData,
    activePartyUnits,
    onNavigate,
    onAssignToParty,
    onRemoveFromParty,
    onSelectUnit
}: PartyManagementViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const partySizeLimit = saveData.profile.party_size_limit;

  const rarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
      case 'ur': return 'border-[#F5C76B] text-[#F5C76B]';
      case 'epic':
      case 'sr': return 'border-purple-500 text-purple-400';
      case 'rare':
      case 'r': return 'border-blue-500 text-blue-400';
      default: return 'border-white/10 text-white/40';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] bg-cover bg-center bg-no-repeat p-4 overflow-hidden relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('party')}')` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none" />

      <div className="flex items-center gap-4 mb-6 z-10 shrink-0">
        <button onClick={() => onNavigate('home')} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-white tracking-widest uppercase italic">Formación de Combate</h1>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-2xl mb-6 relative z-10 shrink-0">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Escuadrón Activo</h3>
            <span className="text-[10px] font-black text-[#F5C76B]">{activePartyUnits.filter(u => u).length}/{partySizeLimit}</span>
         </div>
         <div className="flex flex-wrap justify-center gap-3">
            {[0, 1, 2, 3, 4].map((idx) => {
              const unit = activePartyUnits[idx];
              const isLocked = idx >= partySizeLimit;
              return (
                <motion.div
                  key={idx}
                  whileTap={{ scale: isLocked ? 1 : 0.95 }}
                  onClick={() => !isLocked && setSelectedSlot(idx)}
                  className={`relative w-16 h-20 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                    ${selectedSlot === idx ? 'border-[#F5C76B] bg-[#F5C76B]/10 ring-2 ring-[#F5C76B]/20' : 'border-white/10 bg-black/60'}
                    ${isLocked ? 'opacity-20 grayscale' : 'hover:border-white/20'}`}
                >
                  {isLocked ? (
                    <Shield size={20} className="text-white/20" />
                  ) : unit ? (
                    <>
                      <img
                        src={AssetService.getSpriteUrl(unit.sprite_id)}
                        className="w-[180%] transform translate-y-3"
                        style={{imageRendering: 'pixelated'}}
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 border-t border-white/10">
                        <span className="text-[7px] font-black text-center block text-white/60">LV.{unit.level}</span>
                      </div>
                    </>
                  ) : (
                    <Plus size={16} className="text-white/20" />
                  )}
                  <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                    <span className="text-[6px] font-black text-white/40">{idx+1}</span>
                  </div>
                </motion.div>
              );
            })}
         </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedSlot !== null ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 flex flex-col gap-4 overflow-hidden z-10"
          >
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest flex items-center gap-2">
                <ArrowRight size={12} /> Asignar Posición {selectedSlot + 1}
              </h3>
              <button onClick={() => setSelectedSlot(null)} className="text-[10px] font-black text-white/40 uppercase hover:text-white transition-colors">Cancelar</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
               {activePartyUnits[selectedSlot] && (
                 <button
                  onClick={() => { onRemoveFromParty(selectedSlot); setSelectedSlot(null); }}
                  className="w-full bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                >
                  <UserMinus size={14} /> Retirar de formación
                </button>
               )}
               {saveData.roster
                .filter((u: any) => !activePartyUnits.some(pu => pu?.id === u.id))
                .map((unit: any) => (
                 <motion.div
                  key={unit.id}
                  whileHover={{ x: 4 }}
                  onClick={() => { onAssignToParty(selectedSlot, unit.id); setSelectedSlot(null); }}
                  className="bg-black/40 border border-white/5 p-3 rounded-2xl flex items-center gap-4 hover:border-white/20 cursor-pointer transition-all"
                 >
                    <div className="w-12 h-12 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[180%] transform translate-y-2" style={{imageRendering: 'pixelated'}} />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="font-black text-white uppercase text-sm tracking-wider truncate max-w-[120px]">{unit.name}</span>
                      <div className="flex gap-4 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-white/40 font-bold"><Sword size={10} className="text-[#F5C76B]" /> {unit.base_stats.atk}</div>
                        <div className="flex items-center gap-1 text-[10px] text-white/40 font-bold"><Heart size={10} className="text-red-400" /> {unit.base_stats.hp}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-0.5 mb-1">
                        <img src={AssetService.getIconUrl(unit.icon_id)} className="w-4 h-4 object-contain opacity-60" />
                        <p className="text-[8px] font-black text-white/40 uppercase truncate max-w-[60px]">{unit.current_job_id}</p>
                      </div>
                      <Plus size={16} className="text-[#F5C76B]" />
                    </div>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col gap-4 overflow-hidden z-10"
          >
             <h3 className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase shrink-0">Reserva General ({saveData.roster.length})</h3>
             <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {saveData.roster.map((unit: any) => (
                    <motion.div
                      key={unit.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onSelectUnit(unit.id)}
                      className="bg-black/40 border border-white/5 p-3 rounded-2xl flex items-center gap-4 hover:border-white/10 cursor-pointer group"
                    >
                        <div className="w-14 h-14 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                          <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[180%] transform translate-y-2" style={{imageRendering: 'pixelated'}} />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white uppercase text-sm tracking-wider truncate flex-1">{unit.name}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm border ${rarityColor('r')} uppercase shrink-0`}>R</span>
                          </div>
                          <div className="flex gap-3 mt-1 items-center">
                            <span className="text-[10px] font-black text-[#F5C76B] italic">LV.{unit.level}</span>
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter truncate">{unit.current_job_id}</span>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-white/10 group-hover:text-[#F5C76B] transition-colors shrink-0" />
                    </motion.div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
