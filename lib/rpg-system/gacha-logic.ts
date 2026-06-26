/**
 * CLIENT-SIDE GACHA PREVIEW — NOT USED IN PRODUCTION
 * 
 * The actual gacha logic lives in supabase/02-functions.sql (rpc_pull_gacha).
 * This file provides client-side simulation for preview/testing only.
 * Rates and pity are kept in sync with the server for accuracy.
 * 
 * @see supabase/02-functions.sql for production gacha logic
 */
import { AnyGachaItem } from './gacha-types';
import { GACHA_ITEMS } from './gacha-data';

export interface GachaState {
    pullsSinceEpic: number;
    pullsSinceLegendary: number;
}

export interface PullResult {
    item: AnyGachaItem;
    newState: GachaState;
}

// Probabilities (0.0 to 1.0) — MATCHED WITH SERVER (supabase/02-functions.sql)
const RATES = {
    common: 0.40,
    uncommon: 0.20,
    rare: 0.25,
    epic: 0.12,
    legendary: 0.03
};

// Pity Caps — MATCHED WITH SERVER
const PITY_EPIC = 15;
const PITY_LEGENDARY = 80;
const SOFT_PITY_START = 70;
const SOFT_PITY_RATE_PER_PULL = 0.05;

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

function getRandomItemByRarity(rarity: Rarity): AnyGachaItem {
    const pool = GACHA_ITEMS.filter(item => item.rarity === rarity);
    if (pool.length === 0) {
        return GACHA_ITEMS[Math.floor(Math.random() * GACHA_ITEMS.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

export function pullSingle(state: GachaState): PullResult {
    let newPullsEpic = state.pullsSinceEpic + 1;
    let newPullsLegendary = state.pullsSinceLegendary + 1;

    let targetRarity: Rarity = 'common';

    // 1. Check Hard Pity first
    if (newPullsLegendary >= PITY_LEGENDARY) {
        targetRarity = 'legendary';
    } else if (newPullsEpic >= PITY_EPIC) {
        targetRarity = 'epic';
    }
    // 2. Soft Pity: increasing chance before hard cap
    else if (newPullsLegendary >= SOFT_PITY_START) {
        const softChance = RATES.legendary + (newPullsLegendary - SOFT_PITY_START) * SOFT_PITY_RATE_PER_PULL;
        if (Math.random() < softChance) {
            targetRarity = 'legendary';
        } else {
            // Fall through to normal RNG
            targetRarity = rollRarity();
        }
    }
    // 3. Normal RNG resolution
    else {
        targetRarity = rollRarity();
    }

    // 4. Reset pity counters if hit
    if (targetRarity === 'legendary') {
        newPullsLegendary = 0;
        newPullsEpic = 0;
    } else if (targetRarity === 'epic') {
        newPullsEpic = 0;
    }

    const item = getRandomItemByRarity(targetRarity);

    return {
        item,
        newState: {
            pullsSinceEpic: newPullsEpic,
            pullsSinceLegendary: newPullsLegendary
        }
    };
}

function rollRarity(): Rarity {
    const roll = Math.random();
    if (roll < RATES.legendary) return 'legendary';
    if (roll < RATES.legendary + RATES.epic) return 'epic';
    if (roll < RATES.legendary + RATES.epic + RATES.rare) return 'rare';
    if (roll < RATES.legendary + RATES.epic + RATES.rare + RATES.uncommon) return 'uncommon';
    return 'common';
}

export function pullMulti(amount: number, state: GachaState): { items: AnyGachaItem[], newState: GachaState } {
    const items: AnyGachaItem[] = [];
    let currentState = { ...state };

    for (let i = 0; i < amount; i++) {
        const result = pullSingle(currentState);
        items.push(result.item);
        currentState = result.newState;
    }

    return { items, newState: currentState };
}
