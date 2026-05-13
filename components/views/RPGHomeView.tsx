'use client';

import { HeroStage } from '@/components/views/home/HeroStage';
import { FantasyBottomNav } from '@/components/views/home/FantasyBottomNav';
import { ObjectiveBattlePanel } from '@/components/views/home/ObjectiveBattlePanel';
import { SideActionButtons } from '@/components/views/home/SideActionButtons';
import { TopPlayerBar } from '@/components/views/home/TopPlayerBar';
import {
  buildHomeHeroes,
  getBottomNavItems,
  getObjectivePresentation,
  getSideActions,
  getTopbarProfile,
} from '@/components/views/home/home-presenter';
import type { GameState, GameUnit, ViewType } from '@/lib/types/game-types';

interface RPGHomeViewProps {
  saveData: GameState | null;
  activePartyUnits: (GameUnit | null)[];
  onNavigate: (view: ViewType) => void;
  onSelectUnit?: (unitId: string) => void;
}

export function RPGHomeView({
  saveData,
  activePartyUnits,
  onNavigate,
  onSelectUnit,
}: RPGHomeViewProps) {
  const visibleUnits = activePartyUnits.slice(0, 3);
  while (visibleUnits.length < 3) visibleUnits.push(null);

  const heroes = buildHomeHeroes(visibleUnits);
  const objective = getObjectivePresentation(saveData);
  const profile = getTopbarProfile(saveData);
  const sideActions = getSideActions();
  const bottomNav = getBottomNavItems();

  return (
    <div className="jrpg-home-screen relative flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(38,70,130,0.26),transparent_30%),linear-gradient(180deg,#071120_0%,#09152a_45%,#040812_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(145,194,255,0.1),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(10,23,48,0.9),rgba(4,8,18,1))]" />

      <TopPlayerBar profile={profile} onNavigate={onNavigate} />

      <div className="relative flex flex-1 flex-col px-3 pb-2">
        <div className="relative flex-1">
          <HeroStage heroes={heroes} onSelectUnit={onSelectUnit} />
          <SideActionButtons actions={sideActions} onNavigate={onNavigate} />
        </div>

        <div className="-mt-8">
          <ObjectiveBattlePanel objective={objective} onBattle={() => onNavigate('campaign')} />
        </div>
      </div>

      <FantasyBottomNav items={bottomNav} onNavigate={onNavigate} />
    </div>
  );
}
