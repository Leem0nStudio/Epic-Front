'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Sword,
  Star,
  Heart,
  Shield,
  Trophy,
  Castle
} from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { RARITY_COLORS, getRarityCode } from '@/lib/config/assets-config';

interface RPGHomeViewProps {
  saveData: any;
  activePartyUnits: any[];
  onNavigate: (view: import('@/lib/types/game-types').ViewType) => void;
  onSelectUnit?: (unitId: string) => void;
}

const rarityColor = (rarity: string) => {
  const code = getRarityCode(rarity);
  return RARITY_COLORS[code] || RARITY_COLORS.C;
};

const CharacterSlot = ({ unit, scale = 1, zIndex = 1, emphasized = false, flipped = false, onSelectUnit }: any) => {
  const sprite = unit ? AssetService.getSpriteUrl(unit.sprite_id ||
    (unit.name && unit.name.toLowerCase().includes('kael') ? AssetService.getJobSpriteId('archer') :
     unit.name && unit.name.toLowerCase().includes('garran') ? AssetService.getJobSpriteId('swordman') :
     'novice')
  ) : undefined;

  const rarity = unit?.rarity || (emphasized ? 'UR' : 'R');
  const color = rarityColor(rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", damping: 12 }}
      className={`relative flex flex-col items-center justify-end h-full w-full ${emphasized ? "z-20" : "z-10"} cursor-pointer`}
      onClick={() => unit && onSelectUnit && onSelectUnit(unit.id)}
      style={{ scale: scale * 1.45 }}
    >
      {/* Rarity Aura / Glow behind character */}
      {unit && (
        <div
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-32 h-32 blur-3xl opacity-30 pointer-events-none rounded-full"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Rarity Badge above Character head - positioned closer to sprite */}
      {unit && (
        <motion.div
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="absolute top-[8%] left-1/2 -translate-x-1/2 -translate-y-full z-20"
        >
          <RarityBadge rarity={unit.rarity || rarity} size="sm" />
        </motion.div>
      )}

{/* Character Sprite */}
      <div className="relative w-full h-[70%] flex items-center justify-center mb-2">
        {unit ? (
          <>
            {/* Ground Shadow - more prominent */}
            <div className="absolute bottom-1 w-24 h-5 bg-black/50 blur-xl rounded-full -z-10" />

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3 + (emphasized ? 0 : 1), repeat: Infinity, ease: "easeInOut", delay: emphasized ? 0 : 0.5 }}
              className={`w-[180%] max-w-[200px] h-auto object-contain origin-bottom relative ${flipped ? 'scale-x-[-1]' : ''}`}
            >
              <ImageWithFallback
                src={sprite || ''}
                alt={unit.name}
                className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                fallbackSrc={AssetService.getSpriteUrl('novice_idle.png')}
              />
            </motion.div>
          </>
        ) : (
           <div className="w-16 h-16 rounded-full bg-black/30 border-2 border-dashed border-white/10 flex items-center justify-center mb-8">
             <Users size={24} className="text-white/20" />
           </div>
        )}
      </div>

      {/* Stat Panel Below - More compact and premium */}
      {unit && (
        <NineSlicePanel
          type="border"
          variant="default"
          className="w-[120%] p-3 glass-frosted frame-earthstone relative overflow-hidden group hover:border-white/20 transition-all"
          style={{ borderColor: `${color}44` }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0B1A2A] border border-white/10 px-3 py-0.5 rounded-full shadow-lg z-10">
             <span className="text-xs font-black text-white uppercase tracking-tighter">LV.{unit.level || 60}</span>
          </div>
          <h4 className="text-center text-white text-sm font-black tracking-widest uppercase truncate mb-2 mt-1 drop-shadow-md">{unit.name}</h4>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs font-stats font-bold">
             <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
                <span className="text-pink-400/80 uppercase">HP</span>
                <span className="text-white">{(unit.base_stats?.hp || unit.baseStats?.hp || 300)}</span>
             </div>
             <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
                <span className="text-orange-400/80 uppercase">ATK</span>
                <span className="text-white">{(unit.base_stats?.atk || unit.baseStats?.atk || 250)}</span>
             </div>
          </div>
        </NineSlicePanel>
      )}
    </motion.div>
  );
};

