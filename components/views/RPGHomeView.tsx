'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { SpriteAtlasIcon } from '@/components/ui/SpriteAtlasIcon';
import { SPRITE_INDEX } from '@/lib/config/sprite-atlas-config';
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
  Box,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { PanelButton } from '@/components/ui/PanelButton';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface RPGHomeViewProps {
  saveData: any;
  activePartyUnits: any[];
  onNavigate: (view: any) => void;
  onOpenFullInventory: () => void;
}

const rarityGlow = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'ur': return 'shadow-[0_0_30px_rgba(245,199,107,0.4)] border-[#F5C76B]/40';
    case 'sr': return 'shadow-[0_0_25px_rgba(168,85,247,0.3)] border-purple-500/40';
    case 'r': return 'shadow-[0_0_20px_rgba(59,130,246,0.2)] border-blue-500/40';
    default: return 'border-white/5';
  }
};

const CharacterSlot = ({ unit, scale = 1, zIndex = 1, emphasized = false, flipped = false }: any) => {
  const sprite = unit ? AssetService.getSpriteUrl(unit.sprite_id || 
    (unit.name && unit.name.toLowerCase().includes('kael') ? AssetService.getJobSpriteId('archer') :
     unit.name && unit.name.toLowerCase().includes('garran') ? AssetService.getJobSpriteId('swordman') :
     'novice')
  ) : undefined;

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
              <div
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[160%] h-auto object-contain origin-bottom ${flipped ? 'scale-x-[-1]' : ''}`}
              >
                <ImageWithFallback
                  src={sprite || ''}
                  alt={unit.name}
                  className="w-full h-auto object-contain"
                  fallbackSrc={AssetService.getSpriteUrl('novice_idle.png')}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <Users size={48} className="text-white" />
              </div>
            )}
          </motion.div>
        </div>

          {unit && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 whitespace-nowrap">
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-black text-[#F5C76B]">LV.{unit.level}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map(i => <Star key={i} size={6} className="text-yellow-400 fill-current" />)}
                </div>
              </div>
              <div className="px-3 py-0.5 rounded-full bg-black/80 border border-white/20 shadow-lg">
                <p className="text-[8px] font-black text-white drop-shadow-lg truncate uppercase tracking-tighter">{unit.name}</p>
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

export function RPGHomeView({ saveData, activePartyUnits, onNavigate, onOpenFullInventory }: RPGHomeViewProps) {
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
      style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/40 via-transparent to-[#020508]/80 pointer-events-none" />

      {/* Top Bar - Visual Alchemy: Earthstone frame + Glass */}
       <div className="w-full h-16 shrink-0 flex items-center justify-between px-6 z-30 pt-3">
         <div className="flex items-center gap-4">
           <div className="w-11 h-11 rounded-xl frame-earthstone flex items-center justify-center overflow-hidden">
              <SpriteAtlasIcon index={SPRITE_INDEX.icon_novice} size={44} alt="Novice" />
            </div>
           <div className="flex flex-col text-left gap-1.5">
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-black bg-[#F5C76B] text-black px-2 py-0.5 rounded-md italic uppercase shadow-[0_0_10px_rgba(245,199,107,0.3)]">Lvl. {playerLevel}</span>
               <span className="text-white text-sm font-bold tracking-wider drop-shadow-md font-stats">{saveData.profile.username}</span>
             </div>
             <div className="flex items-center gap-3 mt-1.5">
               <div className="w-28 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: `${expProgress}%` }} 
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-[#F5C76B] to-[#FFD88F] shadow-[0_0_8px_rgba(245,199,107,0.6)]" 
                 />
               </div>
               <div className="flex items-center gap-1 text-[#F5C76B] bg-black/30 px-2 py-0.5 rounded-full border border-[#F5C76B]/10">
                 <Zap size={10} className="fill-current" />
                 <span className="text-[8px] font-black uppercase tracking-wider font-stats">{saveData.profile.energy}/{saveData.profile.max_energy}</span>
               </div>
             </div>
           </div>
         </div>

         <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 glass-frosted px-3 py-1.5 rounded-xl border border-white/5">
             <Coins size={16} className="text-[#F5C76B] drop-shadow-[0_0_5px_rgba(245,199,107,0.5)]" />
             <span className="text-sm font-bold text-white tracking-wide font-stats">{displayCurrency}</span>
           </div>
           <div className="flex items-center gap-2 glass-frosted px-3 py-1.5 rounded-xl border border-white/5">
             <Diamond size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
             <span className="text-sm font-bold text-white tracking-wide font-stats">{displayGems}</span>
           </div>
           <button
             onClick={async () => { await supabase?.auth.signOut(); window.location.href = '/'; }}
             className="btn-alchemy w-11 h-11 rounded-xl"
           >
             <SpriteAtlasIcon index={SPRITE_INDEX.icon_novice} size={18} alt="Novice" />
           </button>
         </div>
       </div>

       {/* Main Display Area */}
       <div className="flex-1 relative flex items-center justify-center px-6">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-[#F5C76B]/5 blur-[120px] rounded-full pointer-events-none" />
         
         {/* Particle effects */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="particle-magic" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
           <div className="particle-magic" style={{ top: '40%', right: '20%', animationDelay: '1s' }} />
           <div className="particle-magic" style={{ bottom: '30%', left: '25%', animationDelay: '2s' }} />
           <div className="particle-magic" style={{ top: '60%', right: '15%', animationDelay: '0.5s' }} />
           <div className="particle-magic" style={{ bottom: '40%', right: '30%', animationDelay: '1.5s' }} />
         </div>
         
         <div className="w-full h-full max-w-lg flex items-end justify-center relative pb-20 gap-2">
          <div className="w-[28%] h-full pb-4 flex items-end">
            <CharacterSlot unit={leftUnit} scale={0.9} zIndex={10} flipped />
          </div>
          <div className="w-[34%] h-full flex items-end">
            <CharacterSlot unit={primaryUnit} scale={1.0} zIndex={20} emphasized />
          </div>
          <div className="w-[28%] h-full pb-4 flex items-end">
            <CharacterSlot unit={rightUnit} scale={0.9} zIndex={10} />
          </div>
        </div>

        {/* Right Floating Sidebar */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          {[
            { icon: Calendar, label: 'EVENT', color: 'text-[#F5C76B]', glow: 'shadow-[#F5C76B]/20' },
            { icon: Bell, label: 'NOTIF', color: 'text-white', glow: 'shadow-white/10' },
            { icon: Mail, label: 'MAIL', color: 'text-white', glow: 'shadow-white/10' }
          ].map((btn, i) => (
            <Button
              key={i}
              variant="secondary"
              size="sm"
              className="w-12 h-12 flex flex-col items-center justify-center !rounded-2xl"
              whileHover={{ scale: 1.1, x: -4 }}
              whileTap={{ scale: 0.9 }}
            >
              <btn.icon size={18} className={btn.color} />
              <span className="text-[7px] font-black mt-0.5 tracking-tighter opacity-50">{btn.label}</span>
            </Button>
          ))}
        </div>

      {/* Campaign Objective */}
        <motion.div
          onClick={() => onNavigate('campaign')}
          whileHover={{ x: 8 }}
          whileTap={{ scale: 0.98 }}
          className="absolute left-6 top-1/4 z-30 text-left cursor-pointer"
        >
          <NineSlicePanel
            type="border"
            variant="default"
            className="p-4 pr-5 backdrop-blur-xl"
            glassmorphism={true}
            style={{ 
              background: 'linear-gradient(to right, rgba(245,199,107,0.15), rgba(0,0,0,0.3))',
              borderLeft: '3px solid #F5C76B' 
            }}
          >
            <div>
              <p className="text-[#F5C76B] text-[9px] font-black uppercase tracking-[0.3em] mb-1">MISIÓN ACTUAL</p>
              <h3 className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
                Tierras del Destino
                <ChevronRight size={14} className="opacity-40 text-[#F5C76B]" />
              </h3>
            </div>
          </NineSlicePanel>
        </motion.div>
      </div>

        {/* Bottom Dock */}
        <div className="w-full shrink-0 bg-gradient-to-t from-[#020508]/95 via-[#0B1A2A]/80 to-transparent z-40 px-4 flex items-center justify-between pb-4 pt-2">
          <div className="flex gap-2 h-16 flex-1 items-end overflow-x-auto">
            {[
              { id: 'party', icon: Users, label: 'EQUIPO' },
              { id: 'inventory', icon: Box, label: 'INVENT', action: 'inventory' },
              { id: 'tavern', icon: UserPlus, label: 'GREMI' },
              { id: 'quests', icon: BookOpen, label: 'QUEST' },
              { id: 'gacha', icon: Sparkles, label: 'NEXO' }
            ].map(btn => (
              <Button
                key={btn.id}
                variant="secondary"
                onClick={() => btn.action === 'inventory' ? onOpenFullInventory() : onNavigate(btn.id as any)}
                className="flex-1 min-w-0 h-14 flex flex-col items-center justify-center gap-1 !rounded-xl"
                whileTap={{ scale: 0.95 }}
              >
                <btn.icon size={16} className="text-white/80" />
                <span className="text-[7px] font-black tracking-widest text-white/60 uppercase truncate w-full">{btn.label}</span>
              </Button>
            ))}
          </div>

        <div className="w-24 h-24 relative flex items-center justify-center mx-4">
          <div className="absolute inset-0 bg-[#F5C76B]/10 blur-[30px] rounded-full scale-75" />
          <PanelButton
            variant="gold"
            onClick={() => onNavigate('campaign')}
            className="w-22 h-22 rounded-full shadow-[0_0_40px_rgba(245,199,107,0.3)] flex flex-col items-center justify-center relative overflow-hidden group"
            whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(245,199,107,0.5)' }}
            whileTap={{ scale: 0.92 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <MapIcon size={32} className="text-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            <span className="text-[9px] font-black text-black mt-0.5 uppercase tracking-widest">MUNDO</span>
          </PanelButton>
        </div>
      </div>
    </div>
  );
}
