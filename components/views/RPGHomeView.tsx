'use client';

import React from 'react';
import { Sword, Sparkles, Shield, Store, Mail, Briefcase, Diamond, Coins, LogOut, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';

interface RPGHomeViewProps {
  saveData: any;
  activePartyUnits: (any | null)[];
  onNavigate: (view: any) => void;
}

export function RPGHomeView({ saveData, activePartyUnits, onNavigate }: RPGHomeViewProps) {
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 relative font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-1">
      <div className="relative w-full shrink-0 bg-[#1a110a] border-2 border-[#382618] rounded-xl shadow-2xl p-4 overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-40"></div>
        <div className="flex items-center gap-4 z-10 relative">
           <div className="w-16 h-16 bg-[#0d0805] border-2 border-[#c79a5d] rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
               <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[140%] transform translate-y-2" style={{imageRendering: 'pixelated'}} />
           </div>
           <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-black text-[#eacf9b] text-xl tracking-wider uppercase drop-shadow-md">{saveData.profile.username}</h2>
                <button onClick={handleLogout} className="text-[#b53c22] hover:text-[#ea7a5d] transition-colors"><LogOut size={16} /></button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <span className="bg-[#b53c22] text-white text-[10px] font-black px-2 py-0.5 rounded border border-[#ea7a5d]">LV. 1</span>
                 <div className="flex-1 h-2 bg-black/60 rounded-full border border-[#382618] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} className="h-full bg-gradient-to-r from-[#c79a5d] to-[#8c5a2b]" />
                 </div>
              </div>
           </div>
        </div>
        <div className="mt-4 flex gap-4 justify-between">
            <div className="flex items-center gap-2 bg-black/40 border border-[#382618] px-3 py-1 rounded-full"><Coins size={14} className="text-[#ead15d]" /><span className="text-sm font-mono font-bold text-[#eacf9b]">{saveData.profile.currency}</span></div>
            <div className="flex items-center gap-2 bg-black/40 border border-[#c79a5d] px-3 py-1 rounded-full"><Diamond size={14} className="text-[#44aaff]" /><span className="text-sm font-mono font-bold text-[#eacf9b]">{saveData.profile.premium_currency}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate('battle')} className="aspect-square bg-[#1a110a] border-2 border-[#5a4227] rounded-xl flex flex-col items-center justify-center gap-4 group hover:border-[#c79a5d] transition-all relative overflow-hidden active:scale-95 shadow-xl">
            <Sword size={48} className="text-[#a68a68] group-hover:text-[#c79a5d]" />
            <span className="font-serif font-black text-[#eacf9b] tracking-[0.2em] uppercase text-lg">Aventura</span>
        </button>
        <button onClick={() => onNavigate('gacha')} className="aspect-square bg-[#1a110a] border-2 border-[#5a4227] rounded-xl flex flex-col items-center justify-center gap-4 group hover:border-[#c79a5d] transition-all relative overflow-hidden active:scale-95 shadow-xl">
            <Sparkles size={48} className="text-[#a68a68] group-hover:text-[#ffaa00]" />
            <span className="font-serif font-black text-[#eacf9b] tracking-[0.2em] uppercase text-lg text-center">Invocación</span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
         {[{ id: 'party', icon: Briefcase, label: 'Reserva' }, { id: 'party', icon: Shield, label: 'Equipo' }, { id: 'tavern', icon: Store, label: 'Taberna' }, { id: 'home', icon: Mail, label: 'Correo', disabled: true }].map(btn => (
            <button key={btn.label} onClick={() => !btn.disabled && onNavigate(btn.id as any)} className={`flex flex-col items-center gap-1 p-2 bg-[#1a110a] border-2 border-[#382618] rounded-xl relative ${btn.disabled ? 'opacity-40 grayscale' : 'hover:border-[#5a4227] shadow-lg active:scale-95 transition-all'}`}>
                <btn.icon size={20} className="text-[#a68a68]" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-[#eacf9b]">{btn.label}</span>
                {btn.id === 'tavern' && saveData.tavernSlots.some((s: any) => now >= new Date(s.available_at).getTime()) && (<div className="w-2 h-2 bg-[#b53c22] rounded-full absolute top-1 right-1 animate-pulse border border-[#ea7a5d]" />)}
            </button>
         ))}
      </div>
      <div className="bg-[#1a110a] border-2 border-[#382618] rounded-xl p-4 mt-auto shadow-2xl">
         <h4 className="text-[10px] text-[#a68a68] font-black uppercase tracking-[0.2em] mb-4 flex items-center justify-between"><span>Formación Estratégica</span><span className="text-[#c79a5d]">{activePartyUnits.filter(u => u).length}/5</span></h4>
         <div className="flex gap-2 justify-between">
            {activePartyUnits.map((unit, idx) => (
                <div key={idx} className="w-12 h-12 bg-[#0d0805] border border-[#382618] rounded-lg flex items-center justify-center relative group hover:border-[#5a4227] transition-all cursor-pointer">
                    {unit ? (<img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[120%] transform translate-y-1" style={{imageRendering: 'pixelated'}} />) : (<Plus size={16} className="text-[#382618]" />)}
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
