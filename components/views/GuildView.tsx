'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Crown, Shield, Sword, Gift, MessageCircle } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Button } from '@/components/ui/Button';

interface GuildViewProps {
  onBack: () => void;
}

export function GuildView({ onBack }: GuildViewProps) {
  return (
    <ViewShell title="GREMIO" subtitle="Alianza de Valientes" onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-6">

        {/* Guild Banner */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/20 rounded-[32px] p-6 text-center relative overflow-hidden">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <Shield size={40} className="text-emerald-400" />
           </div>
           <h2 className="text-2xl font-black text-white uppercase font-display">LOS ETERNOS</h2>
           <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] mt-2">NIVEL GREMIO 12</p>
        </div>

        {/* Guild Tabs/Actions */}
        <div className="grid grid-cols-2 gap-4">
           <GuildAction icon={MessageCircle} label="CHAT" count={4} />
           <GuildAction icon={Sword} label="GUERRA" color="text-red-400" />
           <GuildAction icon={Gift} label="DONAR" color="text-amber-400" />
           <GuildAction icon={Users} label="MIEMBROS" />
        </div>

        {/* Guild Log */}
        <div className="flex-1 space-y-4">
           <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">ACTIVIDAD RECIENTE</h3>
           <div className="bg-white/5 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] text-white/60"><span className="text-[#F5C76B]">Admin</span> ha subido de nivel el Gremio.</p>
              <p className="text-[10px] text-white/60"><span className="text-blue-400">Player_42</span> se ha unido a la alianza.</p>
           </div>
        </div>
      </div>
    </ViewShell>
  );
}

function GuildAction({ icon: Icon, label, color = "text-white/60", count }: any) {
  return (
    <button className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 transition-all relative">
       <Icon size={20} className={color} />
       <span className="text-[9px] font-black text-white uppercase tracking-widest">{label}</span>
       {count && (
         <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {count}
         </div>
       )}
    </button>
  );
}
