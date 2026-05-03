import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Sword, Users, UserPlus, Sparkles, Trophy,
  Settings, Bell, Gift, Target, ChevronRight,
  Shield, Zap, Coins, Diamond, Info, Star,
  Flame, Wind, Droplets, Mountain, Sun,
  Castle, Map as MapIcon, ScrollText
} from 'lucide-react';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { AssetService } from '@/lib/services/asset-service';

interface RPGHomeViewProps {
  saveData: any;
  activePartyUnits: any[];
  onNavigate: (view: any) => void;
  onOpenFullInventory: () => void;
  onRefillEnergy: () => void;
  onSelectUnit?: (unitId: string) => void;
}

/**
 * RPGHomeView - Redesigned Immersive Home Screen
 * Aesthetic: Ragnarok / Hearthstone (Epic, Ornate, Stone/Gold)
 */
export function RPGHomeView({
  saveData,
  activePartyUnits,
  onNavigate,
  onOpenFullInventory,
  onRefillEnergy,
  onSelectUnit
}: RPGHomeViewProps) {
  const { profile } = saveData;
  const playerLevel = profile?.level || 1;
  const energy = profile?.energy || 0;
  const maxEnergy = profile?.max_energy || 20;
  const currency = profile?.currency || 0;
  const gems = profile?.premium_currency || 0;

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 40;
    const moveY = (clientY - window.innerHeight / 2) / 40;
    mouseX.set(moveX);
    mouseY.set(moveY);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black font-stats select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Background Layer with Parallax */}
      <motion.div
        style={{
          x: useTransform(mouseX, [ -20, 20 ], [ 10, -10 ]),
          y: useTransform(mouseY, [ -20, 20 ], [ 10, -10 ]),
          scale: 1.1
        }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-10" />
        <img
          src={AssetService.getBgUrl('home')}
          alt="Home Background"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Main Layout Containers */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between p-6 pb-4">

        <HeaderStats
          level={playerLevel}
          energy={energy}
          maxEnergy={maxEnergy}
          currency={currency}
          gems={gems}
          onRefill={onRefillEnergy}
          username={profile?.username}
        />

        <div className="flex-1 flex items-center justify-center relative">
           <CharacterStage
             units={activePartyUnits}
             mouseX={mouseX}
             mouseY={mouseY}
             onSelectUnit={onSelectUnit}
           />

           {/* Floating Objective Plaque */}
           <CurrentObjective onNavigate={() => onNavigate('campaign')} />
        </div>

        <div className="flex flex-col items-center gap-6 mb-2">
           <NotificationCenter onNavigate={onNavigate} />
           <StoneDock
             onNavigate={onNavigate}
             onOpenInventory={onOpenFullInventory}
             playerLevel={playerLevel}
           />
        </div>
      </div>

      {/* Immersive Framing Vignette */}
      <div className="absolute inset-0 pointer-events-none z-40 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

      {/* Decorative Ornate Corners */}
      <OrnateCorners />
    </div>
  );
}

/**
 * Top Header with Ornate Stone/Gold Style
 */
