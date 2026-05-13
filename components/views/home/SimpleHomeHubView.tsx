'use client';

import { CalendarDays, Gift, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ViewShell } from '@/components/ui/ViewShell';
import type { ViewType } from '@/lib/types/game-types';

interface SimpleHomeHubViewProps {
  title: string;
  subtitle: string;
  icon: 'events' | 'mail' | 'rewards';
  description: string;
  primaryLabel: string;
  primaryTarget: ViewType;
  secondaryLabel: string;
  secondaryTarget: ViewType;
  onNavigate: (view: ViewType) => void;
}

const ICONS = {
  events: CalendarDays,
  mail: Mail,
  rewards: Gift,
} as const;

export function SimpleHomeHubView({
  title,
  subtitle,
  icon,
  description,
  primaryLabel,
  primaryTarget,
  secondaryLabel,
  secondaryTarget,
  onNavigate,
}: SimpleHomeHubViewProps) {
  const Icon = ICONS[icon];

  return (
    <ViewShell title={title} subtitle={subtitle} onBack={() => onNavigate('home')} background="home">
      <div className="flex h-full flex-col justify-center px-6 pb-8 pt-4">
        <div className="rounded-[30px] border border-[#f5c76b]/30 bg-[linear-gradient(180deg,rgba(13,25,48,0.92),rgba(10,17,32,0.96))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-[#f5c76b]/30 bg-[#13233d] text-[#f5c76b] shadow-[0_0_34px_rgba(245,199,107,0.2)]">
            <Icon size={34} />
          </div>
          <h2 className="mt-5 text-center text-[20px] font-black uppercase tracking-[0.12em] text-white/88">
            {subtitle}
          </h2>
          <p className="mt-3 text-center text-[12px] leading-5 text-white/65">
            {description}
          </p>

          <div className="mt-6 grid gap-3">
            <Button onClick={() => onNavigate(primaryTarget)} variant="primary" className="!py-4 !text-[13px]">
              {primaryLabel}
            </Button>
            <Button onClick={() => onNavigate(secondaryTarget)} variant="secondary" className="!py-4 !text-[12px]">
              {secondaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </ViewShell>
  );
}
