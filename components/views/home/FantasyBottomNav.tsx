'use client';

import { Sparkles, Swords, Users, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ViewType } from '@/lib/types/game-types';
import type { HomeBottomNavItem } from './types';

interface FantasyBottomNavProps {
  items: HomeBottomNavItem[];
  onNavigate: (view: ViewType) => void;
}

const ICONS = {
  party: Users,
  recruit: Handshake,
  gacha: Sparkles,
  battle: Swords,
} as const;

export function FantasyBottomNav({ items, onNavigate }: FantasyBottomNavProps) {
  return (
    <nav className="relative z-40 px-2 pb-3 pt-1 safe-area-bottom">
      <div className="grid grid-cols-4 gap-2">
        {items.map(item => {
          const Icon = ICONS[item.icon];
          return (
            <Button
              key={item.label}
              aria-label={item.label}
              onClick={() => onNavigate(item.view)}
              variant="ghost"
              className={`jrpg-nav-button bg-gradient-to-b ${item.activeColorClass} !min-h-[126px] !rounded-[28px] !px-2 !py-4 text-white`}
            >
              <span className="flex flex-col items-center justify-center gap-2">
                <span className="jrpg-nav-icon-wrap">
                  <Icon size={32} />
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.78)]">
                  {item.label}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
