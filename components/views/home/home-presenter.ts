'use client';

import { getRarityCode } from '@/lib/config/assets-config';
import { AssetService } from '@/lib/services/asset-service';
import { SpriteConfigService } from '@/lib/services/sprite-config-service';
import type { GameStage, GameState, GameUnit, PlayerProfile, ViewType } from '@/lib/types/game-types';
import type { HomeBottomNavItem, HomeHeroPresentation, HomeObjectivePresentation, HomeSideAction } from './types';

const HERO_ROLES: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
const ROLE_AURAS = {
  left: {
    auraColor: '#58A6FF',
    rimColor: 'rgba(88, 166, 255, 0.85)',
    floorGlowClass: 'from-[#58A6FF]/45 via-[#58A6FF]/12 to-transparent',
    sizeClass: 'w-[28%] min-w-[112px] max-w-[160px]',
    spriteClass: 'max-h-[260px] sm:max-h-[320px]',
    brightnessClass: 'brightness-[0.78] saturate-[0.92]',
    blurClass: 'blur-[0.35px]',
    cardAccentClass: 'from-[#152744] via-[#13233f] to-[#0b162d]',
    cardBorderClass: 'border-[#76bbff]/55 shadow-[0_0_26px_rgba(88,166,255,0.18)]',
    offsetClass: 'translate-x-[15%] translate-y-5',
    zIndex: 20,
  },
  center: {
    auraColor: '#F5C76B',
    rimColor: 'rgba(245, 199, 107, 0.95)',
    floorGlowClass: 'from-[#f5c76b]/55 via-[#f5c76b]/18 to-transparent',
    sizeClass: 'w-[40%] min-w-[160px] max-w-[236px]',
    spriteClass: 'max-h-[390px] sm:max-h-[500px]',
    brightnessClass: 'brightness-[1.03] saturate-[1.08]',
    blurClass: '',
    cardAccentClass: 'from-[#2d2518] via-[#1f1920] to-[#121829]',
    cardBorderClass: 'border-[#f4cf88]/70 shadow-[0_0_34px_rgba(245,199,107,0.24)]',
    offsetClass: '-translate-y-2',
    zIndex: 40,
  },
  right: {
    auraColor: '#A855F7',
    rimColor: 'rgba(168, 85, 247, 0.9)',
    floorGlowClass: 'from-[#a855f7]/42 via-[#a855f7]/10 to-transparent',
    sizeClass: 'w-[31%] min-w-[120px] max-w-[170px]',
    spriteClass: 'max-h-[280px] sm:max-h-[340px]',
    brightnessClass: 'brightness-[0.8] saturate-[0.94]',
    blurClass: 'blur-[0.35px]',
    cardAccentClass: 'from-[#281638] via-[#1b1734] to-[#10182c]',
    cardBorderClass: 'border-[#d099ff]/55 shadow-[0_0_26px_rgba(168,85,247,0.2)]',
    offsetClass: '-translate-x-[15%] translate-y-4',
    zIndex: 22,
  },
} as const;

const STAR_MAP: Record<HomeHeroPresentation['rarityCode'], number> = {
  C: 1,
  R: 3,
  SR: 4,
  UR: 5,
  MR: 6,
};

const MISSION_FALLBACK: HomeObjectivePresentation = {
  eyebrow: 'Current Objective',
  chapterLabel: 'CHAPTER 18',
  missionName: 'THE SUNKEN TEMPLE',
  flavorText: 'Advance through the ruined sanctum and reclaim the relic before the cult completes the ritual.',
  starsEarned: 2,
  starsTotal: 3,
};

export function buildHomeHeroes(units: (GameUnit | null)[]): HomeHeroPresentation[] {
  return HERO_ROLES.map((role, idx) => {
    const unit = units[idx] ?? null;
    const roleConfig = ROLE_AURAS[role];
    const rarityCode = getRarityCode((unit as GameUnit & { rarity?: string } | null)?.rarity ?? (role === 'center' ? 'UR' : role === 'right' ? 'SR' : 'R'));
    const spriteId = unit?.current_job_id || unit?.sprite_id || 'novice';
    const spriteUrl = SpriteConfigService.getJobSpriteUrl(spriteId);

    return {
      unit,
      unitId: unit?.id ?? null,
      name: unit?.name ?? 'Empty Slot',
      level: unit?.level ?? null,
      role,
      rarityCode,
      stars: STAR_MAP[rarityCode],
      ariaLabel: unit ? `${unit.name} spotlight` : 'Empty Slot',
      spriteUrl,
      stats: [
        { label: 'HP', value: unit?.baseStats?.hp ?? null, icon: 'hp' },
        { label: 'ATK', value: unit?.baseStats?.atk ?? null, icon: 'atk' },
        { label: 'DEF', value: unit?.baseStats?.def ?? null, icon: 'def' },
        { label: 'MDEF', value: unit?.baseStats?.mdef ?? null, icon: 'mdef' },
      ],
      ...roleConfig,
    };
  });
}

export function getTopbarProfile(state: GameState | null): PlayerProfile | null {
  return state?.profile ?? null;
}

export function getObjectivePresentation(state: GameState | null): HomeObjectivePresentation {
  const selectedStage = state?.selectedStage;
  if (!selectedStage) return MISSION_FALLBACK;

  return {
    eyebrow: 'Current Objective',
    chapterLabel: formatChapterLabel(selectedStage),
    missionName: selectedStage.name.toUpperCase(),
    flavorText: selectedStage.description || MISSION_FALLBACK.flavorText,
    starsEarned: 0,
    starsTotal: 3,
  };
}

function formatChapterLabel(stage: GameStage): string {
  const raw = stage.chapter_id || 'chapter_18';
  const chapterDigits = raw.match(/(\d+)/)?.[1] ?? '18';
  return `CHAPTER ${chapterDigits}`;
}

export function getBottomNavItems(): HomeBottomNavItem[] {
  return [
    { label: 'Party', view: 'party', icon: 'party', activeColorClass: 'from-[#89c8ff] to-[#3d6ff4]' },
    { label: 'Recruit', view: 'tavern', icon: 'recruit', activeColorClass: 'from-[#dba86a] to-[#9a5f2b]' },
    { label: 'Gacha', view: 'gacha', icon: 'gacha', activeColorClass: 'from-[#f5da84] to-[#a855f7]' },
    { label: 'Battle', view: 'campaign', icon: 'battle', activeColorClass: 'from-[#c87057] to-[#7d2730]' },
  ];
}

export function getSideActions(): HomeSideAction[] {
  return [
    { id: 'events', label: 'Events', badge: 2, view: 'events', icon: 'calendar' },
    { id: 'mail', label: 'Mail', badge: 4, view: 'mail', icon: 'mail' },
    { id: 'rewards', label: 'Rewards', badge: 1, view: 'rewards', icon: 'gift' },
  ];
}

export function getExpFill(level: number | undefined): number {
  if (!level) return 42;
  return Math.max(22, Math.min(92, 30 + (level % 10) * 6));
}

export function normalizeGemCount(profile: PlayerProfile | null): number {
  if (!profile) return 0;
  return profile.gems || profile.premium_currency || 0;
}

export function isHomeView(view: ViewType): boolean {
  return view === 'home';
}

export function getStageBackgroundUrl(): string {
  return AssetService.getBgUrl('home');
}
