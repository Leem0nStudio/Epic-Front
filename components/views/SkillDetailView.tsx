'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Zap, Clock, Sword, Heart, Shield, Sparkles, Target, Gauge } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
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

const EFFECT_ICONS: Record<string, React.ReactNode> = {
  damage: <Sword size={24} className="text-red-400" />,
  heal: <Heart size={24} className="text-green-400" />,
  buff: <Shield size={24} className="text-blue-400" />,
  debuff: <Sparkles size={24} className="text-purple-400" />,
  dot: <Sparkles size={24} className="text-yellow-400" />,
};

const EFFECT_LABELS: Record<string, string> = {
  damage: 'Daño', heal: 'Curación', buff: 'Buff', debuff: 'Debuff', dot: 'DoT',
};

export function SkillDetailView({ skillId, itemId, onBack, onEquip, onDiscard }: SkillDetailViewProps) {
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkill() {
      if (!supabase) return;
      const { data } = await supabase.from('skills').select('*').eq('id', skillId).single();
      if (data) setSkill(data);
      setLoading(false);
    }
    loadSkill();
  }, [skillId]);

  const getRarityColor = (rarity: string) => RARITY_COLORS[rarity?.toLowerCase()] || '#9CA3AF';

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#0B1A2A] p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const effect = skill?.effect ? (typeof skill.effect === 'string' ? JSON.parse(skill.effect) : skill.effect) : {};
  const scaling = skill?.scaling ? (typeof skill.scaling === 'string' ? JSON.parse(skill.scaling) : skill.scaling) : {};
  const rarityColor = getRarityColor(skill?.rarity);

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-[#0B1A2A]/90" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button onClick={onBack} className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-white tracking-widest uppercase font-display">Detalles</h1>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-stats">Habilidad</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Skill Icon - Large display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Skill frame */}
            <div 
              className="w-28 h-28 rounded-2xl border-2 p-1 shadow-2xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderColor: rarityColor,
                boxShadow: `0 0 30px ${rarityColor}40`
              }}
            >
              <div className="w-full h-full rounded-xl bg-black/40 flex items-center justify-center">
                <Zap size={48} className="text-[#F5C76B] drop-shadow-[0_0_15px_rgba(245,199,107,0.5)]" />
              </div>
            </div>
            
            {/* Rarity badge */}
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest"
              style={{ 
                backgroundColor: `${rarityColor}20`, 
                borderColor: rarityColor, 
                color: rarityColor 
              }}
            >
              {skill?.rarity?.toUpperCase() || 'COMMON'}
            </div>
          </div>
        </motion.div>

        {/* Skill Name */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg">{skill?.name || 'Unknown'}</h2>
        </motion.div>

        {/* Description */}
        {skill?.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <NineSlicePanel type="border" variant="default" className="w-full p-4 glass-frosted frame-earthstone">
              <p className="text-white/70 text-sm leading-relaxed font-stats text-center">{skill.description}</p>
            </NineSlicePanel>
          </motion.div>
        )}

        {/* Stats Grid - Home style */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-3">
          <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted frame-earthstone" style={{ borderColor: '#F5C76B44' }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-white/40" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-wider font-stats">Cooldown</span>
            </div>
            <p className="text-3xl font-black text-white font-stats">{skill?.cooldown || 0}</p>
          </NineSlicePanel>

          <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted frame-earthstone" style={{ borderColor: '#F5C76B44' }}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge size={16} className="text-[#F5C76B]" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-wider font-stats">Power</span>
            </div>
            <p className="text-3xl font-black text-white font-stats">{scaling?.mult || effect?.power || 1.0}x</p>
          </NineSlicePanel>
        </motion.div>

        {/* Effect Panel */}
        {effect && Object.keys(effect).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <NineSlicePanel type="border" variant="default" className="w-full p-4 glass-frosted frame-earthstone" style={{ borderColor: `${rarityColor}44` }}>
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} className="text-white/40" />
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] font-stats">Efectos</h3>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  {EFFECT_ICONS[effect.type] || <Zap size={24} className="text-[#F5C76B]" />}
                </div>
                <div>
                  <p className="text-white font-bold uppercase text-sm font-stats">{EFFECT_LABELS[effect.type] || effect.type}</p>
                  {effect.target && <p className="text-[10px] text-white/50 font-stats">Objetivo: {effect.target.replace('_', ' ')}</p>}
                </div>
              </div>

              {/* Effect stats */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {effect.chance && (
                  <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Chance</p>
                    <p className="text-white font-black text-lg">{Math.floor(effect.chance * 100)}%</p>
                  </div>
                )}
                {effect.duration && (
                  <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Duración</p>
                    <p className="text-white font-black text-lg">{effect.duration} turns</p>
                  </div>
                )}
              </div>
            </NineSlicePanel>
          </motion.div>
        )}

        {/* Scaling Panel */}
        {scaling && scaling.stat && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <NineSlicePanel type="border" variant="default" className="w-full p-4 glass-frosted frame-earthstone" style={{ borderColor: '#F5C76B44' }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-[#F5C76B]" />
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] font-stats">Escalado</h3>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#F5C76B]/10 to-transparent border border-[#F5C76B]/20">
                <div>
                  <p className="text-white font-bold uppercase text-sm font-stats">{scaling.stat}</p>
                  <p className="text-[10px] text-white/50 font-stats mt-0.5">Stat base</p>
                </div>
                <div className="text-right">
                  <p className="text-[#F5C76B] font-black text-2xl">×{scaling.mult}</p>
                  <p className="text-[10px] text-white/40 font-stats">multiplier</p>
                </div>
              </div>
            </NineSlicePanel>
          </motion.div>
        )}
      </div>

      {/* Actions - Bottom fixed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex gap-3 p-4 bg-gradient-to-t from-[#0B1A2A] to-transparent"
      >
        <button onClick={() => onDiscard(itemId)} className="flex-1 py-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
          Descartar
        </button>
        <button onClick={() => onEquip({ id: itemId, item_id: skillId, item_type: 'skill_scroll' })} className="flex-[2] py-3.5 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] rounded-xl text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(245,199,107,0.4)] transition-all">
          Equipar
        </button>
      </motion.div>
    </div>
  );
}