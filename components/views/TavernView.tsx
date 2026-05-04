'use client';
import { AssetService } from '@/lib/services/asset-service';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/lib/stores/game-store';

import React, { useState, useEffect } from 'react';
import { UserPlus, Clock, Star, Sword, Heart, Zap, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { RecruitmentService } from '@/lib/services/recruitment-service';
import { useToast } from '@/lib/contexts/ToastContext';

interface TavernViewProps {
  onClaim: (slotId: string) => void;
}

export function TavernView({ onClaim }: TavernViewProps) {
  const { confirm } = useToast();
  const tavernSlots = useGameStore(state => state.tavernSlots);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDiscard = async (slotId: string) => {
    const confirmed = await confirm("¿Deseas descartar este recluta? Se generará uno nuevo en el siguiente ciclo.");
    if (!confirmed) return;
    try {
        await RecruitmentService.discardRecruit(slotId);
        window.location.reload();
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="mb-8">
         <h1 className="text-3xl font-black text-white uppercase font-display tracking-tight leading-none">TABERNA</h1>
         <p className="text-[11px] text-[#F5C76B] font-black uppercase tracking-[0.3em] mt-2 opacity-80">Mercenarios Disponibles</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {tavernSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/5 rounded-[32px]">
            <UserPlus size={48} className="text-white/10 mb-4" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No hay aventureros buscando grupo</p>
          </div>
        ) : (
          tavernSlots.map((slot: any) => (
            <RecruitCard
              key={slot.id}
              slot={slot}
              now={now}
              onClaim={onClaim}
              onDiscard={handleDiscard}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RecruitCard({ slot, now, onClaim, onDiscard }: any) {
  const unit = slot.unit_data;
  const availableAt = new Date(slot.available_at).getTime();
  const isReady = now >= availableAt;
  const timeLeft = Math.max(0, Math.floor((availableAt - now) / 1000));

  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-4 flex gap-4 overflow-hidden group transition-all ${!isReady ? 'opacity-60' : 'hover:border-[#F5C76B]/30 hover:bg-black/60'}`}
    >
      <div className="absolute top-0 right-0 p-8 bg-[#F5C76B]/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

      <div className="w-24 h-28 bg-gradient-to-b from-white/10 to-transparent rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
        <ImageWithFallback
          src={AssetService.getSpriteUrl(unit.spriteId)}
          alt="Unit"
          className="w-[180%] object-contain transform translate-y-4 pixel-art group-hover:scale-110 transition-transform duration-500"
          fallbackSrc={AssetService.getSpriteUrl('novice_idle.png')}
        />
        {isReady && (
          <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white uppercase font-display leading-none">{unit.name}</h3>
            <span className="text-[9px] font-black text-[#F5C76B] uppercase tracking-widest bg-[#F5C76B]/10 px-1.5 py-0.5 rounded-sm mt-1 inline-block border border-[#F5C76B]/20">
              {unit.affinity}
            </span>
          </div>
          {isReady && (
            <button onClick={() => onDiscard(slot.id)} className="text-white/20 hover:text-red-500 transition-colors p-2">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <StatMini label="ATK" value={unit.baseStats.atk} icon={Sword} color="text-red-400" />
          <StatMini label="HP" value={unit.baseStats.hp} icon={Heart} color="text-green-400" />
          <StatMini label="SPD" value={unit.baseStats.spd} icon={Zap} color="text-cyan-400" />
        </div>
      </div>

      <div className="flex items-center">
        {isReady ? (
          <Button
            onClick={() => onClaim(slot.id)}
            variant="primary"
            size="sm"
            className="rounded-xl h-20 w-16 !p-0 flex flex-col items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            <span className="text-[8px] font-black">RECLUTAR</span>
          </Button>
        ) : (
          <div className="bg-white/5 border border-white/5 rounded-xl h-20 w-16 flex flex-col items-center justify-center gap-1">
            <Clock size={16} className="text-white/20" />
            <span className="text-[8px] font-black text-white/40 tabular-nums">
              {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatMini({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
         <Icon size={10} className={color} />
         <span className="text-[10px] font-black text-white/80 tabular-nums">{value}</span>
      </div>
    </div>
  );
}
