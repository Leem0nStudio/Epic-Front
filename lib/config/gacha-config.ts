/**
 * Gacha Configuration — Single Source of Truth
 * 
 * These values must match supabase/02-functions.sql (rpc_pull_gacha).
 * Server is authoritative; client uses this for UI display and preview.
 */

export const GACHA_COSTS = {
  premium: { single: 300, multi: 2700 },  // 10% discount on 10-pull
  soft: { single: 100, multi: 900 },
} as const;

export const GACHA_RATES = {
  common: 0.40,
  uncommon: 0.20,
  rare: 0.25,
  epic: 0.12,
  legendary: 0.03,
} as const;

export const GACHA_PITY = {
  epic: 15,
  legendary: 80,
  softPityStart: 70,
  softPityRatePerPull: 0.05,
} as const;

export const GACHA_CONFIG = {
  costs: GACHA_COSTS,
  rates: GACHA_RATES,
  pity: GACHA_PITY,
  maxPullAmount: 10,
} as const;
