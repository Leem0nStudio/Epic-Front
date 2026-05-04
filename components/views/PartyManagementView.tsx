'use client';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import React, { useState } from 'react';
import { Shield, Sword, Heart, UserMinus, Plus, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Button } from '@/components/ui/Button';

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
  const { roster } = saveData;

  return (
    <ViewShell title="FORMACIÓN" subtitle="Gestionar Equipo" onBack={() => onNavigate('home')} background="party">
      <div className="flex-1 flex flex-col p-6 space-y-8 overflow-hidden">

        {/* Active Party Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => {
            const unit = activePartyUnits[idx];
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedSlot(idx)}
                className={`aspect-[3/4] rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden ${selectedSlot === idx ? 'border-[#F5C76B] bg-[#F5C76B]/10 shadow-[0_0_20px_#F5C76B22]' : 'border-white/5 bg-black/40'}`}
              >
                {unit ? (
                  <>
                    <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[140%] object-contain transform translate-y-4 pixel-art" alt="" />
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent text-center">
                       <p className="text-[10px] font-black text-white uppercase truncate">{unit.name}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveFromParty(idx); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <UserMinus size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Plus size={24} />
                    <span className="text-[8px] font-black uppercase">VACÍO</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/40 border border-white/10">
                   <span className="text-[8px] font-black text-white/40">P{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Roster Selection */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">RESERVA ({roster.length})</h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 gap-4 pb-20">
             {roster.map((unit: any) => {
               const isInParty = activePartyUnits.some(u => u?.id === unit.id);
               return (
                 <motion.div
                   key={unit.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className={`relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex gap-3 transition-all ${isInParty ? 'opacity-40' : 'hover:border-white/20 cursor-pointer'}`}
                   onClick={() => !isInParty && selectedSlot !== null && onAssignToParty(selectedSlot, unit.id)}
                 >
                    <div className="w-16 h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                       <img src={AssetService.getSpriteUrl(unit.sprite_id)} className="w-[180%] object-contain translate-y-3 pixel-art" alt="" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                       <div>
                          <h4 className="text-[11px] font-black text-white uppercase truncate">{unit.name}</h4>
                          <span className="text-[8px] font-black text-[#F5C76B] uppercase tracking-widest">{unit.current_job_id}</span>
                       </div>
                       <div className="flex gap-2">
                          <div className="flex items-center gap-1">
                             <Sword size={8} className="text-red-400" />
                             <span className="text-[9px] font-black text-white/40">{unit.base_stats?.atk}</span>
                          </div>
                          <div className="flex items-center gap-1">
                             <Zap size={8} className="text-cyan-400" />
                             <span className="text-[9px] font-black text-white/40">{unit.base_stats?.agi}</span>
                          </div>
                       </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectUnit(unit.id); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                      <Plus size={12} className="rotate-45" />
                    </button>
                 </motion.div>
               );
             })}
          </div>
        </div>
      </div>

      {/* Selected Slot Instructions */}
      {selectedSlot !== null && (
        <div className="absolute bottom-24 left-6 right-6 z-50">
           <div className="bg-[#F5C76B] rounded-xl p-3 shadow-2xl flex items-center justify-between">
              <span className="text-[9px] font-black text-black uppercase tracking-widest">SELECCIONA UN HÉROE PARA EL PUESTO {selectedSlot + 1}</span>
              <button onClick={() => setSelectedSlot(null)} className="text-black/40 hover:text-black">
                 <Plus size={16} className="rotate-45" />
              </button>
           </div>
        </div>
      )}
    </ViewShell>
  );
}
