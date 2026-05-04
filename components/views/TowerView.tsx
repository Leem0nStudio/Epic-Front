'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Shield, Sword, Crown, Clock, Flame, Lock } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Button } from '@/components/ui/Button';

interface TowerViewProps {
  onBack: () => void;
  playerPower?: number;
}

export function TowerView({ onBack, playerPower = 5000 }: TowerViewProps) {
  return (
    <ViewShell title="TORRE" subtitle="Desafío Infinito" onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-6">

        {/* Tower Progress */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
           {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(floor => (
             <div
               key={floor}
               className={`bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-6 transition-all ${floor > 4 ? 'opacity-40' : 'hover:border-purple-500/30 cursor-pointer'}`}
             >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex flex-col items-center justify-center shrink-0">
                   <span className="text-[10px] font-black text-white/40 leading-none">PISO</span>
                   <span className="text-xl font-black text-white leading-none mt-1">{floor}</span>
                </div>
                <div className="flex-1">
                   <h4 className="text-sm font-black text-white uppercase tracking-tight">Cámara de los Ecos</h4>
                   <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                         <Sword size={10} className="text-red-400" />
                         <span className="text-[10px] font-black text-white/40">{floor * 1200}</span>
                      </div>
                      {floor <= 4 && (
                        <div className="flex items-center gap-1">
                           <Clock size={10} className="text-cyan-400" />
                           <span className="text-[10px] font-black text-white/40">02:30</span>
                        </div>
                      )}
                   </div>
                </div>
                {floor > 4 ? <Lock size={20} className="text-white/10" /> : <Flame size={20} className="text-purple-400 animate-pulse" />}
             </div>
           ))}
        </div>

        <div className="mt-auto">
           <Button variant="primary" size="game" className="w-full h-16 bg-purple-700 hover:bg-purple-600 border-purple-500/50">
              DESAFÍO ACTUAL
           </Button>
        </div>
      </div>
    </ViewShell>
  );
}
