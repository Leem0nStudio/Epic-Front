'use client';

import { CalendarDays, Gift, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ViewType } from '@/lib/types/game-types';
import type { HomeSideAction } from './types';

interface SideActionButtonsProps {
  actions: HomeSideAction[];
  onNavigate: (view: ViewType) => void;
}

const ICONS = {
  calendar: CalendarDays,
  mail: Mail,
  gift: Gift,
} as const;

export function SideActionButtons({ actions, onNavigate }: SideActionButtonsProps) {
  return (
    <div className="absolute right-2 top-[138px] z-40 flex flex-col gap-3">
      {actions.map(action => {
        const Icon = ICONS[action.icon];
        return (
          <Button
            key={action.id}
            aria-label={action.label}
            onClick={() => onNavigate(action.view)}
            variant="ghost"
            className="jrpg-side-action !w-[82px] !rounded-[24px] !px-2 !py-3 text-white"
          >
            <span className="relative flex flex-col items-center gap-1.5">
              <span className="jrpg-side-icon-wrap">
                <Icon size={20} />
                {action.badge > 0 ? <span className="jrpg-badge-count">{action.badge}</span> : null}
              </span>
              <span className="text-[11px] font-black normal-case tracking-normal text-white">{action.label}</span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
