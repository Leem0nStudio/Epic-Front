'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ShieldCheck, Gift, CheckCircle2, Lock, ArrowRight, Zap } from 'lucide-react';
import { QuestService, QuestEntry } from '@/lib/services/quest-service';
import { ViewShell } from '@/components/ui/ViewShell';

interface QuestLogViewProps {
  playerEnergy: number;
  onNavigate: (view: any) => void;
  onOpenQuest: (stage: any) => void;
}

export function QuestLogView({ onNavigate, onOpenQuest }: QuestLogViewProps) {
  const [quests, setQuests] = useState<QuestEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuests() {
      try {
        const data = await QuestService.getQuestLog();
        setQuests(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadQuests();
  }, []);

  return (
    <ViewShell title="MISIONES" subtitle="Gremio de Aventureros" onBack={() => onNavigate('home')} loading={loading}>
      <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto custom-scrollbar pb-24">
        {quests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/5 rounded-[32px]">
            <BookOpen size={48} className="text-white/10 mb-4" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No hay misiones disponibles</p>
          </div>
        ) : (
          quests.map((quest, idx) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onOpenQuest(quest.stage)}
              className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-[#F5C76B]/30 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shrink-0">
                 <ShieldCheck size={20} className="text-[#F5C76B]" />
              </div>
              <div className="flex-1">
                 <h3 className="text-sm font-black text-white uppercase tracking-tight">{quest.title}</h3>
                 <p className="text-[10px] text-white/40 line-clamp-1">{quest.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-1">
                    <Zap size={10} className="text-blue-400" />
                    <span className="text-[10px] font-black text-white/60">{quest.stage.energy_cost}</span>
                 </div>
                 <ArrowRight size={14} className="text-white/20 group-hover:text-[#F5C76B] transition-colors" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </ViewShell>
  );
}
