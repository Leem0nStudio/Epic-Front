'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Zap, Clock, Shield, Sword, Heart, Sparkles, Target, Gauge, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { getRarityCode } from '@/lib/config/assets-config';
import { SkillDefinition } from '@/lib/types/combat';
import { motion } from 'motion/react';

interface SkillDetailViewProps {
  skillId: string;
  itemId: string;
  onBack: () => void;
  onEquip: (item: any) => void;
  onDiscard: (itemId: string) => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F5C76B',
};

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
      case 'damage': return <Sword size={18} className="text-red-400" />;
      case 'heal': return <Heart size={18} className="text-green-400" />;
      case 'buff': return <Shield size={18} className="text-blue-400" />;
      case 'debuff': return <Sparkles size={18} className="text-purple-400" />;
      case 'dot': return <Sparkles size={18} className="text-yellow-400" />;
      default: return <Zap size={18} className="text-[#F5C76B]" />;
    }
  };

  const getEffectLabel = (effectType: string) => {
    switch (effectType) {
      case 'damage': return 'Daño';
      case 'heal': return 'Curación';
      case 'buff': return 'Buff';
      case 'debuff': return 'Debuff';
      case 'dot': return 'DoT';
      default: return effectType;
    }
  };

  const getRarityColor = (rarity: string) => {
    const color = RARITY_COLORS[rarity?.toLowerCase()] || '#9CA3AF';
    return {
      text: color,
      bg: `${color}20`,
      border: `${color}40`,
    };
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
  const rarity = getRarityColor(skill?.rarity);

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <button onClick={onBack} className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all hover:bg-white/5 btn-back">
          <ChevronLeft size={22} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-white tracking-widest uppercase italic font-display">Detalles</h1>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-stats">Habilidad</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto z-10 space-y-4 pb-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6 relative"
        >
          <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl" />
          <RarityIcon
            rarity={getRarityCode(skill?.rarity)}
            size="lg"
            glass={true}
            className="mx-auto relative z-10"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20">
              <Zap size={44} className="text-[#F5C76B] drop-shadow-[0_0_15px_rgba(245,199,107,0.5)]" />
            </div>
          </RarityIcon>
          
          <h2 className="text-2xl font-black text-white mt-4 tracking-wider uppercase drop-shadow-lg">{skill?.name || 'Unknown'}</h2>
          <span 
            className="text-[10px] font-black px-4 py-1.5 rounded-full border mt-3 inline-block uppercase tracking-widest"
            style={{ color: rarity.text, backgroundColor: rarity.bg, borderColor: rarity.border }}
          >
            {skill?.rarity?.toUpperCase() || 'COMMON'}
          </span>
        </motion.div>

        {/* Description */}
        {skill?.description && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted" glassmorphism={true}>
              <div className="flex items-start gap-3">
                <Info size={16} className="text-white/40 mt-0.5 flex-shrink-0" />
                <p className="text-white/70 text-sm leading-relaxed font-stats">{skill.description}</p>
              </div>
            </NineSlicePanel>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <NineSlicePanel type="border" variant="default" className="p-3.5 glass-frosted" glassmorphism={true}>
            <div className="flex items-center gap-2 mb-1.5">
              <Clock size={14} className="text-white/40" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-wider font-stats">Cooldown</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-white font-stats">{skill?.cooldown || 0}</p>
              <span className="text-[10px] text-white/40 font-stats">turns</span>
            </div>
          </NineSlicePanel>

          <NineSlicePanel type="border" variant="default" className="p-3.5 glass-frosted" glassmorphism={true}>
            <div className="flex items-center gap-2 mb-1.5">
              <Gauge size={14} className="text-[#F5C76B]" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-wider font-stats">Potencia</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-white font-stats">{scaling?.mult || effect?.power || 1.0}</p>
              <span className="text-[10px] text-white/40 font-stats">x</span>
            </div>
          </NineSlicePanel>
        </motion.div>

        {/* Effect Section */}
        {effect && Object.keys(effect).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted" glassmorphism={true}>
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-white/40" />
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-stats">Efectos</h3>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  {getEffectIcon(effect.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold uppercase text-sm font-stats">{getEffectLabel(effect.type)}</p>
                  {effect.target && (
                    <p className="text-[10px] text-white/50 font-stats mt-0.5">Objetivo: {effect.target.replace('_', ' ')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                {effect.chance && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Chance</p>
                    <p className="text-white font-black text-sm">{Math.floor(effect.chance * 100)}%</p>
                  </div>
                )}
                {effect.duration && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Duración</p>
                    <p className="text-white font-black text-sm">{effect.duration} turns</p>
                  </div>
                )}
              </div>
            </NineSlicePanel>
          </motion.div>
        )}

        {/* Scaling Section */}
        {scaling && scaling.stat && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted" glassmorphism={true}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-[#F5C76B]" />
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-stats">Escalado</h3>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#F5C76B]/10 to-transparent border border-[#F5C76B]/20">
                <div>
                  <p className="text-white font-bold uppercase text-sm font-stats">{scaling.stat}</p>
                  <p className="text-[10px] text-white/50 font-stats mt-0.5">Stat base</p>
                </div>
                <div className="text-right">
                  <p className="text-[#F5C76B] font-black text-xl">×{scaling.mult}</p>
                  <p className="text-[10px] text-white/40 font-stats">multiplier</p>
                </div>
              </div>
            </NineSlicePanel>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 pt-2 z-10"
      >
        <button
          onClick={() => onDiscard(itemId)}
          className="flex-1 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all hover:scale-[1.02]"
        >
          Descartar
        </button>
        <button
          onClick={() => onEquip({ id: itemId, item_id: skillId, item_type: 'skill_scroll' })}
          className="flex-[2] py-3.5 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] rounded-2xl text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(245,199,107,0.4)] transition-all hover:scale-[1.02]"
        >
          Equipar
        </button>
      </motion.div>
    </div>
  );
}