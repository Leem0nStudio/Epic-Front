'use client';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';

import React, { useState } from 'react';
import { ChevronLeft, Shield, Sword, Heart, ArrowRight, UserMinus, Plus, Sparkles } from 'lucide-react';
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

  const bgUrl = AssetService.getBgUrl('party');

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 overflow-hidden relative">
      {bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgUrl}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-black/50 to-black/80 pointer-events-none" />

      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="particle-magic absolute w-1 h-1 bg-cyan-400/50 rounded-full"
          style={{
            top: `${10 + i * 18}%`,
            left: `${8 + i * 20}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${2.5 + i * 0.5}s`
          }}
        />
      ))}

      <div className="flex items-center gap-3 sm:gap-4 mb-6 z-10 shrink-0">
        <button 
            onClick={() => onNavigate('home')} 
            className="btn-back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="view-title">Formación de Combate</h1>
      </div>

      <NineSlicePanel
          type="border"
          variant="default"
          className="glass-frosted frame-earthstone p-4 sm:p-6 mb-6 relative z-10 shrink-0"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] flex items-center gap-2 font-stats">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5C76B] shadow-[0_0_8px_#F5C76B]" />
              Escuadrón Activo
            </h3>
            <div className="glass-crystal px-3 py-1 rounded-full border border-[#F5C76B]/30">
              <span className="text-[10px] font-bold text-[#F5C76B] tracking-widest font-stats">{activePartyUnits.filter(u => u).length}/{partySizeLimit}</span>
            </div>
          </div>

          <div className="flex justify-center gap-2 sm:gap-4">
            {[0, 1, 2, 3, 4].map((idx) => {
              const unit = activePartyUnits[idx];
              const isLocked = idx >= partySizeLimit;
              const isSelected = selectedSlot === idx;
              return (
                <motion.div
                  key={idx}
                  whileTap={{ scale: isLocked ? 1 : 0.95 }}
                  onClick={() => !isLocked && setSelectedSlot(idx)}
                  className={`relative w-16 h-20 sm:w-18 sm:h-22 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                    ${isSelected ? 'border-[#F5C76B] bg-[#F5C76B]/10 shadow-[0_0_20px_rgba(245,199,107,0.3)]' : 'border-white/10 bg-black/40'}
                    ${isLocked ? 'opacity-20 grayscale' : 'hover:border-[#F5C76B]/50 hover:bg-black/50'}`}
                >
                  {isLocked ? (
                    <div className="flex flex-col items-center gap-1">
                      <Shield size={20} className="text-white/20" />
                      <div className="w-4 h-0.5 bg-white/10 rounded" />
                    </div>
                  ) : unit ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-black/50 to-transparent" />
                      <motion.img 
                        src={AssetService.getSpriteUrl(unit.sprite_id)} 
                        alt={unit.name}
                        className="w-[160%] sm:w-[180%] absolute bottom-2 left-1/2 -translate-x-1/2"
                        style={{ imageRendering: 'pixelated' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      />
                      <div className="absolute bottom-0 inset-x-0 glass-crystal py-1.5 border-t border-[#F5C76B]/20">
                        <span className="text-[8px] font-bold text-center block text-white/80 tracking-wider font-stats">LV.{unit.level}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Plus size={18} className="text-white/30" />
                      <div className="w-6 h-0.5 bg-white/10 rounded" />
                    </div>
                  )}
                  <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? 'bg-[#F5C76B]/20 border-[#F5C76B]' : 'bg-black/60 border-white/10'}`}>
                    <span className={`text-[7px] font-bold ${isSelected ? 'text-[#F5C76B]' : 'text-white/40'} font-stats`}>{idx+1}</span>
                  </div>
                  {unit && (
                    <div className="absolute top-1.5 right-1.5">
                      <Sparkles size={10} className="text-[#F5C76B]" />
                    </div>
                  )}
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
            className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-hidden z-10"
          >
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-[10px] font-bold text-[#F5C76B] uppercase tracking-[0.2em] flex items-center gap-2 font-stats">
                <ArrowRight size={14} className="text-[#F5C76B]" /> Asignar Ranura {selectedSlot + 1}
              </h3>
              <button 
                onClick={() => setSelectedSlot(null)} 
                className="text-[9px] font-bold text-white/40 uppercase hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 font-stats"
              >
                Cancelar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {activePartyUnits[selectedSlot] && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => { onRemoveFromParty(selectedSlot); setSelectedSlot(null); }}
                  className="w-full glass-frosted frame-earthstone p-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95 font-stats"
                >
                  <UserMinus size={16} /> Retirar de Formación
                </motion.button>
              )}

              {saveData.roster
                .filter((u: any) => !activePartyUnits.some(pu => pu?.id === u.id))
                .map((unit: any, idx: number) => (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <NineSlicePanel
                      type="border"
                      variant="default"
                      className="glass-frosted frame-earthstone p-3.5 flex items-center gap-3 hover:border-[#F5C76B]/50 cursor-pointer transition-all rounded-2xl"
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
                        <div className="relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/50 blur-md rounded-full" />
                          <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[160%] relative" style={{imageRendering: 'pixelated'}} alt="" />
                        </div>
                      </RarityIcon>
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-white text-sm truncate">{unit.name}</span>
                        </div>
                        <div className="flex gap-3 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-white/50 font-stats">
                            <Sword size={10} className="text-[#F5C76B]" /> 
                            <span className="text-white/70">{unit.base_stats.atk}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-white/50 font-stats">
                            <Heart size={10} className="text-red-400" /> 
                            <span className="text-white/70">{unit.base_stats.hp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <img src={AssetService.getIconUrl(unit.icon_id)} className="w-5 h-5 object-contain opacity-40" />
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter font-stats">{unit.current_job_id}</span>
                      </div>

                      <Plus size={18} className="text-[#F5C76B] drop-shadow-[0_0_5px_rgba(245,199,107,0.3)] shrink-0" />
                    </NineSlicePanel>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-hidden z-10"
          >
            <h3 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase shrink-0 flex items-center gap-2 font-stats">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              Reserva General ({saveData.roster.length})
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {saveData.roster.map((unit: any, idx: number) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <NineSlicePanel
                    type="border"
                    variant="default"
                    className="glass-frosted frame-earthstone p-3.5 flex items-center gap-3 hover:border-[#F5C76B]/50 cursor-pointer group relative rounded-2xl"
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
                      <div className="relative">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/60 blur-md rounded-full" />
                        <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[160%] relative" style={{imageRendering: 'pixelated'}} />
                      </div>
                    </RarityIcon>

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-white text-sm truncate">{unit.name}</span>
                        <span className="text-[8px] font-bold text-[#F5C76B] bg-[#F5C76B]/10 px-2 py-0.5 rounded-full border border-[#F5C76B]/20 uppercase shrink-0">
                          {unit.rarity || 'C'}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1 items-center">
                        <span className="text-[10px] font-bold text-[#F5C76B] font-stats italic">LV.{unit.level}</span>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter truncate font-stats">{unit.current_job_id}</span>
                      </div>
                    </div>

                    <ArrowRight size={16} className="text-white/10 group-hover:text-[#F5C76B] transition-colors shrink-0 group-hover:translate-x-1" />
                  </NineSlicePanel>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
