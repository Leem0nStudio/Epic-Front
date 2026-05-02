'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, Shield, Sword, Heart, Zap, Users, Info, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { getRarityCode } from '@/lib/config/assets-config';
import { motion } from 'motion/react';

interface CardDetailViewProps {
  cardId: string;
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

const JOB_NAMES: Record<string, string> = {
  novice: 'Novato',
  swordman: 'Espadachín',
  mage: 'Mago',
  ranger: 'Cazador',
  archer: 'Arquero',
  acolyte: 'Acólito',
  knight: 'Caballero',
  wizard: 'Brujo',
  priest: 'Sacerdote',
};

export function CardDetailView({ cardId, itemId, onBack, onEquip, onDiscard }: CardDetailViewProps) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCard() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();
      
      if (!error && data) {
        setCard(data);
      }
      setLoading(false);
    }
    loadCard();
  }, [cardId]);

  const getEffectTypeIcon = (effectType: string) => {
    switch (effectType) {
      case 'damage': return <Sword size={18} className="text-red-400" />;
      case 'heal': return <Heart size={18} className="text-green-400" />;
      case 'buff': return <Shield size={18} className="text-blue-400" />;
      case 'debuff': return <Sparkles size={18} className="text-purple-400" />;
      case 'passive': return <Sparkles size={18} className="text-yellow-400" />;
      default: return <Zap size={18} className="text-[#F5C76B]" />;
    }
  };

  const getEffectTypeLabel = (effectType: string) => {
    switch (effectType) {
      case 'damage': return 'Daño';
      case 'heal': return 'Curación';
      case 'buff': return 'Buff';
      case 'debuff': return 'Debuff';
      case 'passive': return 'Pasiva';
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

  const effectValue = card?.effect_value ? (typeof card.effect_value === 'string' ? JSON.parse(card.effect_value) : card.effect_value) : {};
  const applicableJobs = card?.applicable_jobs || [];
  const rarity = getRarityColor(card?.rarity);

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <button onClick={onBack} className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all hover:bg-white/5 btn-back">
          <ChevronLeft size={22} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-white tracking-widest uppercase italic font-display">Detalles</h1>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-stats">Carta</span>
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
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl" />
          
          {/* Card Visual */}
          <div className="relative z-10 mx-auto w-32">
            <RarityIcon
              rarity={getRarityCode(card?.rarity)}
              size="lg"
              glass={true}
            >
              <div className="w-28 h-40 flex flex-col items-center justify-center bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 p-2">
                <Sparkles size={32} className="text-purple-400 mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <div className="w-full h-px bg-white/10 mb-2" />
                <div className="text-[8px] text-white/30 uppercase tracking-wider">Carta</div>
              </div>
            </RarityIcon>
          </div>
          
          <h2 className="text-2xl font-black text-white mt-4 tracking-wider uppercase drop-shadow-lg">{card?.name || 'Unknown'}</h2>
          <span 
            className="text-[10px] font-black px-4 py-1.5 rounded-full border mt-3 inline-block uppercase tracking-widest"
            style={{ color: rarity.text, backgroundColor: rarity.bg, borderColor: rarity.border }}
          >
            {card?.rarity?.toUpperCase() || 'COMMON'}
          </span>
        </motion.div>

        {/* Effect Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted" glassmorphism={true}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-purple-400" />
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-stats">Efecto</h3>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                {getEffectTypeIcon(card?.effect_type)}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold uppercase text-sm font-stats">{getEffectTypeLabel(card?.effect_type)}</p>
                {effectValue.power && (
                  <p className="text-[10px] text-white/50 font-stats mt-0.5">Potencia: {effectValue.power}x</p>
                )}
              </div>
            </div>

            {/* Effect Stats */}
            {effectValue && Object.keys(effectValue).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {effectValue.power && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Power</p>
                    <p className="text-white font-black text-lg">{effectValue.power}x</p>
                  </div>
                )}
                {effectValue.duration && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Duración</p>
                    <p className="text-white font-black text-lg">{effectValue.duration}</p>
                  </div>
                )}
                {effectValue.chance && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Chance</p>
                    <p className="text-white font-black text-lg">{Math.floor(effectValue.chance * 100)}%</p>
                  </div>
                )}
                {effectValue.stack && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-white/40 font-stats uppercase">Stacks</p>
                    <p className="text-white font-black text-lg">{effectValue.stack}</p>
                  </div>
                )}
              </div>
            )}
          </NineSlicePanel>
        </motion.div>

        {/* Applicable Jobs */}
        {applicableJobs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted" glassmorphism={true}>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-white/40" />
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-stats">Jobs Compatibles</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {applicableJobs.map((job: string, idx: number) => (
                  <div 
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold uppercase font-stats"
                  >
                    {JOB_NAMES[job] || job}
                  </div>
                ))}
              </div>
            </NineSlicePanel>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 pt-2 z-10"
      >
        <button
          onClick={() => onDiscard(itemId)}
          className="flex-1 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all hover:scale-[1.02]"
        >
          Descartar
        </button>
        <button
          onClick={() => onEquip({ id: itemId, item_id: cardId, item_type: 'card' })}
          className="flex-[2] py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02]"
        >
          Equipar
        </button>
      </motion.div>
    </div>
  );
}