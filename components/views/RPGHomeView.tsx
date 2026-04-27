'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Coins,
  Diamond,
  Settings,
  Calendar,
  Bell,
  Mail,
  ChevronRight,
  Zap,
  Map as MapIcon,
  Sparkles,
  UserPlus,
  Sword,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';

interface RPGHomeViewProps {
  saveData: any;
  activePartyUnits: any[];
  onNavigate: (view: any) => void;
}

const rarityGlow = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'ur': return 'shadow-[0_0_30px_rgba(245,199,107,0.4)] border-[#F5C76B]/40';
    case 'sr': return 'shadow-[0_0_25px_rgba(168,85,247,0.3)] border-purple-500/40';
    case 'r': return 'shadow-[0_0_20px_rgba(59,130,246,0.2)] border-blue-500/40';
    default: return 'border-white/5';
  }
};

const CharacterSlot = ({ unit, scale = 1, zIndex = 1, emphasized = false }: any) => {
  const sprite = unit ? AssetService.getSpriteUrl(unit.sprite_id) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center justify-end h-full w-full"
      style={{ zIndex, scale }}
    >
      <div className={`relative w-full h-[70%] flex items-center justify-center ${emphasized ? 'mb-4' : 'mb-2'}`}>
        <div className={`w-full aspect-[2/3] max-h-full rounded-2xl bg-gradient-to-t from-blue-900/40 to-transparent border border-white/5 relative overflow-hidden ${emphasized ? rarityGlow('ur') : ''}`}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            {unit ? (
              <img
                src={sprite}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-auto object-contain transform origin-bottom"
                style={{ imageRendering: 'pixelated' }}
                alt={unit.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <Users size={48} className="text-white" />
              </div>
            )}
          </motion.div>
        </div>

        {unit && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/80 border border-white/20 flex items-center gap-1 shadow-xl whitespace-nowrap">
            <span className="text-[10px] font-black italic text-[#F5C76B]">UR</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={8} fill="#F5C76B" className="text-[#F5C76B]" />)}
            </div>
          </div>
        )}
      </div>

      {unit && (
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <img src={AssetService.getIconUrl(unit.icon_id)} className="w-3 h-3 object-contain" alt="Job Icon" />
            <p className="text-white text-sm font-black tracking-widest uppercase drop-shadow-md truncate max-w-[100px]">{unit.name}</p>
          </div>
          <p className="text-[#F5C76B] text-[10px] font-bold tracking-tighter opacity-80 uppercase truncate w-full max-w-[100px]">{unit.current_job_id}</p>
        </div>
      )}
    </motion.div>
  );
};

