'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, Sword, Zap, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
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
  novice: 'Novato', swordman: 'Espadachín', mage: 'Mago', ranger: 'Cazador',
  archer: 'Arquero', acolyte: 'Acólito', knight: 'Caballero', wizard: 'Brujo', priest: 'Sacerdote',
};

export function CardDetailView({ cardId, itemId, onBack, onEquip, onDiscard }: CardDetailViewProps) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCard() {
      if (!supabase) return;
      const { data } = await supabase.from('cards').select('*').eq('id', cardId).single();
      if (data) setCard(data);
      setLoading(false);
    }
    loadCard();
  }, [cardId]);

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

  const effectValue = card?.effect_value ? (typeof card.effect_value === 'string' ? JSON.parse(card.effect_value) : card.effect_value) : {};
  const applicableJobs = card?.applicable_jobs || [];
  const rarityColor = getRarityColor(card?.rarity);

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
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-stats">Carta</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Card Art - Large display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Card frame */}
            <div 
              className="w-48 h-64 rounded-2xl border-2 p-1 shadow-2xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderColor: `${rarityColor}`,
                boxShadow: `0 0 30px ${rarityColor}40, inset 0 0 20px ${rarityColor}20`
              }}
            >
              {/* Card image */}
              <div className="w-full h-full rounded-xl overflow-hidden bg-black/40">
                <img 
                  src={AssetService.getCardUrl(card?.id || '')} 
                  alt={card?.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = AssetService.getUIUrl('world');
                  }}
                />
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
              {card?.rarity?.toUpperCase() || 'COMMON'}
            </div>
          </div>
        </motion.div>

        {/* Card Name */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg">{card?.name || 'Unknown'}</h2>
        </motion.div>

        {/* Effect Panel - Home style */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <NineSlicePanel type="border" variant="default" className="w-full p-4 glass-frosted frame-earthstone" style={{ borderColor: `${rarityColor}44` }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#F5C76B]" />
              <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] font-stats">Efecto</h3>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Sword size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white font-bold uppercase text-sm font-stats">{card?.effect_type || 'attack'}</p>
                <p className="text-[10px] text-white/50 font-stats">Tipo de efecto</p>
              </div>
            </div>

            {/* Effect stats grid */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {effectValue.power && (
                <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-[9px] text-white/40 font-stats uppercase">Power</p>
                  <p className="text-white font-black text-lg">{effectValue.power}x</p>
                </div>
              )}
              {effectValue.chance && (
                <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-[9px] text-white/40 font-stats uppercase">Chance</p>
                  <p className="text-white font-black text-lg">{Math.floor(effectValue.chance * 100)}%</p>
                </div>
              )}
              {effectValue.duration && (
                <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-[9px] text-white/40 font-stats uppercase">Duración</p>
                  <p className="text-white font-black text-lg">{effectValue.duration}</p>
                </div>
              )}
            </div>
          </NineSlicePanel>
        </motion.div>

        {/* Jobs Compatible */}
        {applicableJobs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <NineSlicePanel type="border" variant="default" className="w-full p-4 glass-frosted frame-earthstone" style={{ borderColor: '#3B82F644' }}>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-blue-400" />
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] font-stats">Jobs</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {applicableJobs.map((job: string, idx: number) => (
                  <div key={idx} className="px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 text-white text-xs font-bold uppercase font-stats">
                    {JOB_NAMES[job] || job}
                  </div>
                ))}
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
        <button onClick={() => onEquip({ id: itemId, item_id: cardId, item_type: 'card' })} className="flex-[2] py-3.5 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] rounded-xl text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(245,199,107,0.4)] transition-all">
          Equipar
        </button>
      </motion.div>
    </div>
  );
}