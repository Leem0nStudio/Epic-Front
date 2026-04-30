'use client';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Button } from '@/components/ui/Button';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, UserPlus, Clock, Star, Sword, Heart, Zap, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { RecruitmentService } from '@/lib/services/recruitment-service';
import { useToast } from '@/lib/contexts/ToastContext';

interface TavernViewProps {
  saveData: any;
  onNavigate: (view: any) => void;
  onClaim: (slotId: string) => void;
  onDiscard: (slotId: string) => void;
}

export function TavernView({ saveData, onNavigate, onClaim }: TavernViewProps) {
  const { confirm } = useToast();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
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

  const currentTime = now || Date.now();

  const bgUrl = AssetService.getBgUrl('tavern');

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden relative">
      {bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-black/50 to-black/80 pointer-events-none" />
      
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="particle-magic absolute w-1 h-1 bg-amber-400/60 rounded-full"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${3 + i * 0.5}s`
          }}
        />
      ))}

      <div className="flex items-center gap-4 mb-6 z-10">
        <button onClick={() => onNavigate('home')} className="btn-back">
          <ChevronLeft size={20} />
        </button>
        <h1 className="view-title">Gremio de Reclutamiento</h1>
      </div>

       <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar z-10">
         {saveData.tavernSlots.map((slot: any) => {
           const unit = slot.unit_data;
           const availableAt = new Date(slot.available_at).getTime();
           const isReady = currentTime >= availableAt;
           const timeLeft = Math.max(0, Math.floor((availableAt - currentTime) / 1000));

           const hours = Math.floor(timeLeft / 3600);
           const mins = Math.floor((timeLeft % 3600) / 60);
           const secs = timeLeft % 60;

           return (
<NineSlicePanel
                key={slot.id}
                type="border"
                variant="default"
                className={`glass-frosted frame-earthstone p-5 relative overflow-hidden transition-all ${isReady ? 'hover:border-[#F5C76B]/60' : 'opacity-60'}`}
                as={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
               {!isReady && (
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20">
                   <Clock size={32} className="text-white/40" />
                   <p className="text-sm font-black text-white/60 tracking-widest font-mono">
                     {hours.toString().padStart(2, '0')}:{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                   </p>
                 </div>
               )}

                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-black/60 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={AssetService.getSpriteUrl(unit.spriteId)}
                      alt="Unit Sprite"
                      className="w-[180%] transform translate-y-3"
                      fallbackSrc={AssetService.getSpriteUrl('novice_idle.png')}
                    />
                  </div>

                 <div className="flex-1 flex flex-col justify-center">
<div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                          <h3 className="font-display text-white text-lg">{unit.name}</h3>
                          <div className="flex items-center gap-1 bg-[#F5C76B]/10 px-1.5 py-0.5 rounded border border-[#F5C76B]/20">
                            <img src={AssetService.getIconUrl(unit.iconId)} className="w-3 h-3 object-contain" />
                            <span className="text-[10px] font-bold text-[#F5C76B] italic">NOVICE</span>
                          </div>
                      </div>
                     {isReady && (
                         <button onClick={() => handleDiscard(slot.id)} className="text-white/20 hover:text-red-400 transition-colors">
                             <Trash2 size={16} />
                         </button>
                     )}
                   </div>

<div className="flex gap-4 mt-2 font-stats">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-white/40 uppercase tracking-tighter">Afinidad</span>
                        <span className="text-[10px] text-white uppercase">{unit.affinity}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-white/40 uppercase tracking-tighter">Ataque</span>
                        <span className="text-[10px] text-[#F5C76B]"><Sword size={10} className="inline mr-1" />{unit.baseStats.atk}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-white/40 uppercase tracking-tighter">HP</span>
                        <span className="text-[10px] text-red-400"><Heart size={10} className="inline mr-1" />{unit.baseStats.hp}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-white/40 uppercase tracking-tighter">Velocidad</span>
                        <span className="text-[10px] text-cyan-400"><Zap size={10} className="inline mr-1" />{unit.baseStats.spd}</span>
                      </div>
                    </div>
                 </div>

                 {isReady && (
                    <div className="flex items-center">
                      <Button
                        onClick={() => onClaim(slot.id)}
                        variant="action"
                        size="game"
                      >
                        Reclutar
                      </Button>
                    </div>
                  )}
               </div>
             </NineSlicePanel>
           );
         })}

{saveData.tavernSlots.length === 0 && (
          <div className="glass-crystal frame-earthstone flex-1 flex flex-col items-center justify-center py-20 text-center gap-4">
              <UserPlus size={48} className="text-white/40" />
              <p className="font-stats text-white/60">No hay candidatos esperando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
