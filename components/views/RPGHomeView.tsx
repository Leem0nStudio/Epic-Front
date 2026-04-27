'use client';

import { AssetService } from '@/lib/services/asset-service';
import React, { useEffect } from 'react';
import {
  Users, UserPlus, Sparkles, Sword, Coins, Diamond, Settings,
  ChevronRight, Calendar, Bell, Mail, Star, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, useReducedMotion, useMotionValue, useTransform, MotionValue } from 'motion/react';

// --- Types ---

interface PlayerProfile {
  username: string;
  level?: number;
  exp?: number;
  energy: number;
  max_energy: number;
  currency: number;
  premium_currency: number;
}

interface Unit {
  id: string;
  name: string;
  sprite_id: string;
  icon_id: string;
  current_job_id?: string;
  rarity?: string;
}

type ViewType = 'home' | 'tavern' | 'party' | 'unit_details' | 'gacha' | 'inventory' | 'battle' | 'campaign' | 'stage_details';

interface RPGHomeViewProps {
  saveData: {
    profile: PlayerProfile;
  };
  activePartyUnits: (Unit | null)[];
  onNavigate: (view: ViewType) => void;
}

// --- Helper Components ---

const rarityGlow = (rarity: string | undefined) => {
  switch (rarity?.toLowerCase()) {
    case 'legendary':
    case 'ur': return 'drop-shadow-[0_0_15px_rgba(245,199,107,0.6)]';
    case 'epic':
    case 'sr': return 'drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]';
    case 'rare':
    case 'r': return 'drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]';
    default: return '';
  }
};

const CharacterSlot = ({ unit, scale = 1, zIndex = 1, emphasized = false }: { unit: Unit | null; scale?: number; zIndex?: number; emphasized?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative flex flex-col items-center justify-end h-full w-full"
    style={{ zIndex, scale }}
  >
    <div className={`relative w-full h-[70%] flex items-center justify-center ${emphasized ? 'mb-4' : 'mb-2'}`}>
      <div className={`w-full aspect-[2/3] max-h-full rounded-2xl bg-gradient-to-t from-blue-900/40 to-transparent border border-white/5 relative overflow-hidden ${emphasized && unit ? rarityGlow(unit.rarity || 'ur') : ''}`}>
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full relative"
        >
          {unit?.sprite_id ? (
            <img
              src={AssetService.getSpriteUrl(unit.sprite_id)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-auto object-contain transform origin-bottom"
              style={{ imageRendering: 'pixelated' }}
              alt={unit.name || 'Unit'}
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
          <span className="text-[10px] font-black italic text-[#F5C76B]">{unit.rarity || 'UR'}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} fill="#F5C76B" className="text-[#F5C76B]" />)}
          </div>
        </div>
      )}
    </div>

    {unit && (
      <div className="text-center">
        <p className="text-white text-sm font-black tracking-widest uppercase drop-shadow-md truncate w-full max-w-[100px]">{unit.name || '???'}</p>
        <div className="flex items-center justify-center gap-1">
          {unit.icon_id && <img src={AssetService.getIconUrl(unit.icon_id)} className="w-3 h-3 object-contain" alt="Job Icon" />}
          <p className="text-[#F5C76B] text-[10px] font-bold tracking-tighter opacity-80 uppercase truncate max-w-[80px]">{unit.current_job_id || 'Novice'}</p>
        </div>
      </div>
    )}
  </motion.div>
);

// --- Sub-components ---