function HeaderStats({ level, energy, maxEnergy, currency, gems, onRefill, username }: any) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full flex items-center justify-between gap-6 pointer-events-auto"
    >
      {/* Player Identity Plate */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 group cursor-pointer">
          <NineSlicePanel type="border" variant="fancy" className="absolute inset-0 z-10 p-1 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0B1A2A] rounded-lg overflow-hidden flex items-center justify-center border border-[#F5C76B]/20">
              <span className="text-3xl font-black text-[#F5C76B] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-display">{level}</span>
            </div>
          </NineSlicePanel>
          {/* Level Badge Ornament */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-b from-[#F5C76B] to-[#B8860B] px-4 py-1 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-black/60">
            <span className="text-[10px] font-black text-black uppercase tracking-widest font-stats leading-none">LVL</span>
          </div>
          {/* Decorative Wings */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-10 border-l-2 border-y-2 border-[#F5C76B]/40 rounded-l-full -z-10" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-10 border-r-2 border-y-2 border-[#F5C76B]/40 rounded-r-full -z-10" />
        </div>

        <div className="flex flex-col">
           <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.3em] opacity-80">Adventurer</span>
           <span className="text-lg font-black text-white uppercase tracking-wider drop-shadow-md">{username || 'Adventurer'}</span>
        </div>
      </div>

      {/* Resource Center */}
      <div className="flex items-center gap-4 h-14 bg-black/40 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/5 shadow-2xl">
        {/* Energy Bar Ornate */}
        <div className="flex items-center gap-4 h-full group cursor-pointer min-w-[220px]" onClick={onRefill}>
          <div className="relative">
            <Zap className="w-5 h-5 text-[#A855F7] drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#A855F7] blur-lg rounded-full -z-10"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
             <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                <span>Energy</span>
                <span className="text-white/80">{energy} / {maxEnergy}</span>
             </div>
             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(energy / maxEnergy) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#A855F7] bg-[length:200%_100%] animate-gradient-x rounded-full"
                />
             </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#A855F7]/20 transition-colors">
             <UserPlus className="w-4 h-4 text-white/40" />
          </div>
        </div>

        <div className="w-[1px] h-8 bg-white/10" />

        {/* Currency Plate */}
        <div className="flex items-center gap-3 px-2 group cursor-help">
          <Coins className="w-5 h-5 text-[#F5C76B] drop-shadow-[0_0_5px_rgba(245,199,107,0.5)] group-hover:scale-110 transition-transform" />
          <span className="text-sm font-black text-white tabular-nums drop-shadow-md">{currency.toLocaleString()}</span>
        </div>

        <div className="w-[1px] h-8 bg-white/10" />

        {/* Gems Plate */}
        <div className="flex items-center gap-3 px-2 group cursor-help">
          <Diamond className="w-5 h-5 text-[#22D3EE] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform" />
          <span className="text-sm font-black text-white tabular-nums drop-shadow-md">{gems.toLocaleString()}</span>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2">
        <button className="w-12 h-12 flex items-center justify-center bg-black/60 border border-white/10 rounded-xl hover:border-[#F5C76B]/40 hover:bg-white/5 transition-all group">
          <Settings className="w-5 h-5 text-white/40 group-hover:text-white group-hover:rotate-45 transition-all" />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Unit Display for the Stage - Separated to follow Rules of Hooks
 */
function UnitDisplay({ unit, idx, mouseX, mouseY, onSelectUnit }: any) {
  const [isHovered, setIsHovered] = useState(false);

  // Call useTransform at the top level of this component
  const x = useTransform(mouseX, [ -20, 20 ], [ idx * 4, -idx * 4 ]);
  const y = useTransform(mouseY, [ -20, 20 ], [ idx * 2, -idx * 2 ]);

  if (!unit) return (
    <div className="w-64 h-[60%] border-2 border-dashed border-[#F5C76B]/10 rounded-3xl flex items-center justify-center bg-black/20">
       <UserPlus className="w-8 h-8 text-[#F5C76B]/20" />
    </div>
  );

  const spriteUrl = AssetService.getSpriteUrl(unit.sprite_id || 'novice_idle.png');

  return (
    <div
      className="relative w-64 h-[70%] flex flex-col items-center justify-end group pointer-events-auto cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectUnit && onSelectUnit(unit.id)}
    >
      {/* Contextual Info Panel (Hover) - Hearthstone Style Card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, rotateX: 30 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.9, rotateX: 30 }}
            className="absolute -top-40 w-64 z-50 perspective-1000"
          >
            <NineSlicePanel type="panel" variant="gold" className="p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-[#F5C76B]/40">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-black border-2 border-[#F5C76B] rounded-full flex items-center justify-center z-10">
                 <span className="text-sm font-black text-[#F5C76B]">{unit.level || 1}</span>
              </div>
              <div className="text-center mb-4 border-b border-white/10 pb-2">
                <h4 className="text-sm font-black text-white uppercase tracking-widest font-display">{unit.name}</h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] text-[#F5C76B] font-bold uppercase tracking-tighter">{unit.current_job_id || 'Novice'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatItem label="ATK" value={unit.base_stats?.atk} color="text-red-400" />
                <StatItem label="DEF" value={unit.base_stats?.def} color="text-blue-400" />
                <StatItem label="MATK" value={unit.base_stats?.matk} color="text-purple-400" />
                <StatItem label="AGI" value={unit.base_stats?.agi} color="text-green-400" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-4">
                 <Shield className="w-4 h-4 text-white/20" />
                 <Sword className="w-4 h-4 text-white/20" />
                 <Sparkles className="w-4 h-4 text-white/20" />
              </div>
            </NineSlicePanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Visual with Heavy Shadows & Glowing FX */}
      <motion.div
        style={{ x, y }}
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: idx * 0.7
        }}
        className="relative z-20 group-hover:scale-105 transition-transform duration-500"
      >
        {/* Magic Circle Underlay for Elite/High Level Units */}
        {(unit.level > 20 || idx === 0) && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -z-10 scale-150 opacity-20 pointer-events-none"
          >
             <svg viewBox="0 0 100 100" className="w-full h-full text-[#F5C76B]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
                <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
             </svg>
          </motion.div>
        )}

        <img
          src={spriteUrl}
          alt={unit.name}
          className="w-56 h-56 object-contain pixel-art filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:brightness-125 transition-all"
        />

        {/* Affinity Tag */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="bg-[#0B1A2A] border border-[#F5C76B]/40 px-3 py-1 rounded-md shadow-xl flex items-center gap-2">
              <AffinityIcon affinity={unit.affinity} size={12} />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">{unit.affinity}</span>
           </div>
        </div>
      </motion.div>

      {/* Shadow Base (Perspective) */}
      <div className="absolute bottom-6 w-40 h-8 bg-black/60 blur-xl rounded-[100%] scale-x-150 -z-10" />

      {/* Floor Name Plate */}
      <div className="mt-6 relative px-8 py-1 overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5C76B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
         <span className="text-xs font-black text-white/40 group-hover:text-[#F5C76B] uppercase tracking-[0.4em] transition-colors relative z-10 drop-shadow-lg">
           {unit.name}
         </span>
         <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5C76B]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </div>
    </div>
  );
}

/**
 * Character Display Stage with Interactive Overlays
 */
function CharacterStage({ units, mouseX, mouseY, onSelectUnit }: any) {
  return (
    <div className="w-full max-w-5xl h-full flex items-end justify-center gap-12 px-12 pointer-events-none">
      {units.slice(0, 3).map((unit: any, idx: number) => (
        <UnitDisplay
          key={unit?.id || `empty-${idx}`}
          unit={unit}
          idx={idx}
          mouseX={mouseX}
          mouseY={mouseY}
          onSelectUnit={onSelectUnit}
        />
      ))}
    </div>
  );
}

/**
 * Objective Plaque (Sunken Temple Style)
 */
function CurrentObjective({ onNavigate }: any) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-1/2 right-12 -translate-y-1/2 w-72 pointer-events-auto"
    >
       <NineSlicePanel type="border" variant="fancy" className="p-6 bg-black/60 backdrop-blur-xl border-[#F5C76B]/20 group cursor-pointer hover:border-[#F5C76B]/60 transition-all shadow-2xl" onClick={onNavigate}>
          <div className="absolute -top-3 left-6 bg-[#0B1A2A] border border-[#F5C76B]/40 px-4 py-1 rounded-full shadow-lg flex items-center gap-2">
             <Target className="w-3 h-3 text-[#F5C76B]" />
             <span className="text-[9px] font-black text-[#F5C76B] uppercase tracking-[0.2em]">Current Objective</span>
          </div>

          <div className="mt-4 space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5C76B]/10 border border-[#F5C76B]/20 flex items-center justify-center">
                   <Castle className="w-5 h-5 text-[#F5C76B]" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Chapter 18</p>
                   <h3 className="text-lg font-black text-white uppercase font-display leading-tight">The Sunken Temple</h3>
                </div>
             </div>

             <div className="bg-white/5 rounded-lg p-3 border border-white/5 group-hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-white/60 leading-relaxed font-stats">
                  Infiltrate the depths of the temple and recover the Ancient Relic before the Shadow Cult arrives.
                </p>
             </div>

             <div className="flex items-center justify-end gap-2 text-[#F5C76B]/60 group-hover:text-[#F5C76B] transition-colors">
                <span className="text-[9px] font-black uppercase tracking-widest">Enter Region</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
       </NineSlicePanel>
    </motion.div>
  );
}