export function RPGHomeView({ saveData, activePartyUnits, onNavigate }: RPGHomeViewProps) {
  const primaryUnit = activePartyUnits[0];
  const leftUnit = activePartyUnits[1];
  const rightUnit = activePartyUnits[2];

  const [displayCurrency, setDisplayCurrency] = useState<number>(saveData.profile.currency);
  const [displayGems, setDisplayGems] = useState<number>(saveData.profile.premium_currency);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (displayCurrency < saveData.profile.currency) setDisplayCurrency(prev => Math.min(saveData.profile.currency, prev + 50));
      if (displayGems < saveData.profile.premium_currency) setDisplayGems(prev => Math.min(saveData.profile.premium_currency, prev + 5));
    }, 50);
    return () => clearTimeout(timer);
  }, [saveData.profile.currency, saveData.profile.premium_currency, displayCurrency, displayGems]);

  const playerLevel = saveData.profile.level || 1;
  const playerExp = saveData.profile.exp || 0;
  const nextLevelExp = playerLevel * 100;
  const expProgress = (playerExp / nextLevelExp) * 100;

  return (
    <div
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{ backgroundImage: "url('/assets/backgrounds/homebg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/40 via-transparent to-[#020508]/80 pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full h-16 shrink-0 flex items-center justify-between px-4 z-30 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center overflow-hidden">
            <img alt="Player Profile" src={AssetService.getSpriteUrl(primaryUnit?.sprite_id || 'novice')} className="w-[150%] transform translate-y-1" style={{imageRendering: 'pixelated'}} />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-[#F5C76B] text-black px-1.5 rounded-sm italic uppercase">Lvl. {playerLevel}</span>
              <span className="text-white text-xs font-bold tracking-wider uppercase">{saveData.profile.username}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${expProgress}%` }} className="h-full bg-[#F5C76B]" />
              </div>
              <div className="flex items-center gap-1 text-[#F5C76B]">
                <Zap size={8} className="fill-current" />
                <span className="text-[7px] font-black uppercase">{saveData.profile.energy}/{saveData.profile.max_energy}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
            <Coins size={14} className="text-[#F5C76B]" />
            <span className="text-xs font-bold text-white">{displayCurrency}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
            <Diamond size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-white">{displayGems}</span>
          </div>
          <button onClick={() => supabase?.auth.signOut()} className="text-white/60 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 relative flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full h-full max-w-lg flex items-end justify-center relative pb-28">
          <div className="w-[30%] h-full pb-4 flex items-end">
            <CharacterSlot unit={leftUnit} scale={0.85} zIndex={10} />
          </div>
          <div className="w-[40%] h-full flex items-end">
            <CharacterSlot unit={primaryUnit} scale={1.1} zIndex={20} emphasized />
          </div>
          <div className="w-[30%] h-full pb-4 flex items-end">
            <CharacterSlot unit={rightUnit} scale={0.85} zIndex={10} />
          </div>
        </div>

        {/* Right Floating Sidebar */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
          {[
            { icon: Calendar, label: 'EVENT', color: 'text-[#F5C76B]' },
            { icon: Bell, label: 'NOTIF', color: 'text-white' },
            { icon: Mail, label: 'MAIL', color: 'text-white' }
          ].map((btn, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-colors"
            >
              <btn.icon size={20} className={btn.color} />
              <span className="text-[7px] font-black mt-0.5 tracking-tighter opacity-60 text-white">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Campaign Objective */}
        <motion.button
          onClick={() => onNavigate('campaign')}
          whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
          className="absolute left-4 top-1/4 z-30 text-left"
        >
          <div className="bg-black/40 backdrop-blur-md border-l-4 border-l-[#F5C76B] border border-white/5 p-3 rounded-r-xl shadow-2xl transition-colors">
            <p className="text-[#F5C76B] text-[10px] font-black uppercase tracking-widest">Misión Actual</p>
            <h3 className="text-white text-sm font-bold tracking-wide mt-0.5 flex items-center gap-2">
              Tierras del Destino
              <ChevronRight size={14} className="opacity-40" />
            </h3>
          </div>
        </motion.button>
      </div>

      {/* Bottom Dock */}
      <div className="w-full h-24 shrink-0 bg-gradient-to-t from-black to-transparent z-40 px-4 flex items-center justify-between pb-6">
        <div className="flex gap-3 h-16 flex-1 items-end">
          {[
            { id: 'party', icon: Users, label: 'EQUIPO' },
            { id: 'tavern', icon: UserPlus, label: 'GREMIO' },
            { id: 'gacha', icon: Sparkles, label: 'NEXO' }
          ].map(btn => (
            <motion.button
              key={btn.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(btn.id as any)}
              className="flex-1 h-14 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors"
            >
              <btn.icon size={18} className="text-white/80" />
              <span className="text-[8px] font-black tracking-widest text-white/60 uppercase">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="w-24 h-24 relative flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('campaign')}
            className="w-20 h-20 bg-gradient-to-br from-[#F5C76B] to-[#b88c3a] rounded-full shadow-[0_0_30px_rgba(245,199,107,0.4)] flex flex-col items-center justify-center group relative overflow-hidden border border-white/10"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MapIcon size={28} className="text-black" />
            <span className="text-[9px] font-black text-black mt-0.5 uppercase">MUNDO</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
