'use client';
import { AssetService } from '@/lib/services/asset-service';
import React from 'react';
import { motion } from 'motion/react';
import { Sword, Zap, Star, Gift, Users } from 'lucide-react';
import { Stage } from '@/lib/rpg-system/campaign-types';
import { Button } from '@/components/ui/Button';
import { ViewShell } from '@/components/ui/ViewShell';

interface StageDetailsViewProps {
  stage: Stage;
  playerEnergy: number;
  onBack: () => void;
  onStartBattle: (stage: Stage) => void;
}

export function StageDetailsView({ stage, playerEnergy, onBack, onStartBattle }: StageDetailsViewProps) {
  const canAfford = playerEnergy >= (stage.energy_cost || 5);

  return (
    <ViewShell title="DETALLES STAGE" subtitle={stage.name} onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-6">

        {/* Stage Hero Card */}
        <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10">
           <img
             src={AssetService.getBgUrl('battle') || '/assets/bg/battlebg.png'}
             className="w-full h-full object-cover"
             alt=""
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
           <div className="absolute bottom-6 left-6">
              <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.4em]">REGIÓN</span>
              <h2 className="text-2xl font-black text-white uppercase font-display tracking-tight">{stage.name}</h2>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
              <Zap size={20} className="text-blue-400" />
              <div>
                 <p className="text-[9px] font-black text-white/20 uppercase">COSTO ENERGÍA</p>
                 <p className="text-lg font-black text-white">{stage.energy_cost || 5}</p>
              </div>
           </div>
           <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
              <Users size={20} className="text-emerald-400" />
              <div>
                 <p className="text-[9px] font-black text-white/20 uppercase">ENEMIGOS</p>
                 <p className="text-lg font-black text-white">{stage.enemies?.length || 1} OLEADAS</p>
              </div>
           </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
           <div className="flex items-center gap-2 mb-4">
              <Gift size={16} className="text-[#F5C76B]" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">RECOMPENSAS POSIBLES</h3>
           </div>
           <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
                   <Star size={16} className="text-white/10" />
                </div>
              ))}
           </div>
        </div>

        {/* Action */}
        <div className="mt-auto">
           <Button
             variant="primary"
             size="game"
             className="w-full h-20"
             onClick={() => onStartBattle(stage)}
             disabled={!canAfford}
           >
              <Sword size={24} className="mr-4" />
              COMENZAR BATALLA
           </Button>
           {!canAfford && (
             <p className="text-center text-red-500 text-[10px] font-black uppercase mt-3 tracking-widest">ENERGÍA INSUFICIENTE</p>
           )}
        </div>
      </div>
    </ViewShell>
  );
}
