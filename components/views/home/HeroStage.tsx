'use client';

import { motion } from 'motion/react';
import { Shield, Sparkles, Swords, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getStageBackgroundUrl } from './home-presenter';
import type { HomeHeroPresentation } from './types';

interface HeroStageProps {
  heroes: HomeHeroPresentation[];
  onSelectUnit?: (unitId: string) => void;
}

const PARTICLES = [
  { left: '8%', top: '16%', delay: 0.1, size: 'h-2 w-2' },
  { left: '22%', top: '44%', delay: 1.2, size: 'h-1.5 w-1.5' },
  { left: '48%', top: '12%', delay: 0.7, size: 'h-2.5 w-2.5' },
  { left: '72%', top: '20%', delay: 1.7, size: 'h-1.5 w-1.5' },
  { left: '84%', top: '55%', delay: 0.3, size: 'h-2 w-2' },
  { left: '60%', top: '68%', delay: 1.1, size: 'h-1 w-1' },
];

export function HeroStage({ heroes, onSelectUnit }: HeroStageProps) {
  return (
    <div className="relative min-h-[500px] flex-1 overflow-hidden rounded-[34px] border border-white/5 bg-[#071120] shadow-[inset_0_0_0_1px_rgba(245,199,107,0.07),0_20px_60px_rgba(0,0,0,0.34)]">
      <img
        src={getStageBackgroundUrl()}
        alt="Fantasy Hall Background"
        className="absolute inset-0 h-full w-full object-cover opacity-32"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(108,164,255,0.34),transparent_24%),linear-gradient(180deg,rgba(7,17,32,0.28)_0%,rgba(7,17,32,0.54)_45%,rgba(4,11,22,0.95)_100%)]" />
      <div className="absolute inset-y-8 left-[13%] w-14 rounded-full bg-white/5 blur-[2px]" />
      <div className="absolute inset-y-12 right-[12%] w-14 rounded-full bg-white/5 blur-[2px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(180deg,rgba(18,35,66,0)_0%,rgba(9,15,30,0.82)_55%,rgba(4,7,15,1)_100%)]" />
      <div className="absolute bottom-2 left-1/2 h-24 w-[92%] -translate-x-1/2 rounded-[100%] bg-[#0e1f3f]/75 blur-[14px]" />
      <div className="absolute bottom-6 left-1/2 h-28 w-[110%] -translate-x-1/2 rounded-[100%] bg-[#b2c9ff]/10 blur-[40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(255,214,135,0.09),transparent_22%)]" />

      {PARTICLES.map((particle, idx) => (
        <motion.span
          key={`${particle.left}-${idx}`}
          className={`absolute ${particle.size} rounded-full bg-white/75 shadow-[0_0_14px_rgba(255,255,255,0.8)]`}
          style={{ left: particle.left, top: particle.top }}
          animate={{ y: [0, -10, 0], opacity: [0.25, 0.9, 0.25] }}
          transition={{ duration: 5 + idx, repeat: Infinity, delay: particle.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-[112px] top-[24px] flex items-end justify-center px-1 sm:px-2">
        {heroes.map(hero => (
          <HeroSpotlight key={hero.role} hero={hero} onSelectUnit={onSelectUnit} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.68)]" />
    </div>
  );
}

function HeroSpotlight({
  hero,
  onSelectUnit,
}: {
  hero: HomeHeroPresentation;
  onSelectUnit?: (unitId: string) => void;
}) {
  const canSelect = Boolean(hero.unitId && onSelectUnit);

  return (
    <motion.div
      className={`relative flex h-full items-end justify-center ${hero.sizeClass} ${hero.offsetClass}`}
      style={{ zIndex: hero.zIndex }}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: hero.role === 'center' ? 0.12 : 0.02 }}
    >
      <motion.div
        className="pointer-events-none absolute bottom-[19%] left-1/2 h-[54%] w-[88%] -translate-x-1/2 rounded-full opacity-90 blur-[60px]"
        style={{ background: `radial-gradient(circle, ${hero.rimColor} 0%, rgba(255,255,255,0) 70%)` }}
        animate={{ opacity: hero.role === 'center' ? [0.55, 0.9, 0.55] : [0.32, 0.55, 0.32] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <RarityAura hero={hero} />

      <motion.div
        className="absolute bottom-[6%] left-1/2 h-10 w-[146%] -translate-x-1/2 rounded-[100%] bg-black/75 blur-[18px]"
        animate={{ scaleX: [1, 1.06, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={`absolute bottom-[7%] left-1/2 h-14 w-[158%] -translate-x-1/2 rounded-[100%] bg-gradient-to-t ${hero.floorGlowClass} blur-[28px]`} />

      <motion.button
        type="button"
        aria-label={hero.ariaLabel}
        disabled={!canSelect}
        onClick={() => {
          if (hero.unitId && onSelectUnit) onSelectUnit(hero.unitId);
        }}
        animate={{ y: hero.unit ? [0, -5, 0] : [0, 0, 0] }}
        transition={{ duration: hero.role === 'center' ? 6.2 : 7.2, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative z-20 flex h-full w-full items-end justify-center ${canSelect ? 'cursor-pointer' : 'cursor-default'} focus-visible:outline-none`}
      >
        {hero.unit ? (
          <img
            src={hero.spriteUrl}
            alt={hero.name}
            className={`pixel-art pointer-events-none relative z-20 w-auto ${hero.spriteClass} ${hero.brightnessClass} ${hero.blurClass} object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.72)]`}
          />
        ) : (
          <div className="relative z-20 flex h-[66%] w-[88%] items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-white/5">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Empty Slot</span>
          </div>
        )}
      </motion.button>

      <HeroCard hero={hero} />
    </motion.div>
  );
}

export function RarityAura({ hero }: { hero: HomeHeroPresentation }) {
  return (
    <div className={`pointer-events-none absolute left-1/2 top-[9%] z-30 -translate-x-1/2 ${hero.role === 'center' ? '' : 'scale-[0.9]'}`}>
      <div
        className="flex flex-col items-center"
        style={{
          filter: `drop-shadow(0 0 16px ${hero.auraColor})`,
        }}
      >
        <div
          className="rounded-full border border-white/25 px-4 py-2 text-center text-[24px] font-black italic leading-none text-white"
          style={{
            background: `linear-gradient(180deg, ${hero.auraColor} 0%, rgba(12,18,34,0.85) 95%)`,
            minWidth: hero.role === 'center' ? 102 : 82,
          }}
        >
          {hero.rarityCode}
        </div>
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: hero.stars }).map((_, idx) => (
            <Sparkles key={idx} size={hero.role === 'center' ? 18 : 15} className="fill-current text-[#ffcf64]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroCard({ hero }: { hero: HomeHeroPresentation }) {
  return (
    <div
      className={`absolute bottom-0 left-1/2 z-30 w-[112%] -translate-x-1/2 rounded-[24px] border bg-gradient-to-b ${hero.cardAccentClass} ${hero.cardBorderClass} px-3 pb-3 pt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-8px_18px_rgba(0,0,0,0.38),0_18px_34px_rgba(0,0,0,0.45)]`}
    >
      <div className="mx-auto inline-flex min-h-[26px] items-center rounded-full border border-white/20 bg-black/30 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#fce097]">
        Lv. {hero.level ?? '--'}
      </div>
      <div className="mt-2 text-center">
        <p className="text-[12px] font-black uppercase text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">{hero.name}</p>
      </div>
      <div className="mt-2 space-y-1.5">
        {hero.stats.map(stat => (
          <div key={stat.label} className="flex items-center justify-between gap-2 text-[10px] font-black text-white/92">
            <div className="flex items-center gap-1.5">
              <StatIcon icon={stat.icon} />
              <span className="uppercase tracking-[0.16em] text-white/78">{stat.label}</span>
            </div>
            <span>{stat.value ?? '--'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatIcon({ icon }: { icon: 'hp' | 'atk' | 'def' | 'mdef' }) {
  if (icon === 'hp') return <Heart size={12} className="fill-current text-[#ff859d]" />;
  if (icon === 'atk') return <Swords size={12} className="text-[#ffd36e]" />;
  return <Shield size={12} className="text-[#9fd2ff]" />;
}
