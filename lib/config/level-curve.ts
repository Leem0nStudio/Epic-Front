import { z } from 'zod';

export const LevelConfigSchema = z.object({
  level: z.number().min(1).max(99),
  expRequired: z.number().min(0),
  energyCost: z.number().min(1),
  enemyPower: z.number().min(1),
  unlockId: z.string().optional(),
  unlockName: z.string().optional(),
});

export type LevelConfig = z.infer<typeof LevelConfigSchema>;

export const PROGRESSION_LEVELS: LevelConfig[] = [
  // TIER 1: Early Game (1-10) - Fast progression
  { level: 1, expRequired: 0, energyCost: 5, enemyPower: 10 },
  { level: 2, expRequired: 100, energyCost: 5, enemyPower: 15 },
  { level: 3, expRequired: 250, energyCost: 5, enemyPower: 20 },
  { level: 4, expRequired: 450, energyCost: 5, enemyPower: 25 },
  { level: 5, expRequired: 700, energyCost: 5, enemyPower: 30, unlockId: 'party_slot_2', unlockName: 'Segundo slot de party' },
  { level: 6, expRequired: 1000, energyCost: 5, enemyPower: 35 },
  { level: 7, expRequired: 1350, energyCost: 5, enemyPower: 40 },
  { level: 8, expRequired: 1750, energyCost: 5, enemyPower: 45 },
  { level: 9, expRequired: 2200, energyCost: 5, enemyPower: 50 },
  { level: 10, expRequired: 2700, energyCost: 5, enemyPower: 55, unlockId: 'auto_battle', unlockName: 'Batalla automática' },

  // TIER 2: Mid Game (11-20)
  { level: 11, expRequired: 3300, energyCost: 6, enemyPower: 65 },
  { level: 12, expRequired: 4000, energyCost: 6, enemyPower: 75 },
  { level: 13, expRequired: 4800, energyCost: 7, enemyPower: 85 },
  { level: 14, expRequired: 5700, energyCost: 7, enemyPower: 95 },
  { level: 15, expRequired: 6700, energyCost: 8, enemyPower: 105, unlockId: 'guild', unlockName: 'Acceso a Gremio' },
  { level: 16, expRequired: 7800, energyCost: 8, enemyPower: 115 },
  { level: 17, expRequired: 9000, energyCost: 9, enemyPower: 125 },
  { level: 18, expRequired: 10300, energyCost: 9, enemyPower: 135 },
  { level: 19, expRequired: 11700, energyCost: 10, enemyPower: 145 },
  { level: 20, expRequired: 13200, energyCost: 10, enemyPower: 155, unlockId: 'party_slot_3', unlockName: 'Tercer slot de party (Full Party)' },

  // TIER 3: Late Game (21-30)
  { level: 21, expRequired: 15000, energyCost: 10, enemyPower: 170 },
  { level: 22, expRequired: 17000, energyCost: 11, enemyPower: 185 },
  { level: 23, expRequired: 19200, energyCost: 11, enemyPower: 200 },
  { level: 24, expRequired: 21600, energyCost: 12, enemyPower: 215 },
  { level: 25, expRequired: 24200, energyCost: 12, enemyPower: 230, unlockId: 'mount', unlockName: 'Monta/Compañero' },
  { level: 26, expRequired: 27000, energyCost: 13, enemyPower: 250 },
  { level: 27, expRequired: 30000, energyCost: 13, enemyPower: 270 },
  { level: 28, expRequired: 33500, energyCost: 14, enemyPower: 290 },
  { level: 29, expRequired: 37500, energyCost: 14, enemyPower: 310 },
  { level: 30, expRequired: 42000, energyCost: 15, enemyPower: 330, unlockId: 'pvp_arena', unlockName: 'Arena PvP' },

  // TIER 4: Endgame (31-40) - The Wall
  { level: 31, expRequired: 50000, energyCost: 15, enemyPower: 350 },
  { level: 32, expRequired: 60000, energyCost: 16, enemyPower: 370 },
  { level: 33, expRequired: 72000, energyCost: 16, enemyPower: 390 },
  { level: 34, expRequired: 86000, energyCost: 17, enemyPower: 410 },
  { level: 35, expRequired: 100000, energyCost: 18, enemyPower: 430, unlockId: 'infinite_tower', unlockName: 'Torre Infinita' },
  { level: 36, expRequired: 120000, energyCost: 18, enemyPower: 450 },
  { level: 37, expRequired: 145000, energyCost: 19, enemyPower: 470 },
  { level: 38, expRequired: 175000, energyCost: 20, enemyPower: 490 },
  { level: 39, expRequired: 210000, energyCost: 20, enemyPower: 510 },
  { level: 40, expRequired: 250000, energyCost: 20, enemyPower: 530, unlockId: 'prestige', unlockName: 'Prestigio (New Game+)' },

  // TIER 5: Prestige (41-50)
  { level: 41, expRequired: 300000, energyCost: 20, enemyPower: 550 },
  { level: 42, expRequired: 360000, energyCost: 20, enemyPower: 570 },
  { level: 43, expRequired: 430000, energyCost: 20, enemyPower: 590 },
  { level: 44, expRequired: 510000, energyCost: 20, enemyPower: 610 },
  { level: 45, expRequired: 600000, energyCost: 20, enemyPower: 630 },
  { level: 46, expRequired: 700000, energyCost: 20, enemyPower: 650 },
  { level: 47, expRequired: 820000, energyCost: 20, enemyPower: 670 },
  { level: 48, expRequired: 960000, energyCost: 20, enemyPower: 690 },
  { level: 49, expRequired: 1120000, energyCost: 20, enemyPower: 710 },
  { level: 50, expRequired: 1300000, energyCost: 20, enemyPower: 730 },
];

export function getLevelFromExp(exp: number): number {
  let level = 1;
  for (const config of PROGRESSION_LEVELS) {
    if (exp >= config.expRequired) {
      level = config.level;
    } else {
      break;
    }
  }
  return level;
}

export function getExpForNextLevel(currentExp: number): { currentLevel: number; expForNext: number; expProgress: number; percentToNext: number } {
  const currentLevel = getLevelFromExp(currentExp);
  const currentConfig = PROGRESSION_LEVELS.find(c => c.level === currentLevel);
  const nextConfig = PROGRESSION_LEVELS.find(c => c.level === currentLevel + 1);

  if (!currentConfig) {
    return { currentLevel: 1, expForNext: 100, expProgress: currentExp, percentToNext: 100 };
  }

  if (!nextConfig) {
    return { currentLevel, expForNext: currentConfig.expRequired, expProgress: currentExp - currentConfig.expRequired, percentToNext: 100 };
  }

  const expForNext = nextConfig.expRequired - currentConfig.expRequired;
  const expProgress = currentExp - currentConfig.expRequired;
  const percentToNext = Math.min(100, Math.floor((expProgress / expForNext) * 100));

  return { currentLevel, expForNext, expProgress, percentToNext };
}

export function getUnlockForLevel(level: number): LevelConfig | undefined {
  return PROGRESSION_LEVELS.find(c => c.level === level && c.unlockId);
}

export function getEnergyCostForLevel(level: number): number {
  const config = PROGRESSION_LEVELS.find(c => c.level === level);
  return config?.energyCost ?? 5;
}

export function getEnemyPowerForLevel(level: number): number {
  const config = PROGRESSION_LEVELS.find(c => c.level === level);
  return config?.enemyPower ?? 10;
}