export function RPGHomeView({ saveData, activePartyUnits, onNavigate, onSelectUnit }: RPGHomeViewProps) {
  // Sort units by rarity for visual distribution (highest rarity in center/foreground)
  const rarityOrder = { 'SSR': 4, 'UR': 3, 'SR': 2, 'R': 1, 'N': 0 };
  const sortedUnits = [...(activePartyUnits || [])].filter(Boolean).sort((a, b) => {
    if (!a || !b) return 0;
    const rarityA = (a.rarity || 'N').toUpperCase();
    const rarityB = (b.rarity || 'N').toUpperCase();
    return (rarityOrder[rarityB as keyof typeof rarityOrder] || 0) - (rarityOrder[rarityA as keyof typeof rarityOrder] || 0);
  });

  // Distribute: highest rarity center, others flanking
  const validUnits = activePartyUnits?.filter(Boolean) || [];
  const primaryUnit = sortedUnits[0] || validUnits[0] || null;
  const leftUnit = sortedUnits[1] || validUnits[1] || null;
  const rightUnit = sortedUnits[2] || validUnits[2] || null;

  const playerLevel = saveData.profile?.level || 1;

  return (
    <div
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/40 via-transparent to-[#020508]/95 pointer-events-none" />

      {/* Battle CTA - Main Focus */}
      <div className="w-full flex flex-col items-center mt-6 z-40 shrink-0">
        <div className="relative group">
          {/* Pulse Glow Effect */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-cyan-400 blur-2xl rounded-full opacity-40 pointer-events-none"
          />

          <motion.button
            onClick={() => onNavigate('campaign')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-16 py-5 text-2xl font-black font-display tracking-[0.2em] uppercase z-10 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,199,107,0.4)]"
          >
            <Sword size={24} className="animate-pulse" />
            BATTLE
          </motion.button>

          {/* Star decorations */}
          <div className="absolute -right-6 -top-4 flex flex-col gap-1 z-20">
            {[1,2,3].map(i => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
              >
                <Star size={12 + i * 2} className="text-yellow-400 fill-current drop-shadow-[0_2px_10px_rgba(245,199,107,0.8)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Display Area (Characters) - Fixed spacing */}
      <div className="flex-1 relative flex items-center justify-center px-4 -mt-12 overflow-hidden">
        {/* Background Magic Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] aspect-square bg-blue-900/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />

        <div className="w-full h-full max-w-2xl flex items-center justify-center relative pb-0 gap-0 overflow-hidden">
          <div className="w-[28%] h-[90%] flex items-end -mr-4">
            <CharacterSlot unit={leftUnit} onSelectUnit={onSelectUnit} scale={0.95} zIndex={10} flipped />
          </div>
          <div className="w-[36%] h-[100%] flex items-end z-20">
            <CharacterSlot unit={primaryUnit} onSelectUnit={onSelectUnit} scale={1.1} zIndex={30} emphasized />
          </div>
          <div className="w-[28%] h-[90%] flex items-end -ml-4">
            <CharacterSlot unit={rightUnit} onSelectUnit={onSelectUnit} scale={0.95} zIndex={10} />
          </div>
        </div>
      </div>

      {/* Bottom Area: Level-Gated Features */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center pb-8 pt-20 pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent">

          {playerLevel >= 15 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-6 pb-4"
            >
              <div className="text-white/30 text-xs font-black uppercase tracking-widest text-center mb-2">
                Available Features
              </div>
              <div className="flex gap-2 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('guild')}
                  className="flex-1 max-w-[140px] py-2.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 flex flex-col items-center gap-1"
                >
                  <Users size={18} className="text-indigo-400" />
                  <span className="text-[8px] font-black text-indigo-300 uppercase">Guild</span>
                </motion.button>

                {playerLevel >= 30 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('arena')}
                    className="flex-1 max-w-[140px] py-2.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30 flex flex-col items-center gap-1"
                  >
                    <Trophy size={18} className="text-red-400" />
                    <span className="text-[8px] font-black text-red-300 uppercase">Arena PvP</span>
                  </motion.button>
                )}

                {playerLevel >= 35 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('tower')}
                    className="flex-1 max-w-[140px] py-2.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-500/30 flex flex-col items-center gap-1"
                  >
                    <Castle size={18} className="text-amber-400" />
                    <span className="text-[8px] font-black text-amber-300 uppercase">Tower</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
}
