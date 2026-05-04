'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sword, Trophy, Users, Crown, Star, Shield } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Button } from '@/components/ui/Button';

interface ArenaViewProps {
  onBack: () => void;
  playerPower?: number;
}

export function ArenaView({ onBack, playerPower = 5000 }: ArenaViewProps) {
  return (
    <ViewShell title="ARENA" subtitle="Combate PvP" onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-6">

        {/* Arena Header */}
        <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 rounded-[32px] p-6 relative overflow-hidden">
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">RANGO ACTUAL</span>
                 <h2 className="text-2xl font-black text-white uppercase font-display">ASPIRANTE II</h2>
              </div>
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                 <Trophy size={32} className="text-red-400" />
              </div>
           </div>
           <div className="mt-4 flex gap-4">
              <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5">
                 <p className="text-[8px] font-black text-white/20 uppercase">PODER TOTAL</p>
                 <p className="text-lg font-black text-white tabular-nums">{playerPower.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5">
                 <p className="text-[8px] font-black text-white/20 uppercase">VICTORIAS</p>
                 <p className="text-lg font-black text-white tabular-nums">24</p>
              </div>
           </div>
        </div>

        {/* Matchmaking Section */}
        <div className="flex-1 space-y-4">
           <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">OPONENTES DISPONIBLES</h3>
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-red-500/30 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                   <Shield size={24} className="text-white/20 group-hover:text-red-400 transition-colors" />
                </div>
                <div className="flex-1">
                   <h4 className="text-sm font-black text-white uppercase tracking-tight">Rival_{i*254}</h4>
                   <p className="text-[10px] text-white/40 uppercase">Poder: {(playerPower * (0.8 + i*0.1)).toFixed(0)}</p>
                </div>
                <Button variant="ghost" size="sm" className="border-red-500/20 text-red-400">RETAR</Button>
             </div>
           ))}
        </div>

        <div className="mt-auto">
           <Button variant="primary" size="game" className="w-full h-16 bg-red-600 hover:bg-red-500 border-red-400/50">
              BUSCAR OPONENTE
           </Button>
        </div>
      </div>
    </ViewShell>
  );
}