/**
 * Functional Badges & Alerts (Notification Center)
 */
function NotificationCenter({ onNavigate }: any) {
  return (
    <div className="flex items-center gap-4 w-full max-w-2xl px-4">
       <button
         className="flex-1 h-14 relative group overflow-hidden"
         onClick={() => onNavigate('daily_rewards')}
       >
          <NineSlicePanel type="border" variant="fancy" className="w-full h-full bg-[#0B1A2A]/80 backdrop-blur-xl flex items-center px-6 gap-4 hover:border-[#F5C76B]/40 transition-all">
             <div className="relative">
                <Bell className="w-5 h-5 text-orange-400 group-hover:animate-swing" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
             </div>
             <div className="flex-1 flex flex-col items-start overflow-hidden">
                <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest opacity-80">World Event</span>
                <span className="text-xs font-black text-white uppercase tracking-tight truncate w-full">The Crimson Eclipse has begun! Collect rewards.</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <span className="text-xs font-black text-red-500">1</span>
             </div>
          </NineSlicePanel>
          {/* Animated Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
       </button>

       <button className="w-14 h-14 bg-[#0B1A2A]/80 border border-white/10 rounded-2xl flex items-center justify-center hover:border-green-500/40 hover:bg-green-500/5 transition-all group relative">
          <Gift className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0B1A2A] flex items-center justify-center shadow-lg">
             <Star className="w-3 h-3 text-white fill-white" />
          </div>
       </button>
    </div>
  );
}

/**
 * Bottom Dock Navigation with Stone Plate Aesthetics
 */
function StoneDock({ onNavigate, onOpenInventory, playerLevel }: any) {
  const buttons = [
    { id: 'campaign', icon: MapIcon, label: 'QUESTS', color: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.1)]' },
    { id: 'party', icon: Users, label: 'ROSTER', color: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]' },
    { id: 'tavern', icon: UserPlus, label: 'INN', color: 'text-emerald-400', badge: '!', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' },
    { id: 'gacha', icon: Sparkles, label: 'RELICS', color: 'text-purple-400', badge: 'NEW', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]' },
    { id: 'inventory', icon: Sword, label: 'EQUIP', color: 'text-white/60', action: 'inventory', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.05)]' }
  ];

  return (
    <div className="w-full max-w-3xl px-4">
      <div className="flex items-center justify-between gap-4">
        {buttons.map((btn) => (
          <motion.button
            key={btn.id}
            whileHover={{ y: -10, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => btn.action === 'inventory' ? onOpenInventory() : onNavigate(btn.id as any)}
            className="flex-1 group relative h-28"
          >
            {/* Background Plate (Stone) */}
            <div className={`absolute inset-0 bg-[#1A1A1A] border-2 border-white/5 rounded-2xl ${btn.glow} group-hover:border-[#F5C76B]/30 group-hover:bg-[#222] transition-all duration-300 overflow-hidden`}>
               {/* Rock Texture Effect */}
               <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] pointer-events-none" />
               {/* Bevel Effect */}
               <div className="absolute inset-0 border-t-2 border-white/10 rounded-2xl pointer-events-none" />
               <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40 rounded-b-2xl pointer-events-none" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-[#F5C76B]/10 transition-colors shadow-inner">
                <btn.icon size={28} className={`${btn.color} group-hover:text-[#F5C76B] group-hover:drop-shadow-[0_0_10px_currentColor] transition-all duration-300`} />
              </div>
              <span className="text-[10px] font-black text-white/30 group-hover:text-white transition-colors tracking-[0.2em] uppercase font-stats">
                {btn.label}
              </span>
            </div>

            {/* Badge Functional Badge */}
            {btn.badge && (
              <div className="absolute -top-2 -right-1 z-20">
                 <div className="bg-red-600 px-2 py-1 rounded-md border-2 border-[#1A1A1A] shadow-[0_4px_10px_rgba(220,38,38,0.4)] animate-bounce-subtle">
                   <span className="text-[9px] font-black text-white drop-shadow-sm">{btn.badge}</span>
                 </div>
              </div>
            )}

            {/* Active Indicator Hover Line */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#F5C76B] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 shadow-[0_0_8px_#F5C76B]" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/**
 * Ornate Corners (Frame Decoration)
 */
function OrnateCorners() {
  return (
    <>
      {/* Top Left */}
      <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none z-50 overflow-hidden">
        <div className="absolute top-6 left-6 w-full h-full border-t-2 border-l-2 border-[#F5C76B]/30 rounded-tl-[40px]">
           <div className="absolute -top-1 -left-1 w-6 h-6 bg-[#F5C76B] rounded-full blur-[2px] opacity-20" />
           <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#F5C76B] rounded-tl-xl" />
        </div>
        <div className="absolute top-10 left-10 w-4 h-4 bg-[#F5C76B]/10 rotate-45 border border-[#F5C76B]/20" />
      </div>

      {/* Top Right */}
      <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none z-50 overflow-hidden">
        <div className="absolute top-6 right-6 w-full h-full border-t-2 border-r-2 border-[#F5C76B]/30 rounded-tr-[40px]">
           <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#F5C76B] rounded-tr-xl" />
        </div>
        <div className="absolute top-10 right-10 w-4 h-4 bg-[#F5C76B]/10 rotate-45 border border-[#F5C76B]/20" />
      </div>

      {/* Bottom Decoration Vine Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-30 pointer-events-none opacity-60" />
    </>
  );
}

// Internal Helpers
function StatItem({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between gap-1 group/stat">
      <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">{label}</span>
      <div className="flex items-center gap-1.5">
         <span className={`text-[10px] font-black ${color} tabular-nums`}>{value || 0}</span>
         <div className="w-1 h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
               initial={{ height: 0 }}
               animate={{ height: `${Math.min(100, (value / 500) * 100)}%` }}
               className={`w-full ${color.replace('text-', 'bg-')} opacity-60`}
            />
         </div>
      </div>
    </div>
  );
}

function AffinityIcon({ affinity, size = 16 }: { affinity: string, size?: number }) {
  const icons: any = {
    physical: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    magic: { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ranged: { icon: Wind, color: 'text-green-500', bg: 'bg-green-500/10' },
    support: { icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    tank: { icon: Mountain, color: 'text-amber-800', bg: 'bg-amber-800/10' }
  };

  const Config = icons[affinity?.toLowerCase()] || icons.physical;

  return (
    <div className={`flex items-center justify-center ${Config.color}`}>
      <Config.icon size={size} />
    </div>
  );
}
