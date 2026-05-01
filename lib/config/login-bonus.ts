export interface DailyBonus {
  day: number;
  currency: number;
  premiumCurrency: number;
  exp: number;
  item?: string;
  isSpecial: boolean;
}

export const LOGIN_BONUS_SCHEDULE: DailyBonus[] = [
  { day: 1, currency: 100, premiumCurrency: 0, exp: 50, isSpecial: false },
  { day: 2, currency: 150, premiumCurrency: 5, exp: 75, isSpecial: false },
  { day: 3, currency: 200, premiumCurrency: 10, exp: 100, isSpecial: false },
  { day: 4, currency: 250, premiumCurrency: 10, exp: 150, isSpecial: false },
  { day: 5, currency: 300, premiumCurrency: 15, exp: 200, isSpecial: false },
  { day: 6, currency: 350, premiumCurrency: 20, exp: 250, isSpecial: false },
  { day: 7, currency: 500, premiumCurrency: 50, exp: 500, item: 'rare_chest', isSpecial: true },
];

export function getDailyBonusForStreak(streak: number): DailyBonus {
  const dayIndex = ((streak - 1) % 7);
  return LOGIN_BONUS_SCHEDULE[dayIndex];
}

export function canClaimDailyBonus(lastClaimDate: string | null): { canClaim: boolean; hoursUntilNext: number; streakBroken: boolean } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!lastClaimDate) {
    return { canClaim: true, hoursUntilNext: 0, streakBroken: false };
  }

  const lastClaim = new Date(lastClaimDate);
  const lastClaimDay = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());
  
  const daysDiff = Math.floor((today.getTime() - lastClaimDay.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Already claimed today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const hoursUntilNext = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
    return { canClaim: false, hoursUntilNext, streakBroken: false };
  }
  
  if (daysDiff === 1) {
    // Can claim - streak continues
    return { canClaim: true, hoursUntilNext: 0, streakBroken: false };
  }
  
  // Streak broken
  return { canClaim: true, hoursUntilNext: 0, streakBroken: true };
}

export function calculateStreakBonus(streak: number): { multiplier: number; bonusCurrency: number } {
  const baseBonus = 1 + Math.floor(streak / 7) * 0.1;
  const bonusCurrency = Math.floor(streak * 10);
  return { multiplier: Math.min(baseBonus, 2), bonusCurrency };
}