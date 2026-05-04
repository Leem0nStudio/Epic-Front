'use client'; 

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Map as MapIcon,
  Star,
  Lock,
  Zap,
  ChevronRight,
  Sword,
  Shield
} from 'lucide-react';
import { CampaignService } from '@/lib/services/campaign-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { Chapter, Stage, PlayerStageProgress } from '@/lib/rpg-system/campaign-types';
import { Button } from '@/components/ui/Button';
import { ViewShell } from '@/components/ui/ViewShell';

interface CampaignMapViewProps {
  playerEnergy: number;
  onNavigate: (view: any) => void;
  onSelectStage: (stage: Stage) => void;
}

export function CampaignMapView({ playerEnergy, onNavigate, onSelectStage }: CampaignMapViewProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [progress, setProgress] = useState<PlayerStageProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [chaptersData, progressData] = await Promise.all([
          CampaignService.getChapters(),
          CampaignService.getPlayerProgress()
        ]);
        setChapters(chaptersData);
        setProgress(progressData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentChapter = chapters[currentChapterIndex];

  return (
    <ViewShell
      title="CAMPAÑA"
      subtitle={currentChapter?.name || "Mapa de Regiones"}
      onBack={() => onNavigate('home')}
      loading={loading}
      background="campaign"
    >
      <div className="flex-1 flex flex-col p-6 h-full">
        {/* Chapter Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
            disabled={currentChapterIndex === 0}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-white/10"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.4em]">CAPÍTULO {currentChapter?.id || 1}</span>
            <h2 className="text-xl font-black text-white uppercase font-display tracking-tight">{currentChapter?.name}</h2>
          </div>

          <button
            onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
            disabled={currentChapterIndex === chapters.length - 1}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-white/10"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* Stages Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-20">
          {currentChapter?.stages.map((stage, idx) => {
            const stageProgress = progress.find(p => p.stage_id === stage.id);
            const isLocked = idx > 0 && !progress.find(p => p.stage_id === currentChapter.stages[idx-1].id)?.stars;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <StageCard
                  stage={stage}
                  progress={stageProgress}
                  isLocked={isLocked}
                  onSelect={() => !isLocked && onSelectStage(stage)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </ViewShell>
  );
}

function StageCard({ stage, progress, isLocked, onSelect }: any) {
  return (
    <div
      onClick={onSelect}
      className={`relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center gap-4 transition-all overflow-hidden group ${isLocked ? 'opacity-40' : 'hover:border-[#F5C76B]/30 hover:bg-black/60 cursor-pointer'}`}
    >
      {/* Visual Indicator */}
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center relative shrink-0">
        {isLocked ? (
          <Lock size={20} className="text-white/20" />
        ) : (
          <div className="text-center">
            <span className="text-[10px] font-black text-white/40 block leading-none mb-1">ST</span>
            <span className="text-xl font-black text-white leading-none">{stage.id.split('-').pop()}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-sm font-black text-white uppercase tracking-tight">{stage.name}</h3>
        <div className="flex items-center gap-4 mt-2">
           <div className="flex items-center gap-1">
              <Zap size={10} className="text-blue-400" />
              <span className="text-[10px] font-black text-white/60">{stage.energy_cost || 5}</span>
           </div>
           <div className="flex items-center gap-1">
              <Sword size={10} className="text-red-400" />
              <span className="text-[10px] font-black text-white/60">BATTLE</span>
           </div>
        </div>
      </div>

      {/* Stars/Progress */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-0.5">
          {[1, 2, 3].map(s => (
            <Star
              key={s}
              size={12}
              className={`${(progress?.stars || 0) >= s ? 'text-[#F5C76B] fill-[#F5C76B]' : 'text-white/10'}`}
            />
          ))}
        </div>
        {!isLocked && (
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} className="text-[#F5C76B]" />
          </div>
        )}
      </div>

      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-[#F5C76B]/5 to-transparent pointer-events-none" />
    </div>
  );
}
