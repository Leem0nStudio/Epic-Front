'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { ViewShell } from '@/components/ui/ViewShell';
import { Button } from '@/components/ui/Button';
import { motion } from 'motion/react';

interface CardDetailViewProps {
  cardId: string;
  itemId: string;
  onBack: () => void;
  onEquip: (item: any) => void;
  onDiscard: (itemId: string) => void;
}

export function CardDetailView({ cardId, itemId, onBack, onEquip, onDiscard }: CardDetailViewProps) {
  return (
    <ViewShell title="DETALLES CARTA" subtitle={cardId} onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="flex-1 flex items-center justify-center">
           <motion.div
             initial={{ rotateY: 90, opacity: 0 }}
             animate={{ rotateY: 0, opacity: 1 }}
             className="relative w-64 h-96 rounded-[32px] overflow-hidden border-2 border-[#F5C76B]/40 shadow-2xl shadow-[#F5C76B]/10"
           >
              <img
                src={AssetService.getCardUrl(cardId)}
                className="w-full h-full object-cover"
                alt=""
                onError={(e) => { e.currentTarget.src = AssetService.getCardUrlFallback(cardId); }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-8 left-0 right-0 text-center">
                 <h2 className="text-2xl font-black text-white uppercase font-display tracking-tight">{cardId}</h2>
              </div>
           </motion.div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
           <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#F5C76B]" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">EFECTOS MÍSTICOS</h3>
           </div>
           <p className="text-sm text-white/60 leading-relaxed italic">
             &quot;Esta carta imbuye al portador con el poder de los ancestros, otorgando bonificaciones latentes en combate.&quot;
           </p>
        </div>

        <div className="flex gap-4">
           <Button variant="danger" className="flex-1" onClick={() => onDiscard(itemId)}>DESCARTAR</Button>
           <Button variant="primary" className="flex-[2]" onClick={() => onEquip({ id: itemId, item_id: cardId })}>EQUIPAR CARTA</Button>
        </div>
      </div>
    </ViewShell>
  );
}
