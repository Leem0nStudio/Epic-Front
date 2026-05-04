'use client';
import React from 'react';
import { Zap, Sparkles, Sword } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Button } from '@/components/ui/Button';
import { motion } from 'motion/react';

interface SkillDetailViewProps {
  skillId: string;
  itemId: string;
  onBack: () => void;
  onEquip: (item: any) => void;
  onDiscard: (itemId: string) => void;
}

export function SkillDetailView({ skillId, itemId, onBack, onEquip, onDiscard }: SkillDetailViewProps) {
  return (
    <ViewShell title="HABILIDAD" subtitle={skillId} onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="flex-1 flex items-center justify-center">
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-48 h-48 rounded-[48px] bg-gradient-to-br from-[#F5C76B]/20 to-transparent border border-[#F5C76B]/40 flex items-center justify-center shadow-2xl shadow-[#F5C76B]/5"
           >
              <Zap size={80} className="text-[#F5C76B] drop-shadow-[0_0_20px_#F5C76B]" />
           </motion.div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
           <div className="flex items-center gap-2 text-[#F5C76B]">
              <Sparkles size={16} />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">DESCRIPCIÓN TÉCNICA</h3>
           </div>
           <p className="text-sm text-white/60 leading-relaxed italic">
             &quot;Un pergamino antiguo que contiene el conocimiento arcano necesario para desatar una técnica devastadora.&quot;
           </p>
           <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2">
                 <Zap size={14} className="text-blue-400" />
                 <span className="text-[10px] font-black text-white/40">MANA: 15</span>
              </div>
              <div className="flex items-center gap-2">
                 <Sword size={14} className="text-red-400" />
                 <span className="text-[10px] font-black text-white/40">DMG: 120%</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <Button variant="danger" className="flex-1" onClick={() => onDiscard(itemId)}>DESCARTAR</Button>
           <Button variant="primary" className="flex-[2]" onClick={() => onEquip({ id: itemId, item_id: skillId })}>APRENDER HABILIDAD</Button>
        </div>
      </div>
    </ViewShell>
  );
}