const TopBar = ({ profile, primaryUnit, displayCurrency, displayGems }: { profile: PlayerProfile; primaryUnit: Unit | null; displayCurrency: string; displayGems: string }) => (
  <div className="w-full h-16 shrink-0 flex items-center justify-between px-4 z-30 pt-2">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center overflow-hidden">
        {primaryUnit && (
          <img src={AssetService.getSpriteUrl(primaryUnit.sprite_id)} className="w-[150%] transform translate-y-1" style={{ imageRendering: 'pixelated' }} alt="Profile" />
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-[#F5C76B] text-black px-1.5 rounded-sm italic uppercase">Lvl. {profile.level || 1}</span>
          <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">{profile.username}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} className="h-full bg-cyan-400" />
          </div>
          <div className="flex items-center gap-1 text-[#F5C76B]">
            <Zap size={8} className="fill-current" />
            <span className="text-[7px] font-black uppercase">{profile.energy}/{profile.max_energy}</span>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
        <Coins size={16} className="text-[#F5C76B]" />
        <span className="text-sm font-bold text-white">{displayCurrency}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
        <Diamond size={16} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">{displayGems}</span>
      </div>
      <button onClick={() => supabase?.auth.signOut()} className="text-white/60 hover:text-white transition-colors">
        <Settings size={18} />
      </button>
    </div>
  </div>
);

const MainDisplayArea = ({ leftUnit, primaryUnit, rightUnit, mouseX, mouseY }: { leftUnit: Unit | null; primaryUnit: Unit | null; rightUnit: Unit | null; mouseX: MotionValue<number>; mouseY: MotionValue<number> }) => {
  const leftX = useTransform(mouseX, [-20, 20], [-5, 5]);
  const leftY = useTransform(mouseY, [-20, 20], [-2, 2]);
  const primaryY = useTransform(mouseY, [-20, 20], [-10, 10]);
  const rightX = useTransform(mouseX, [-20, 20], [-5, 5]);
  const rightY = useTransform(mouseY, [-20, 20], [-2, 2]);

  return (
    <div className="flex-1 relative flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full h-full max-w-lg flex items-end justify-center relative pb-28">
        <div className="w-[30%] h-full pb-4">
          <motion.div style={{ x: leftX, y: leftY }} className="w-full h-full flex items-end">
            <CharacterSlot unit={leftUnit} scale={0.75} zIndex={10} />
          </motion.div>
        </div>
        <div className="w-[40%] h-full">
          <motion.div style={{ x: mouseX, y: primaryY }} className="w-full h-full flex items-end">
            <CharacterSlot unit={primaryUnit} scale={1.1} zIndex={20} emphasized />
          </motion.div>
        </div>
        <div className="w-[30%] h-full pb-4">
          <motion.div style={{ x: rightX, y: rightY }} className="w-full h-full flex items-end">
            <CharacterSlot unit={rightUnit} scale={0.75} zIndex={10} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const FloatingSidebar = () => (
  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
    {[
      { icon: Calendar, label: 'EVENT', color: 'text-[#F5C76B]' },
      { icon: Bell, label: 'NOTIF', color: 'text-white' },
      { icon: Mail, label: 'MAIL', color: 'text-white' }
    ].map((btn, i) => (
      <motion.button
        key={i}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl"
      >
        <btn.icon size={22} className={btn.color} />
        <span className="text-[7px] font-black mt-0.5 tracking-tighter opacity-60 text-white">{btn.label}</span>
      </motion.button>
    ))}
  </div>
);

const ObjectivePanel = ({ objective }: { objective: { chapter: string; title: string; stars: number; maxStars: number } }) => (
  <div className="absolute left-4 top-1/4 z-30 pointer-events-none">
    <div className="bg-black/40 backdrop-blur-md border-l-4 border-l-[#F5C76B] border border-white/5 p-3 rounded-r-xl shadow-2xl">
      <p className="text-[#F5C76B] text-[10px] font-black uppercase tracking-widest">{objective.chapter}</p>
      <h3 className="text-white text-sm font-bold tracking-wide mt-0.5 flex items-center gap-2">
        {objective.title}
        <ChevronRight size={14} className="opacity-40" />
      </h3>
      <div className="flex gap-1 mt-2">
        {[...Array(objective.maxStars)].map((_, i) => (
          <Star key={i} size={10} fill={i < objective.stars ? "#F5C76B" : "none"} className={i < objective.stars ? "text-[#F5C76B]" : "text-white/20"} />
        ))}
      </div>
    </div>
  </div>
);

const BottomDock = ({ onNavigate, prefersReduced }: { onNavigate: (view: ViewType) => void; prefersReduced: boolean }) => (
  <div className="w-full h-24 shrink-0 bg-gradient-to-t from-black to-transparent z-40 px-4 flex items-center justify-between pb-6">
    <div className="flex gap-3 h-16 flex-1 items-end">
      {[
        { id: 'party', icon: Users, label: 'PARTY' },
        { id: 'tavern', icon: UserPlus, label: 'RECRUIT' },
        { id: 'gacha', icon: Sparkles, label: 'GACHA' },
        { id: 'campaign', icon: ChevronRight, label: 'QUESTS' }
      ].map(btn => (
        <motion.button
          key={btn.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate(btn.id)}
          className="flex-1 h-14 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors"
        >
          <btn.icon size={20} className="text-white/80" />
          <span className="text-[9px] font-black tracking-widest text-white/60">{btn.label}</span>
        </motion.button>
      ))}
    </div>

    <div className="w-24 h-24 relative flex items-center justify-center">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('battle')}
        className="w-20 h-20 bg-gradient-to-br from-[#F5C76B] to-[#b88c3a] rounded-full shadow-[0_0_30px_rgba(245,199,107,0.4)] flex flex-col items-center justify-center group relative overflow-hidden"
      >
        <motion.div
          animate={prefersReduced ? { opacity: 0.4 } : { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-white/20 rounded-full"
        />
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sword size={32} className="text-black transform -rotate-45" />
        <span className="text-[10px] font-black text-black mt-0.5">BATTLE</span>
      </motion.button>
    </div>
  </div>
);

// --- Main Component ---

export function RPGHomeView({ saveData, activePartyUnits, onNavigate }: RPGHomeViewProps) {
  const primaryUnit = activePartyUnits[0] || null;
  const leftUnit = activePartyUnits[1] || null;
  const rightUnit = activePartyUnits[2] || null;
  const prefersReduced = useReducedMotion() || false;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (prefersReduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 25;
      const moveY = (clientY - window.innerHeight / 2) / 25;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, prefersReduced]);

  const displayCurrency = saveData.profile.currency?.toLocaleString() || '0';
  const displayGems = saveData.profile.premium_currency?.toLocaleString() || '0';

  const mockObjective = {
    chapter: "Capítulo 18",
    title: "El Templo Sumergido",
    stars: 2,
    maxStars: 3
  };

  const playerLevel = saveData.profile.level || 1;
  const playerExp = saveData.profile.exp || 0;
  const nextLevelExp = playerLevel * 100;
  const expProgress = (playerExp / nextLevelExp) * 100;

  return (
    <div
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/assets/backgrounds/homebg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/40 via-transparent to-[#020508]/80 pointer-events-none" />

      <TopBar
        profile={saveData.profile}
        primaryUnit={primaryUnit}
        displayCurrency={displayCurrency}
        displayGems={displayGems}
      />

      <div className="flex-1 relative overflow-hidden">
        <MainDisplayArea
          leftUnit={leftUnit}
          primaryUnit={primaryUnit}
          rightUnit={rightUnit}
          mouseX={mouseX}
          mouseY={mouseY}
        />
        <FloatingSidebar />
        <ObjectivePanel objective={mockObjective} />
      </div>

      <BottomDock onNavigate={onNavigate} prefersReduced={prefersReduced} />
    </div>
  );
}
