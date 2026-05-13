'use client';

import { Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { HomeObjectivePresentation } from './types';

interface ObjectiveBattlePanelProps {
  objective: HomeObjectivePresentation;
  onBattle: () => void;
}

export function ObjectiveBattlePanel({ objective, onBattle }: ObjectiveBattlePanelProps) {
  return (
    <div className="relative z-30 px-4">
      <div className="jrpg-objective-panel mx-auto max-w-[390px] rounded-[30px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="jrpg-ribbon-title">{objective.eyebrow}</div>
            <p className="mt-3 text-center text-[13px] font-black uppercase tracking-[0.2em] text-white/88">
              {objective.chapterLabel}
            </p>
            <h2 className="mt-1 text-center text-[27px] font-black uppercase leading-none text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.75)]">
              {objective.missionName}
            </h2>
            <p className="mt-2 text-center text-[11px] leading-4 text-white/58">
              {objective.flavorText}
            </p>
          </div>
          <div className="jrpg-info-badge">
            <Info size={18} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            aria-label="Battle Now"
            onClick={onBattle}
            variant="primary"
            className="jrpg-battle-cta !flex-1 !rounded-[24px] !border-[#a6e6ff]/70 !px-6 !py-4 !text-[24px] !tracking-[0.18em] text-white"
          >
            BATTLE
          </Button>

          <div className="flex shrink-0 gap-1.5">
            {Array.from({ length: objective.starsTotal }).map((_, idx) => {
              const filled = idx < objective.starsEarned;
              return (
                <Star
                  key={idx}
                  size={22}
                  className={filled ? 'fill-[#ffc95d] text-[#ffc95d]' : 'fill-[#2f2c3c] text-[#2f2c3c]'}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
