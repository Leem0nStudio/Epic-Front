'use client';

import React, { useState } from 'react';
import { Coins, Diamond, Zap, Gift, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/ui/Modal';
import type { ViewType, PlayerProfile } from '@/lib/types/game-types';

interface GlobalHeaderProps {
  profile: PlayerProfile | null;
  onNavigate: (view: ViewType) => void;
  onRefillComplete?: () => void;
}

export function GlobalHeader({ profile, onNavigate, onRefillComplete }: GlobalHeaderProps) {
  const [refillCost, setRefillCost] = useState<number | null>(null);
  const [showRefillConfirm, setShowRefillConfirm] = useState(false);

  if (!profile) return null;

  const handleRefillClick = () => {
    const estimatedCost = 50;
    setRefillCost(estimatedCost);
    setShowRefillConfirm(true);
  };

  const handleConfirmRefill = async () => {
    try {
      const { error } = await supabase.rpc('rpc_refill_energy_with_gems');
      if (error) throw error;
      setShowRefillConfirm(false);
      onRefillComplete?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al restaurar energía';
      alert(msg);
    }
  };

  const isEnergyFull = (profile.energy || 0) >= (profile.max_energy || 100);

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between z-50 bg-gradient-to-b from-[#0B1A2A] to-transparent pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="relative group cursor-pointer" onClick={() => onNavigate('profile')}>
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C76B] to-amber-700 p-[1px]">
              <div className="w-full h-full rounded-xl bg-[#0B1A2A] flex items-center justify-center overflow-hidden">
                 <img src="/assets/ui/ui_icon_novice_64.png" className="w-8 h-8 object-contain" alt="Avatar"
                      onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jules'; }} />
              </div>
           </div>
           <div className="absolute -bottom-1 -right-1 bg-[#F5C76B] text-[#0B1A2A] text-[8px] font-black px-1 rounded-sm border border-[#0B1A2A]">
              LV.{profile.level || 1}
           </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 pointer-events-auto">
        <div className="relative">
          <ResourceItem icon={Zap} value={profile.energy || 0} maxValue={profile.max_energy || 100} color="text-blue-400" />
          {!isEnergyFull && (
            <button
              onClick={handleRefillClick}
              className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors border border-[#0B1A2A]"
            >
              <Plus size={10} className="text-white" />
            </button>
          )}
        </div>
        <ResourceItem icon={Coins} value={profile.currency || 0} color="text-[#F5C76B]" />
        <ResourceItem icon={Diamond} value={profile.premium_currency || 0} color="text-cyan-400" />

        <button
          onClick={() => onNavigate('daily_rewards')}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
        >
          <Gift size={18} className="text-[#F5C76B]" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0B1A2A]" />
        </button>
      </div>

      <Modal
        isOpen={showRefillConfirm}
        onClose={() => setShowRefillConfirm(false)}
        title="Restaurar Energía"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-white/60 mb-4">
            Tu energía se restaurará al máximo. El costo se calcula según tus refills diarios.
          </p>
          <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-xl p-3">
            <Diamond size={16} className="text-cyan-400" />
            <span className="text-sm font-black text-white">~{refillCost} CRISTALES</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRefillConfirm(false)}
              className="flex-1 py-2 rounded-xl bg-white/10 text-white/60 text-sm font-black uppercase"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmRefill}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-black uppercase"
            >
              Restaurar
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}

function ResourceItem({ icon: Icon, value, maxValue, color }: any) {
  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl">
      <Icon size={14} className={color} />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[11px] font-black text-white tabular-nums">
          {value.toLocaleString()}
          {maxValue && <span className="text-white/30 text-[9px] ml-0.5">/{maxValue}</span>}
        </span>
      </div>
    </div>
  );
}
