'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Zap, Clock, Shield, Sword, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { getRarityCode } from '@/lib/config/assets-config';
import { SkillDefinition } from '@/lib/types/combat';

interface SkillDetailViewProps {
  skillId: string;
  itemId: string;
  onBack: () => void;
  onEquip: (item: any) => void;
  onDiscard: (itemId: string) => void;
}

export function SkillDetailView({ skillId, itemId, onBack, onEquip, onDiscard }: SkillDetailViewProps) {
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkill() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();
      
      if (!error && data) {
        setSkill(data);
      }
      setLoading(false);
    }
    loadSkill();
  }, [skillId]);

  const getEffectIcon = (effectType: string) => {
    switch (effectType) {
      case 'damage': return <Sword size={16} className="text-red-400" />;
      case 'heal': return <Heart size={16} className="text-green-400" />;
      case 'buff': return <Shield size={16} className="text-blue-400" />;
      case 'debuff': return <Shield size={16} className="text-purple-400" />;
      case 'dot': return <Sparkles size={16} className="text-yellow-400" />;
      default: return <Zap size={16} className="text-[#F5C76B]" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-white bg-white/10 border-white/20';
      case 'rare': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'epic': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'legendary': return 'text-[#F5C76B] bg-[#F5C76B]/10 border-[#F5C76B]/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#0B1A2A] p-4 overflow-hidden relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const effect = skill?.effect ? (typeof skill.effect === 'string' ? JSON.parse(skill.effect) : skill.effect) : {};
  const scaling = skill?.scaling ? (typeof skill.scaling === 'string' ? JSON.parse(skill.scaling) : skill.scaling) : {};

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      
       {/* Header */}
       <div className="flex items-center justify-between mb-6 z-10">
         <button onClick={onBack} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors btn-back">
           <ChevronLeft size={20} />
         </button>
         <div className="flex flex-col items-center">
           <h1 className="text-xl font-black text-white tracking-widest uppercase italic font-display">Detalles</h1>
           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-stats">Habilidad</span>
         </div>
         <div className="w-10" />
       </div>

      <div className="flex-1 overflow-y-auto z-10 space-y-6">
         {/* Skill Icon & Name */}
         <div className="flex flex-col items-center gap-4">
            <RarityIcon
              rarity={getRarityCode(skill?.rarity)}
              size="lg"
            >
              <Zap size={40} className="text-[#F5C76B]" />
            </RarityIcon>
           
           <div className="text-center">
             <h2 className="text-2xl font-black text-white uppercase tracking-wider">{skill?.name || 'Unknown'}</h2>
             <span className={`text-[10px] font-black px-3 py-1 rounded-md border mt-2 inline-block ${getRarityColor(skill?.rarity)}`}>
               {skill?.rarity?.toUpperCase() || 'COMMON'}
             </span>
           </div>
         </div>

           {/* Description */}
           {skill?.description && (
             <NineSlicePanel
               type="border"
               variant="default"
               className="p-4 glass-frosted frame-earthstone"
               glassmorphism={true}
             >
               <p className="text-white/80 text-sm text-center leading-relaxed font-stats">{skill.description}</p>
             </NineSlicePanel>
           )}

           {/* Stats */}
           <div className="grid grid-cols-2 gap-3">
             <NineSlicePanel
               type="border"
               variant="default"
               className="p-4 glass-frosted frame-earthstone"
               glassmorphism={true}
             >
               <div className="flex items-center gap-2 mb-2">
                 <Clock size={14} className="text-white/40" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-wider font-stats">Cooldown</span>
               </div>
               <p className="text-xl font-black text-white font-stats">{skill?.cooldown || 0}</p>
             </NineSlicePanel>

             <NineSlicePanel
               type="border"
               variant="default"
               className="p-4 glass-frosted frame-earthstone"
               glassmorphism={true}
             >
               <div className="flex items-center gap-2 mb-2">
                 <Zap size={14} className="text-[#F5C76B]" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-wider font-stats">Power</span>
               </div>
               <p className="text-xl font-black text-white font-stats">{scaling?.mult || effect?.power || 1.0}x</p>
             </NineSlicePanel>
           </div>

           {/* Effect Details */}
           {effect && Object.keys(effect).length > 0 && (
             <NineSlicePanel
               type="border"
               variant="default"
               className="p-4 glass-frosted frame-earthstone"
               glassmorphism={true}
             >
               <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3 font-stats">Efectos</h3>
               <div className="space-y-2">
                 {effect.type && (
                   <div className="flex items-center gap-3">
                     {getEffectIcon(effect.type)}
                     <span className="text-white text-sm font-bold uppercase font-stats">{effect.type}</span>
                   </div>
                 )}
                 {effect.scaling && (
                   <div className="flex items-center gap-2 text-[12px] text-white/60 font-stats">
                     <span className="font-black">Scaling:</span>
                     <span className="uppercase">{effect.scaling}</span>
                   </div>
                 )}
                 {effect.target && (
                   <div className="flex items-center gap-2 text-[12px] text-white/60 font-stats">
                     <span className="font-black">Target:</span>
                     <span className="uppercase">{effect.target.replace('_', ' ')}</span>
                   </div>
                 )}
                 {effect.status && (
                   <div className="flex items-center gap-2 text-[12px] text-white/60 font-stats">
                     <span className="font-black">Status:</span>
                     <span className="uppercase">{effect.status}</span>
                   </div>
                 )}
                 {effect.chance && (
                   <div className="flex items-center gap-2 text-[12px] text-white/60 font-stats">
                     <span className="font-black">Chance:</span>
                     <span>{Math.floor(effect.chance * 100)}%</span>
                   </div>
                 )}
                 {effect.duration && (
                   <div className="flex items-center gap-2 text-[12px] text-white/60 font-stats">
                     <span className="font-black">Duration:</span>
                     <span>{effect.duration} turns</span>
                   </div>
                 )}
               </div>
             </NineSlicePanel>
           )}

           {/* Scaling Info */}
           {scaling && scaling.stat && (
             <NineSlicePanel
               type="border"
               variant="default"
               className="p-4 glass-frosted frame-earthstone"
               glassmorphism={true}
             >
               <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3 font-stats">Scaling</h3>
               <div className="flex items-center gap-3">
                 <Zap size={16} className="text-[#F5C76B]" />
                 <div>
                   <p className="text-white text-sm font-bold uppercase font-stats">{scaling.stat}</p>
                   <p className="text-[10px] text-white/40 font-stats">Multiplier: {scaling.mult}x</p>
                 </div>
               </div>
             </NineSlicePanel>
           )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 z-10">
        <button
          onClick={() => onDiscard(itemId)}
          className="flex-1 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
        >
          Descartar
        </button>
        <button
          onClick={() => onEquip({ id: itemId, item_id: skillId, item_type: 'skill_scroll' })}
          className="flex-2 py-3 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] rounded-2xl text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(245,199,107,0.4)] transition-all"
        >
          Equipar
        </button>
      </div>
    </div>
  );
}
