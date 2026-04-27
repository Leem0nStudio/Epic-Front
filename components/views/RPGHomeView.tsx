'use client';

import React, { useState, useEffect, useRef } from 'react';

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: any) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  return reducedMotion;
}
import { useMotionValue, useTransform } from 'motion/react';
import { motion, AnimatePresence } from 'motion/react';
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

const CharacterSlot = ({ unit, zIndex = 1, emphasized = false, opacity = 1 }: any) => {
  const sprite = unit ? AssetHelper.getUnitSprite(unit.current_job_id) : undefined;

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center justify-end h-full w-full"
        style={{ zIndex, opacity }}
    >
        {/* Floor Pedestal Effect - Subtle Blue/White Glow */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32 h-10 bg-blue-500/10 blur-xl rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-18 left-1/2 -translate-x-1/2 w-20 h-4 bg-white/5 blur-sm rounded-[100%] pointer-events-none" />

        <div className="relative w-full h-[70%] flex items-center justify-center mb-4">
        <div className={`w-full aspect-[2/3] max-h-full rounded-2xl bg-gradient-to-t from-blue-900/20 to-transparent border border-white/10 relative overflow-hidden ${emphasized ? rarityGlow('ur') : ''}`}>
            <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}
            >
            {unit ? (
              <>
                {/* Individual Unit Shadow */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 blur-md rounded-[100%] pointer-events-none" style={{ transform: "translateX(-50%) translateZ(-1px)" }} />
                <img
                  src={sprite}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[220%] h-auto object-contain transform origin-bottom"
                  style={{ imageRendering: 'pixelated' }}
                  alt={unit.name}
                />
              </>
            ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                <Users size={48} className="text-white" />
              </div>
            )}
          </motion.div>
        </div>

        {unit && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/90 border border-white/20 flex items-center gap-1 shadow-2xl whitespace-nowrap z-10">
            <span className="text-[10px] font-black italic text-[#F5C76B]">UR</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={8} fill="#F5C76B" className="text-[#F5C76B]" />)}
            </div>
          </div>
        )}
      </div>

        {unit && (
        <div className="text-center">
            <p className="text-white text-lg font-black tracking-[0.15em] uppercase drop-shadow-lg truncate w-full max-w-[120px] leading-none">{unit.name}</p>
            <p className="text-[#F5C76B]/70 text-[9px] font-medium tracking-widest uppercase truncate w-full max-w-[120px] mt-1.5">{unit.current_job_id}</p>
        </div>
      )}
    </motion.div>
  );
};

export function RPGHomeView({ saveData, activePartyUnits, onNavigate }: RPGHomeViewProps) {
  const primaryUnit = activePartyUnits[0];
  const leftUnit = activePartyUnits[1];
  const rightUnit = activePartyUnits[2];
  const prefersReduced = useReducedMotion();

  const [displayCurrency, setDisplayCurrency] = useState<number>(saveData.profile.currency);
  const [displayGems, setDisplayGems] = useState<number>(saveData.profile.premium_currency);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

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
              <span className="text-xs font-black bg-[#F5C76B] text-black px-2 py-0.5 rounded italic uppercase shadow-sm">Lvl. 1</span>
              <span className="text-white text-sm font-black tracking-[0.3em] uppercase drop-shadow-sm">{saveData.profile.username}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
                <div className="w-28 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <div className="flex items-center gap-1.5 text-[#F5C76B]">
                    <Zap size={10} className="fill-current drop-shadow-[0_0_3px_rgba(245,199,107,0.5)]" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{saveData.profile.energy}/{saveData.profile.max_energy}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <Coins size={18} className="text-[#F5C76B] drop-shadow-sm" />
            <span className="text-sm font-black text-white tabular-nums tracking-tight">{displayCurrency}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <Diamond size={18} className="text-cyan-400 drop-shadow-sm" />
            <span className="text-sm font-black text-white tabular-nums tracking-tight">{displayGems}</span>
          </div>
          <button onClick={() => supabase?.auth.signOut()} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 relative flex items-center justify-center px-4 overflow-hidden">
        <motion.div style={{ x: useTransform(mouseX, [ -20, 20 ], [ 5, -5 ]), y: useTransform(mouseY, [ -20, 20 ], [ 5, -5 ]) }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full h-full max-w-lg flex items-end justify-center relative pb-32">
          <div className="w-1/3 h-full">
            <motion.div style={{ x: useTransform(mouseX, [ -20, 20 ], [ -8, 8 ]), y: useTransform(mouseY, [ -20, 20 ], [ -3, 3 ]) }} className="w-full h-full flex items-end"><CharacterSlot unit={leftUnit} zIndex={10} opacity={0.8} /></motion.div>
          </div>
          <div className="w-1/3 h-full z-20">
            <motion.div style={{ x: mouseX, y: useTransform(mouseY, [ -20, 20 ], [ -12, 12 ]) }} className="w-full h-full flex items-end"><CharacterSlot unit={primaryUnit} zIndex={20} emphasized /></motion.div>
          </div>
          <div className="w-1/3 h-full">
            <motion.div style={{ x: useTransform(mouseX, [ -20, 20 ], [ -8, 8 ]), y: useTransform(mouseY, [ -20, 20 ], [ -3, 3 ]) }} className="w-full h-full flex items-end"><CharacterSlot unit={rightUnit} zIndex={10} opacity={0.8} /></motion.div>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30 bg-black/20 backdrop-blur-lg border-l border-y border-white/10 rounded-l-3xl p-2 shadow-2xl">
          {[
            { icon: Calendar, label: 'EVENT', color: 'text-[#F5C76B]' },
            { icon: Bell, label: 'NOTIF', color: 'text-white' },
            { icon: Mail, label: 'MAIL', color: 'text-white' }
          ].map((btn, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-colors"
            >
              <btn.icon size={22} className={btn.color} />
              <span className="text-[7px] font-black mt-0.5 tracking-tighter opacity-60 text-white">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Campaign Objective */}
        <motion.button
          onClick={() => onNavigate('campaign')}
          whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}
          className="absolute left-6 top-[38%] z-30 text-left group"
        >
          <div className="bg-black/60 backdrop-blur-xl border-l-4 border-l-[#F5C76B] border border-white/10 p-4 rounded-r-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all group-hover:border-white/20">
            <p className="text-[#F5C76B] text-[10px] font-black uppercase tracking-[0.2em]">Misión Actual</p>
            <h3 className="text-white text-base font-black tracking-wider mt-1 flex items-center gap-3">
                Tierras del Destino
              <ChevronRight size={18} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,199,107,0.6)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('campaign')}
            className="w-[72px] h-[72px] bg-gradient-to-br from-[#F5C76B] to-[#b88c3a] rounded-full shadow-[0_0_20px_rgba(245,199,107,0.3)] flex flex-col items-center justify-center group relative overflow-hidden border-2 border-white/20"
          >
            <motion.div
              animate={prefersReduced ? { opacity: 0.2 } : { scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-white/30 rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <MapIcon size={24} className="text-black z-10 drop-shadow-sm" />
            <span className="text-[10px] font-black text-black uppercase z-10 tracking-tighter">MUNDO</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
