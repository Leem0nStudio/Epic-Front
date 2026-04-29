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
  Sword
} from 'lucide-react';
import { CampaignService } from '@/lib/services/campaign-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Chapter, Stage, PlayerStageProgress } from '@/lib/rpg-system/campaign-types';
import { ViewType } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';

interface CampaignMapViewProps {
  playerEnergy: number;
  onNavigate: (view: ViewType) => void;
  onSelectStage: (stage: Stage) => void;
}

export function CampaignMapView({ playerEnergy, onNavigate, onSelectStage }: CampaignMapViewProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [progress, setProgress] = useState<PlayerStageProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [chaptersData, progressData] = await Promise.all([
        CampaignService.getChapters(),
        CampaignService.getPlayerProgress()
      ]);
      setChapters(chaptersData);
      setProgress(progressData);
      setLoading(false);
    }
    loadData();
  }, []);

  const currentChapter = chapters[activeChapterIdx];

  const isStageUnlocked = (stage: Stage) => {
    if (!stage.unlock_requirements?.stage_id) return true;
    return progress.some(p => p.stage_id === stage.unlock_requirements?.stage_id);
  };

  const getStageStars = (stageId: string) => {
    return progress.find(p => p.stage_id === stageId)?.stars || 0;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#020508]">
        <LoadingSpinner />
      </div>
    );
  }

   return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      {/* Header */}
      <NineSlicePanel
        type="panel"
        variant="default"
        className="p-6 flex items-center justify-between border-b border-white/5 z-10"
      >
        <button
          onClick={() => onNavigate('home')}
          className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Campaña</span>
          <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Etherea Chronicles</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <Zap size={12} className="text-[#F5C76B] fill-current" />
          <span className="text-[10px] font-black text-white">{playerEnergy}</span>
        </div>
      </NineSlicePanel>

      {/* Map Content */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,199,107,0.05),transparent)] pointer-events-none" />

        {/* Chapter Header */}
        <div className="mb-10 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-3"
          >
            <MapIcon size={12} className="text-[#F5C76B]" />
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Capítulo {currentChapter.index}</span>
          </motion.div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">{currentChapter.name}</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mt-2 max-w-[250px] mx-auto leading-relaxed">{currentChapter.description}</p>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 gap-4 relative">
          {currentChapter.stages.map((stage, idx) => {
            const unlocked = isStageUnlocked(stage);
            const stars = getStageStars(stage.id);

            return (
              <NineSlicePanel
                key={stage.id}
                type="border"
                variant="default"
                className={`group relative flex items-center gap-4 p-4 rounded-3xl transition-all ${
                  unlocked
                  ? 'hover:border-[#F5C76B]/40 cursor-pointer active:scale-[0.98]'
                  : 'opacity-40 grayscale cursor-not-allowed'
                }`}
                style={{ backgroundColor: unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.4)' }}
                onClick={() => unlocked && onSelectStage(stage)}
                as={motion.button}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                disabled={!unlocked}
              >
                {/* Index / Status */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  unlocked ? 'bg-[#F5C76B]/10 border-[#F5C76B]/20 text-[#F5C76B]' : 'bg-white/5 border-white/5 text-white/10'
                }`}>
                  {unlocked ? (
                    <span className="text-xs font-black italic">{stage.index}</span>
                  ) : (
                    <Lock size={14} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{stage.name}</h3>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          size={10}
                          className={`${s <= stars ? 'text-[#F5C76B] fill-current shadow-[0_0_8px_rgba(245,199,107,0.5)]' : 'text-white/5'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-white/30 uppercase tracking-tight truncate max-w-[180px]">{stage.description}</p>
                </div>

                {/* Energy */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Zap size={10} className="text-[#F5C76B]" />
                    <span className="text-[10px] font-black text-white">{stage.energy_cost}</span>
                  </div>
                  <ChevronRight size={14} className="text-white/10 group-hover:text-white/40" />
                </div>

                {unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F5C76B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
                )}
              </NineSlicePanel>
            );
          })}
        </div>
      </div>

      {/* Chapter Navigation (Footer) */}
      <div className="p-6 bg-[#0B1A2A] border-t border-white/5 flex items-center justify-center gap-8 shrink-0">
         <Button
           onClick={() => setActiveChapterIdx(prev => prev - 1)}
           disabled={activeChapterIdx === 0}
           variant="secondary"
           size="sm"
         >
           <ChevronLeft size={16} />
         </Button>
         <div className="flex gap-2">
            {chapters.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeChapterIdx ? 'bg-[#F5C76B] w-6' : 'bg-white/10'}`} />
            ))}
         </div>
         <Button
           onClick={() => setActiveChapterIdx(prev => prev + 1)}
           disabled={activeChapterIdx === chapters.length - 1}
           variant="secondary"
           size="sm"
         >
           <ChevronRight size={16} />
         </Button>
      </div>
    </div>
  );
}
