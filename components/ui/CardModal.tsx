'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, Shield, Heart } from 'lucide-react';
import { Button } from './Button';
import { RarityIcon } from './RarityIcon';
import { NineSlicePanel } from './NineSlicePanel';

interface CardModalProps {
  card: any;
  onClose: () => void;
  onEquip?: (card: any) => void;
  isEquipped?: boolean;
}

export function CardModal({ card, onClose, onEquip, isEquipped }: CardModalProps) {
  if (!card) return null;

  const rarityColors: Record<string, string> = {
    'C': 'from-slate-400 to-slate-600',
    'UC': 'from-green-400 to-green-600',
    'R': 'from-blue-400 to-blue-600',
    'SR': 'from-purple-400 to-purple-600',
    'SSR': 'from-orange-400 to-orange-600',
    'UR': 'from-red-400 to-red-600',
  };

  const glowColors: Record<string, string> = {
    'C': 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
    'UC': 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    'R': 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
    'SR': 'shadow-[0_0_20px_rgba(192,132,252,0.3)]',
    'SSR': 'shadow-[0_0_20px_rgba(251,146,60,0.3)]',
    'UR': 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
  };

  const rarity = card.def?.rarity || card.rarity || 'C';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-[#0B1A2A] border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b ${rarityColors[rarity]} opacity-10 blur-[80px]`} />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[url('/ui/grid-pattern.png')] opacity-5" />
          </div>

          <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 ${glowColors[rarity]}`}>
                  <Sparkles className="text-[#F5C76B]" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-wider leading-none">
                    Detalles de Carta
                  </h2>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1 block">
                    Memory Fragment
                  </span>
                </div>
              </div>
              <Button onClick={onClose} variant="secondary" size="sm" className="!rounded-full w-10 h-10 p-0 border-white/10">
                <X size={20} />
              </Button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
              {/* Card Visual */}
              <div className="relative aspect-[3/4] w-full max-w-[280px] mx-auto mb-8 rounded-[2rem] overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[rarity]} opacity-20`} />
                
                {/* Placeholder/Art */}
                <div className="absolute inset-2 rounded-[1.5rem] bg-black/40 backdrop-blur-md border border-white/5 flex flex-col items-center justify-center text-center p-6 overflow-hidden">
                  {card.artUrl ? (
                    <img src={card.artUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                       <Sparkles size={64} className="text-white" />
                       <span className="font-black text-sm uppercase tracking-widest text-white">Visual Artifact</span>
                    </div>
                  )}
                  
                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-xl font-black text-white uppercase italic truncate drop-shadow-lg">
                      {card.def?.name || card.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white uppercase`}>
                        {rarity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Animated Borders */}
                <div className="absolute inset-0 border-2 border-[#F5C76B]/20 rounded-[2rem] pointer-events-none group-hover:border-[#F5C76B]/40 transition-colors" />
              </div>

              {/* Stats & Description */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <StatItem icon={<Heart size={14} />} label="HP" value={card.def?.passiveBonus?.hp || 0} color="text-red-400" />
                  <StatItem icon={<Zap size={14} />} label="ATK" value={card.def?.passiveBonus?.atk || 0} color="text-yellow-400" />
                  <StatItem icon={<Shield size={14} />} label="DEF" value={card.def?.passiveBonus?.def || 0} color="text-blue-400" />
                  <StatItem icon={<Sparkles size={14} />} label="REC" value={card.def?.passiveBonus?.rec || 0} color="text-purple-400" />
                </div>

                <NineSlicePanel type="border" className="p-5 glass-frosted rounded-[1.5rem]">
                  <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Efecto Pasivo</h4>
                  <p className="text-sm text-white/80 leading-relaxed italic font-medium">
                    {card.def?.description || 'Esta carta otorga bonificaciones místicas a su portador una vez equipada.'}
                  </p>
                </NineSlicePanel>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-black/20 backdrop-blur-xl border-t border-white/5 flex gap-4">
              <Button onClick={onClose} variant="secondary" className="flex-1 !rounded-2xl py-6 font-black uppercase tracking-widest text-xs border-white/10">
                Cerrar
              </Button>
              {onEquip && (
                <Button 
                  onClick={() => onEquip(card)} 
                  variant="primary" 
                  className="flex-1 !rounded-2xl py-6 font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(245,199,107,0.2)]"
                >
                  {isEquipped ? 'Desequipar' : 'Equipar Carta'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatItem({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
      <div className={`${color} opacity-80`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-sm font-black text-white leading-none">+{value}</span>
      </div>
    </div>
  );
}
