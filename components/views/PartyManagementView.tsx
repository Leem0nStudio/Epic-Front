'use client';
import { AssetService } from '@/lib/services/asset-service';
import { UIService } from '@/lib/services/ui-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

import React, { useState } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, ArrowRight, UserMinus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getRarityCode } from '@/lib/config/assets-config';

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
    <div className="flex flex-col h-full bg-[#0B1A2A] bg-cover bg-center bg-no-repeat p-6 overflow-hidden relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('party')}')` }}>
       <div className="absolute inset-0 view-overlay pointer-events-none" />

       <div className="flex items-center gap-4 mb-8 z-10 shrink-0">
         <button 
             onClick={() => onNavigate('home')} 
             className="btn-back shadow-lg"
         >
           <ChevronLeft size={20} />
         </button>
         <h1 className="view-title">Formación de Combate</h1>
       </div>

        <NineSlicePanel
             type="border"
             variant="default"
             className="p-6 shadow-2xl mb-8 relative z-10 shrink-0 rounded-3xl panel-glass"
             glassmorphism={true}
           >
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F5C76B] shadow-[0_0_8px_#F5C76B]" />
                Escuadrón Activo
              </h3>
              <div className="px-3 py-1 bg-[#F5C76B]/10 rounded-full border border-[#F5C76B]/20">
                <span className="text-[10px] font-black text-[#F5C76B] tracking-widest">{activePartyUnits.filter(u => u).length}/{partySizeLimit}</span>
              </div>
           </div>
           <div className="flex flex-wrap justify-center gap-4">
              {[0, 1, 2, 3, 4].map((idx) => {
                const unit = activePartyUnits[idx];
                const isLocked = idx >= partySizeLimit;
                return (
                  <motion.div
                    key={idx}
                    whileTap={{ scale: isLocked ? 1 : 0.95 }}
                    onClick={() => !isLocked && setSelectedSlot(idx)}
                    className={`relative w-18 h-22 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                      ${selectedSlot === idx ? 'border-[#F5C76B] bg-[#F5C76B]/10 shadow-[0_0_20px_rgba(245,199,107,0.2)]' : 'border-white/10 bg-black/50'}
                      ${isLocked ? 'opacity-15 grayscale' : 'hover:border-white/20 hover:bg-black/60'}`}
                  >
                    {isLocked ? (
                      <Shield size={24} className="text-white/20" />
                    ) : unit ? (
                      <>
                        <ImageWithFallback
                          src={AssetService.getSpriteUrl(unit.sprite_id)}
                          alt={unit.name}
                          className="w-[180%] transform translate-y-3"
                          fallbackSrc={AssetService.getSpriteUrl('novice_idle.png')}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1 border-t border-white/10 backdrop-blur-sm">
                          <span className="text-[8px] font-black text-center block text-white/60 tracking-wider">LV.{unit.level}</span>
                        </div>
                      </>
                    ) : (
                      <Plus size={20} className="text-white/20" />
                    )}
                    <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center border border-white/10">
                      <span className="text-[7px] font-black text-white/40">{idx+1}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
         </NineSlicePanel>

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
              <h3 className="text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.2em] flex items-center gap-2">
                <ArrowRight size={14} className="text-[#F5C76B]" /> Asignar Posición {selectedSlot + 1}
              </h3>
              <button 
                onClick={() => setSelectedSlot(null)} 
                className="text-[10px] font-black text-white/40 uppercase hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
               {activePartyUnits[selectedSlot] && (
                 <button
                  onClick={() => { onRemoveFromParty(selectedSlot); setSelectedSlot(null); }}
                  className="w-full bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 shadow-lg"
                >
                  <UserMinus size={16} /> Retirar de formación
                </button>
               )}
                  {saveData.roster
                   .filter((u: any) => !activePartyUnits.some(pu => pu?.id === u.id))
                   .map((unit: any) => (
                     <NineSlicePanel
                       key={unit.id}
                       type="border"
                       variant="default"
                       className="p-4 flex items-center gap-4 hover:border-[#F5C76B]/30 cursor-pointer transition-all relative rounded-2xl panel-glass"
                       glassmorphism={true}
                       onClick={() => { onAssignToParty(selectedSlot, unit.id); setSelectedSlot(null); }}
                       as={motion.div}
                       whileHover={{ x: 6, transition: { duration: 0.2 } }}
                     >
                         <RarityIcon
                           rarity={getRarityCode(unit?.rarity || 'C')}
                           size="sm"
                           className="shrink-0"
                           glass={true}
                         >
                           <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[180%] transform translate-y-2 brightness-110" style={{imageRendering: 'pixelated'}} />
                         </RarityIcon>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="font-black text-white uppercase text-sm tracking-wider truncate drop-shadow-sm">{unit.name}</span>
                          <div className="flex gap-4 mt-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-bold">
                                <Sword size={10} className="text-[#F5C76B]" /> 
                                <span className="text-white/70">{unit.base_stats.atk}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-bold">
                                <Heart size={10} className="text-red-400" /> 
                                <span className="text-white/70">{unit.base_stats.hp}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex flex-col items-end gap-1 mb-1">
                            <img src={AssetService.getIconUrl(unit.icon_id)} className="w-5 h-5 object-contain opacity-50" />
                            <p className="text-[8px] font-black text-white/40 uppercase truncate max-w-[70px]">{unit.current_job_id}</p>
                          </div>
                          <Plus size={18} className="text-[#F5C76B] drop-shadow-[0_0_5px_rgba(245,199,107,0.3)]" />
                        </div>
                    </NineSlicePanel>
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
             <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase shrink-0 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                Reserva General ({saveData.roster.length})
             </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                   {saveData.roster.map((unit: any) => (
                       <NineSlicePanel
                         key={unit.id}
                         type="border"
                         variant="default"
                         className="p-4 flex items-center gap-4 hover:border-[#F5C76B]/30 cursor-pointer group relative rounded-2xl panel-glass"
                         glassmorphism={true}
                         onClick={() => onSelectUnit(unit.id)}
                         as={motion.div}
                         whileHover={{ x: 6, transition: { duration: 0.2 } }}
                       >
                         <RarityIcon
                             rarity={getRarityCode(unit?.rarity || 'C')}
                             size="md"
                             className="shrink-0"
                             glass={true}
                           >
                             <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[180%] transform translate-y-2 brightness-110" style={{imageRendering: 'pixelated'}} />
                           </RarityIcon>
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white uppercase text-sm tracking-wider truncate flex-1 drop-shadow-sm">{unit.name}</span>
                              <span className="text-[8px] font-black text-[#F5C76B] bg-[#F5C76B]/10 px-2 py-0.5 rounded-full border border-[#F5C76B]/20 uppercase shrink-0">C</span>
                            </div>
                            <div className="flex gap-3 mt-1.5 items-center">
                              <span className="text-[10px] font-black text-[#F5C76B] italic">LV.{unit.level}</span>
                              <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter truncate">{unit.current_job_id}</span>
                            </div>
                          </div>
                          <ArrowRight size={18} className="text-white/10 group-hover:text-[#F5C76B] transition-colors shrink-0 group-hover:translate-x-1" />
                      </NineSlicePanel>
                  ))}
               </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
