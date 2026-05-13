'use client';

import type { GameUnit, ViewType } from '@/lib/types/game-types';

export type HomeHeroRole = 'left' | 'center' | 'right';

export interface HomeHeroPresentation {
  unit: GameUnit | null;
  unitId: string | null;
  name: string;
  level: number | null;
  role: HomeHeroRole;
  rarityCode: 'C' | 'R' | 'SR' | 'UR' | 'MR';
  stars: number;
  auraColor: string;
  rimColor: string;
  floorGlowClass: string;
  sizeClass: string;
  spriteClass: string;
  brightnessClass: string;
  blurClass: string;
  cardAccentClass: string;
  cardBorderClass: string;
  offsetClass: string;
  zIndex: number;
  ariaLabel: string;
  spriteUrl: string;
  stats: Array<{ label: string; value: number | null; icon: 'hp' | 'atk' | 'def' | 'mdef' }>;
}

export interface HomeObjectivePresentation {
  eyebrow: string;
  chapterLabel: string;
  missionName: string;
  flavorText: string;
  starsEarned: number;
  starsTotal: number;
}

export interface HomeSideAction {
  id: 'events' | 'mail' | 'rewards';
  label: string;
  badge: number;
  view: ViewType;
  icon: 'calendar' | 'mail' | 'gift';
}

export interface HomeBottomNavItem {
  label: string;
  view: ViewType;
  icon: 'party' | 'recruit' | 'gacha' | 'battle';
  activeColorClass: string;
}
