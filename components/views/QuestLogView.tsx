'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, BookOpen, ShieldCheck, Gift, CheckCircle2, Lock, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { QuestService, QuestEntry } from '@/lib/services/quest-service';
import { Stage } from '@/lib/rpg-system/campaign-types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface QuestLogViewProps {
  playerEnergy: number;
  onNavigate: (view: any) => void;
  onOpenQuest: (stage: Stage) => void;
}

export function QuestLogView({ playerEnergy, onNavigate, onOpenQuest }: QuestLogViewProps) {
  const [quests, setQuests] = useState<QuestEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuests() {
      const log = await QuestService.getQuestLog();
      setQuests(log);
      setLoading(false);
    }
    loadQuests();
  }, []);

  const activeCount = quests.filter(q => q.status === 'active').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#020508]">
        <LoadingSpinner text="Cargando registro..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10">
        <button onClick={() => onNavigate('home')} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="text-center">
          <p className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em]">Quest Log</p>
          <span className="text-[9px] text-white/30 uppercase tracking-wider">Registra tus incursiones</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <BookOpen size={14} className="text-[#F5C76B]" />
          <span className="text-[10px] font-black text-white uppercase tracking-wider">{activeCount} activas</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <NineSlicePanel type="border" variant="default" className="p-5 border-white/10 bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] text-[#F5C76B] font-black uppercase tracking-[0.4em] mb-2">Misión Sugerida</p>
              <h1 className="text-2xl font-black text-white tracking-widest">Registra tus misiones actuales</h1>
              <p className="mt-3 text-[10px] text-white/40 leading-relaxed max-w-xl">Consulta objetivos, recompensas y estado de cada misión. Selecciona una para abrir sus detalles y avanzar en tu aventura.</p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-[#F5C76B]/10 border border-[#F5C76B]/20 flex items-center justify-center">
              <BookOpen size={28} className="text-[#F5C76B]" />
            </div>
          </div>
        </NineSlicePanel>

        <div className="grid gap-4">
          {quests.map((quest, index) => (
            <motion.div key={quest.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <NineSlicePanel type="panel" variant="default" className={`p-5 border ${quest.status === 'locked' ? 'border-white/10 bg-white/5 opacity-60' : 'border-[#F5C76B]/20 bg-[#09131D]'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {quest.status === 'locked' ? <Lock size={14} className="text-white/40" /> : quest.status === 'completed' ? <CheckCircle2 size={14} className="text-[#34D399]" /> : <ShieldCheck size={14} className="text-[#F5C76B]" />}
                      <span className="text-[9px] uppercase tracking-[0.4em] text-white/50">{quest.chapter}</span>
                    </div>
                    <h2 className="text-lg text-white font-black tracking-wider">{quest.title}</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-2">{quest.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${quest.status === 'active' ? 'text-[#F5C76B]' : quest.status === 'completed' ? 'text-[#34D399]' : 'text-white/30'}`}>{quest.status.toUpperCase()}</span>
                    <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-white/80 uppercase tracking-[0.3em]">
                      <Zap size={14} className="text-[#F5C76B]" />
                      <span>{quest.energy_cost}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/20 border border-white/5 rounded-3xl p-4 space-y-3">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-[0.4em]">Objetivos</p>
                    <div className="space-y-2">
                      {quest.objectives.map(obj => (
                        <div key={obj.id} className="flex items-center gap-2 text-[10px] text-white/80">
                          <span className={`w-2 h-2 rounded-full ${obj.completed ? 'bg-[#34D399]' : 'bg-white/30'}`} />
                          <span>{obj.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-3xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white/40 tracking-[0.4em] mb-2">
                      <Gift size={12} className="text-[#F5C76B]" />
                      Recompensas
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <RewardChip label="Oro" value={quest.rewards.currency} />
                      <RewardChip label="EXP" value={quest.rewards.exp} />
                      {quest.rewards.premium_currency ? <RewardChip label="Gemas" value={quest.rewards.premium_currency} /> : null}
                      {quest.rewards.materials?.map((mat, i) => (
                        <RewardChip key={i} label={mat.itemId} value={mat.amount} small />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Misión actual</div>
                  <Button
                    onClick={() => onOpenQuest(quest.stage)}
                    disabled={quest.status !== 'active'}
                    variant={quest.status === 'active' ? 'primary' : 'secondary'}
                    size="sm"
                    className="min-w-[160px]"
                  >
                    {quest.status === 'completed' ? 'Completada' : quest.status === 'locked' ? 'Bloqueada' : 'Ir a misión'}
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </NineSlicePanel>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-[#0B1A2A] border-t border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/40">
          <span>Page</span>
          <span className="font-black text-white">1/3</span>
        </div>
        <Button onClick={() => onNavigate('home')} variant="secondary" size="sm">Volver al inicio</Button>
      </div>
    </div>
  );
}

function RewardChip({ label, value, small }: { label: string; value: number; small?: boolean }) {
  return (
    <div className={`px-3 ${small ? 'py-1' : 'py-1.5'} border border-white/10 rounded-full bg-white/5 text-[10px] text-white/80 flex items-center gap-2`}> 
      <span className="font-black uppercase tracking-[0.3em] text-[#F5C76B]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
