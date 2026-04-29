'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Sword,
  Zap,
  Star,
  Info,
  Gift,
  Users
} from 'lucide-react';
import { Stage } from '@/lib/rpg-system/campaign-types';
import { Button } from '@/components/ui/Button';

interface StageDetailsViewProps {
  stage: Stage;
  playerEnergy: number;
  onBack: () => void;
  onStartBattle: (stage: Stage) => void;
}

export function StageDetailsView({ stage, playerEnergy, onBack, onStartBattle }: StageDetailsViewProps) {
  const canAfford = playerEnergy >= stage.energy_cost;

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      {/* Header */}
       <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10 shadow-2xl shrink-0">
         <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Mapa</button>
         <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic font-display">Detalles de Misión</span>
         <div className="w-16"></div>
       </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5C76B]/5 via-transparent to-transparent pointer-events-none" />

         {/* Stage Hero Section */}
         <div className="text-center">
           <div className="w-20 h-20 bg-black/40 border border-[#F5C76B]/20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl relative group overflow-hidden glass-crystal frame-earthstone">
              <div className="absolute inset-0 bg-[#F5C76B]/5" />
              <Sword size={32} className="text-[#F5C76B]" />
           </div>
           <h2 className="text-2xl font-black text-white tracking-widest uppercase italic font-display">{stage.name}</h2>
           <p className="text-[10px] text-white/30 uppercase tracking-wider mt-2 leading-relaxed font-stats">{stage.description}</p>
         </div>

         {/* Main Stats */}
         <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center gap-2 glass-frosted frame-earthstone">
             <Zap size={16} className="text-[#F5C76B]" />
             <span className="text-[10px] font-black text-white/40 uppercase font-stats">Costo Energía</span>
             <span className="text-lg font-black text-white font-stats">{stage.energy_cost}</span>
           </div>
           <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center gap-2 glass-frosted frame-earthstone">
             <Users size={16} className="text-[#F5C76B]" />
             <span className="text-[10px] font-black text-white/40 uppercase font-stats">Enemigos</span>
             <span className="text-lg font-black text-white font-stats">{stage.enemies.length}</span>
           </div>
         </div>

         {/* Star Conditions */}
         <div className="space-y-4">
           <div className="flex items-center gap-2">
             <Star size={14} className="text-[#F5C76B]" />
             <span className="text-[10px] font-black text-white/60 uppercase tracking-widest font-stats">Objetivos de Estrellas</span>
           </div>
           <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden glass-frosted">
             {stage.star_conditions.map((cond, i) => (
               <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0">
                 <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                   <Star size={10} className="text-[#F5C76B]/40" />
                 </div>
                 <span className="text-[9px] font-black text-white/80 uppercase tracking-wider font-stats">{cond.description}</span>
               </div>
             ))}
           </div>
         </div>

         {/* Rewards Preview */}
         <div className="space-y-4">
           <div className="flex items-center gap-2">
             <Gift size={14} className="text-[#F5C76B]" />
             <span className="text-[10px] font-black text-white/60 uppercase tracking-widest font-stats">Recompensas Posibles</span>
           </div>
           <div className="flex flex-wrap gap-2">
              <RewardTag label="Gold" value={stage.rewards.currency} icon="zeny" />
              <RewardTag label="Exp" value={stage.rewards.exp} icon="exp" />
              {stage.rewards.materials.map((mat, i) => (
                <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 glass-frosted frame-earthstone">
                  <div className="w-4 h-4 bg-purple-500/20 rounded-sm" />
                  <span className="text-[9px] font-black text-white/60 uppercase font-stats">{mat.itemId}</span>
                </div>
              ))}
           </div>
         </div>
      </div>

      {/* Start Button */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#020508] via-[#020508] to-transparent">
        <motion.button 
          onClick={() => onStartBattle(stage)}
          disabled={!canAfford}
          whileHover={canAfford ? { scale: 1.05 } : undefined}
          whileTap={canAfford ? { scale: 0.95 } : undefined}
          className={`btn-premium-blue px-14 py-3.5 text-xl font-black font-display tracking-widest uppercase z-10 flex items-center justify-center gap-2 w-full ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Sword size={20} />
          <span>COMENZAR INCURSIÓN</span>
          {!canAfford && <span className="text-[10px] opacity-60 ml-2">(ENERGÍA INSUFICIENTE)</span>}
        </motion.button>
      </div>
    </div>
  );
}

function RewardTag({ label, value, icon }: { label: string, value: number, icon: string }) {
  return (
    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
       {icon === 'zeny' && <Gift size={12} className="text-[#F5C76B]" />}
       {icon === 'exp' && <Zap size={12} className="text-yellow-400" />}
       <span className="text-[9px] font-black text-[#F5C76B] uppercase">{label}</span>
       <span className="text-[10px] font-black text-white">{value}</span>
    </div>
  );
}
