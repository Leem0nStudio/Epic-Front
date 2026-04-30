'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Coins,
  Diamond,
  Calendar,
  Bell,
  Mail,
  Zap,
  Sparkles,
  UserPlus,
  Sword,
  Star,
  BookOpen,
  Heart,
  Shield,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface RPGHomeViewProps {
  saveData: any;
  activePartyUnits: any[];
  onNavigate: (view: any) => void;
  onOpenFullInventory: () => void;
  onRefillEnergy?: () => void;
}

const rarityGlow = (rarity: string) => {
  switch (rarity?.toUpperCase()) {
    case 'UR': return 'text-orange-400';
    case 'SR': return 'text-fuchsia-400';
    case 'R': return 'text-blue-400';
    default: return 'text-gray-400';
  }
};

const CharacterSlot = ({ unit, scale = 1, zIndex = 1, emphasized = false, flipped = false }: any) => {
  const sprite = unit ? AssetService.getSpriteUrl(unit.sprite_id || 
    (unit.name && unit.name.toLowerCase().includes('kael') ? AssetService.getJobSpriteId('archer') :
     unit.name && unit.name.toLowerCase().includes('garran') ? AssetService.getJobSpriteId('swordman') :
     'novice')
  ) : undefined;
  
  const rarity = unit?.rarity || (emphasized ? 'UR' : 'R');
  const colorClass = rarityGlow(rarity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col items-center justify-end h-full w-full ${emphasized ? 'z-20' : 'z-10'}`}
      style={{ scale }}
    >
      {/* Rarity Badge above Character */}
      {unit && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <div className={`w-12 h-12 rarity-ring flex flex-col items-center justify-center ${colorClass}`}>
            <span className="text-xl font-black font-display leading-none drop-shadow-md text-white">{rarity}</span>
          </div>
          <div className="flex gap-0.5 mt-1">
             {[...Array(rarity === 'UR' ? 5 : rarity === 'SR' ? 4 : 3)].map((_, i) => (
                <Star key={i} size={8} className={`${colorClass} fill-current drop-shadow-md`} />
             ))}
          </div>
        </div>
      )}

      {/* Character Sprite (No Box) */}
      <div className={`relative w-full h-[65%] flex items-end justify-center mb-1`}>
        {unit ? (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: emphasized ? 0 : 1 }}
            className={`w-[160%] h-auto object-contain origin-bottom ${flipped ? 'scale-x-[-1]' : ''}`}
          >
            <ImageWithFallback
              src={sprite || ''}
              alt={unit.name}
              className="w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              fallbackSrc={AssetService.getSpriteUrl('novice_idle.png')}
            />
          </motion.div>
        ) : (
           <div className="w-16 h-16 rounded-full bg-black/20 border-2 border-dashed border-white/20 flex items-center justify-center mb-8">
             <Users size={24} className="text-white/30" />
           </div>
        )}
      </div>

      {/* Stat Panel Below */}
      {unit && (
        <div className="w-[115%] stat-panel flex flex-col relative px-2 pb-2 pt-3 mt-1 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 pill-dark px-3 py-0.5 whitespace-nowrap border-white/20 shadow-md">
             <span className="text-[9px] font-black text-white uppercase tracking-wider">Lv. {unit.level || 60}</span>
          </div>
          <h4 className="text-center text-white text-[10px] font-bold tracking-wide truncate mt-1 mb-1.5">{unit.name}</h4>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-stats font-bold px-1">
             <div className="flex items-center justify-between">
                <span className="text-pink-400 flex items-center gap-1"><Heart size={8}/> HP</span>
                <span className="text-white">{(unit.base_stats?.hp || unit.baseStats?.hp || 300)}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-orange-400 flex items-center gap-1"><Sword size={8}/> ATK</span>
                <span className="text-white">{(unit.base_stats?.atk || unit.baseStats?.atk || 250)}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-blue-400 flex items-center gap-1"><Shield size={8}/> DEF</span>
                <span className="text-white">{(unit.base_stats?.def || unit.baseStats?.def || 100)}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-cyan-400 flex items-center gap-1"><Shield size={8}/> M.DEF</span>
                <span className="text-white">{(unit.base_stats?.mdef || unit.baseStats?.mdef || 90)}</span>
             </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export function RPGHomeView({ saveData, activePartyUnits, onNavigate, onOpenFullInventory, onRefillEnergy }: RPGHomeViewProps) {
  const primaryUnit = activePartyUnits[0];
  const leftUnit = activePartyUnits[1];
  const rightUnit = activePartyUnits[2];

  const [displayCurrency, setDisplayCurrency] = useState<number>(saveData.profile?.currency || 0);
  const [displayGems, setDisplayGems] = useState<number>(saveData.profile?.premium_currency || 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (displayCurrency < (saveData.profile?.currency || 0)) setDisplayCurrency(prev => Math.min(saveData.profile?.currency || 0, prev + 50));
      if (displayGems < (saveData.profile?.premium_currency || 0)) setDisplayGems(prev => Math.min(saveData.profile?.premium_currency || 0, prev + 5));
    }, 50);
      return () => clearTimeout(timer);
  }, [saveData.profile?.currency, saveData.profile?.premium_currency, displayCurrency, displayGems]);

  const playerLevel = saveData.profile?.level || 65;
  const playerExp = saveData.profile?.exp || 4500;
  const nextLevelExp = playerLevel * 100;
  const expProgress = Math.min((playerExp / nextLevelExp) * 100, 75); // Forced 75% for visual match

  return (
    <div
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/60 via-transparent to-[#020508]/90 pointer-events-none" />

      {/* Top Bar - Premium Redesign */}
      <div className="w-full shrink-0 flex items-center justify-between px-4 z-30 pt-6">
        {/* Left: Rank & Username */}
        <div className="relative flex items-center pl-8">
          <div className="pill-dark pl-10 pr-6 py-2 flex flex-col justify-center min-w-[160px] border-[#F5C76B]/40 shadow-xl relative z-0">
              <span className="text-white text-sm font-bold tracking-wide drop-shadow-md font-stats truncate">
                {saveData.profile?.username || "Aethel_Player"}
              </span>
            <div className="w-full flex items-center gap-2 mt-1">
              <span className="text-[8px] font-black uppercase text-white/60">Lv. {playerLevel}</span>
              <div className="flex-1 h-1 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F5C76B] to-[#FFD88F]" style={{ width: `${expProgress}%` }} />
              </div>
            </div>
          </div>
          
          {/* Circular Rank Badge overlapping */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[4.5rem] h-[4.5rem] badge-rank-circle rounded-full flex flex-col items-center justify-center text-white z-10 shadow-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider mb-[-4px] text-[#2a1c0b]">Rank</span>
            <span className="text-2xl font-black font-display leading-none text-[#1a1107]">{playerLevel}</span>
          </div>
        </div>

        {/* Right: Currencies & Notification */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-2">
             <div className="pill-dark flex items-center justify-between px-3 py-1.5 min-w-[120px] shadow-lg relative overflow-hidden group cursor-pointer hover:border-[#F5C76B] transition-colors">
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Coins size={16} className="text-[#F5C76B] drop-shadow-[0_0_5px_rgba(245,199,107,0.5)]" />
               <span className="text-xs font-bold text-white tracking-wide font-stats">{displayCurrency.toLocaleString()}</span>
               <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center ml-1"><span className="text-[10px] font-black">+</span></div>
             </div>
             <div className="pill-dark flex items-center justify-between px-3 py-1.5 min-w-[120px] shadow-lg relative overflow-hidden group cursor-pointer hover:border-cyan-400 transition-colors">
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Diamond size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
               <span className="text-xs font-bold text-white tracking-wide font-stats">{displayGems.toLocaleString()}</span>
               <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center ml-1"><span className="text-[10px] font-black">+</span></div>
             </div>
             {/* Energy Refill Button */}
             {saveData.energy < saveData.max_energy && (
               <button
                 onClick={onRefillEnergy}
                 className="pill-dark flex items-center justify-between px-3 py-1.5 min-w-[120px] shadow-lg relative overflow-hidden group cursor-pointer hover:border-purple-400 transition-colors"
               >
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Zap size={16} className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                 <span className="text-xs font-bold text-white/90 tracking-wide font-stats">50</span>
                 <div className="w-4 h-4 rounded-full bg-purple-400/20 flex items-center justify-center ml-1">
                   <span className="text-[8px] font-black text-purple-400">+</span>
                 </div>
               </button>
             )}
           </div>
          
          <div className="relative cursor-pointer hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-full pill-dark flex items-center justify-center text-white/80 shadow-lg border-white/10">
              <Bell size={20} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#1a253a] flex items-center justify-center shadow-md">
              <span className="text-[9px] font-black text-white">!</span>
            </div>
          </div>
        </div>
       </div>

       {/* Battle Button - Top Area */}
       <div className="w-full flex justify-center mt-4 mb-2 relative z-40">
          <motion.button 
            onClick={() => onNavigate('campaign')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-premium-blue px-14 py-3.5 text-xl font-black font-display tracking-widest uppercase z-10 flex items-center justify-center gap-2"
          >
            BATTLE
          </motion.button>
          
          {/* 3 Stars floating next to battle button */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-0.5 z-20">
            {[1,2,3].map(i => <Star key={i} size={16} className="text-yellow-400 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />)}
          </div>
       </div>

       {/* Main Display Area (Characters) */}
      <div className="flex-1 relative flex items-center justify-center px-4 mt-4">
        {/* Magic Glow behind characters */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="particle-magic" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
          <div className="particle-magic" style={{ top: '40%', right: '20%', animationDelay: '1s' }} />
          <div className="particle-magic" style={{ bottom: '30%', left: '25%', animationDelay: '2s' }} />
          <div className="particle-magic" style={{ top: '60%', right: '15%', animationDelay: '0.5s' }} />
        </div>
        
        <div className="w-full h-full max-w-lg flex items-center justify-center relative pb-16 gap-1">
         <div className="w-[30%] h-full pb-4 flex items-end">
           <CharacterSlot unit={leftUnit} scale={0.95} zIndex={10} flipped />
         </div>
         <div className="w-[38%] h-full flex items-end">
           <CharacterSlot unit={primaryUnit} scale={1.1} zIndex={20} emphasized />
         </div>
         <div className="w-[30%] h-full pb-4 flex items-end">
           <CharacterSlot unit={rightUnit} scale={0.95} zIndex={10} />
         </div>
       </div>

       {/* Right Floating Sidebar */}
       <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-50">
         {[
            { icon: Calendar, label: 'Events', badge: null },
            { icon: Mail, label: 'Notifs', badge: '1' }
         ].map((btn, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 group cursor-pointer relative hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-2xl pill-dark flex flex-col items-center justify-center border-[#F5C76B]/30 shadow-xl group-hover:border-[#F5C76B] transition-colors relative">
                <btn.icon size={22} className="text-[#F5C76B] mb-0.5" />
                <span className="text-[7px] font-black text-white/90 uppercase tracking-widest">{btn.label}</span>
                {btn.badge && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-[#1a253a] flex items-center justify-center text-[10px] font-black text-white shadow-md">
                    {btn.badge}
                  </div>
                )}
              </div>
            </div>
         ))}
       </div>
      </div>

       {/* Campaign Banner & Bottom Dock */}
       <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
          
          {/* Campaign Banner */}
          <div className="w-[90%] max-w-[400px] mb-4 relative flex flex-col items-center pointer-events-auto">
            <div className="w-full stat-panel border-[#5a6b8a] p-3 pb-6 text-center shadow-2xl relative">
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 pill-dark px-5 py-1 border-[#5a6b8a] shadow-lg">
                 <span className="text-[9px] text-white/90 font-bold uppercase tracking-widest flex items-center gap-1.5">
                   Current Objective 
                   <div className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center text-[8px] font-serif text-white/70">i</div>
                 </span>
               </div>
               
               <p className="text-[#a8b8d0] text-[9px] font-black uppercase tracking-[0.2em] mt-3 mb-0.5">Chapter 18:</p>
               <h3 className="text-white text-base font-black font-display uppercase tracking-widest drop-shadow-md">The Sunken Temple</h3>
            </div>
          </div>

          {/* Bottom Dock Navigation */}
          <div className="w-full bg-[#050A0F]/95 backdrop-blur-xl border-t border-white/10 pb-6 pt-4 px-4 flex justify-center gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] pointer-events-auto">
           <div className="flex max-w-[500px] w-full justify-between gap-2">
             {[
               { id: 'party', icon: Users, label: 'PARTY', active: true },
               { id: 'tavern', icon: UserPlus, label: 'RECRUIT', badge: 'new' },
               { id: 'gacha', icon: Sparkles, label: 'GACHA', badge: '1', activeGlow: true },
               { id: 'inventory', icon: Sword, label: 'BATTLE', action: 'inventory' }
             ].map((btn, index) => (
                <button
                  key={btn.id}
                  onClick={() => btn.action === 'inventory' ? onOpenFullInventory() : onNavigate(btn.id as any)}
                  className={`flex-1 min-w-[70px] aspect-[4/3] max-h-[80px] flex flex-col items-center justify-center gap-1 relative btn-nav-square ${btn.active ? 'active' : ''} ${btn.activeGlow ? 'border-[#a855f7]' : ''}`}
                >
                  {btn.activeGlow && <div className="absolute inset-0 bg-fuchsia-500/10 blur-md rounded-xl pointer-events-none" />}
                  {btn.active && <div className="absolute inset-0 bg-[#F5C76B]/10 blur-md rounded-xl pointer-events-none" />}
                  
                  <btn.icon size={26} className={btn.active ? 'text-[#F5C76B]' : btn.activeGlow ? 'text-fuchsia-300' : 'text-white/70'} />
                  <span className={`text-[9px] font-black tracking-widest uppercase mt-0.5 ${btn.active ? 'text-[#F5C76B]' : 'text-white/90'}`}>{btn.label}</span>
                  
                  {btn.badge && (
                    <div className={`absolute -top-2 right-1 ${btn.badge === 'new' ? 'bg-orange-500 rounded px-1.5 py-0.5' : 'w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'} border-2 border-[#1f2a3c] text-[9px] font-black text-white uppercase tracking-tighter shadow-lg`}>
                      {btn.badge}
                    </div>
                  )}
                </button>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}
