'use client';

import { Bell, Coins, Diamond, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PlayerProfile, ViewType } from '@/lib/types/game-types';
import { getExpFill, normalizeGemCount } from './home-presenter';
import type { ReactNode } from 'react';

interface TopPlayerBarProps {
  profile: PlayerProfile | null;
  onNavigate: (view: ViewType) => void;
}

export function TopPlayerBar({ profile, onNavigate }: TopPlayerBarProps) {
  const level = profile?.level ?? 1;
  const expFill = getExpFill(profile?.level);
  const gold = profile?.currency ?? 0;
  const gems = normalizeGemCount(profile);
  const playerName = profile?.username || 'Jugador';

  return (
    <div className="relative z-40 px-3 pt-3 pb-2">
      <div className="jrpg-home-panel rounded-[28px] px-3 py-3 min-h-[114px]">
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label="Open Profile"
            onClick={() => onNavigate('profile')}
            className="jrpg-rank-medallion shrink-0"
          >
            <span className="jrpg-rank-label">Rank</span>
            <span className="jrpg-rank-value">{level}</span>
          </button>

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[26px] leading-none font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.75)]">
                  {playerName}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f9dd8c]">
                    Lv. {level}
                  </span>
                  <div className="jrpg-exp-track">
                    <div className="jrpg-exp-fill" style={{ width: `${expFill}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <ResourceCapsule icon={<Coins size={18} />} value={gold.toLocaleString()} />
                <ResourceCapsule icon={<Diamond size={18} />} value={gems.toLocaleString()} gem />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <IconButton ariaLabel="Settings" onClick={() => onNavigate('profile')}>
                <Settings size={18} />
              </IconButton>
              <IconButton ariaLabel="Notifications" onClick={() => onNavigate('mail')} badge>
                <Bell size={18} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCapsule({
  icon,
  value,
  gem = false,
}: {
  icon: ReactNode;
  value: string;
  gem?: boolean;
}) {
  return (
    <div className="jrpg-resource-capsule">
      <div className={`jrpg-resource-icon ${gem ? 'text-cyan-300' : 'text-[#f5c76b]'}`}>{icon}</div>
      <span className="jrpg-resource-value">{value}</span>
    </div>
  );
}

function IconButton({
  ariaLabel,
  onClick,
  badge = false,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  badge?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      onClick={onClick}
      variant="ghost"
      className="jrpg-orb-button !min-h-[44px] !min-w-[44px] !px-0 !py-0"
    >
      <span className="relative inline-flex items-center justify-center">
        {children}
        {badge ? <span className="jrpg-alert-dot" /> : null}
      </span>
    </Button>
  );
}
