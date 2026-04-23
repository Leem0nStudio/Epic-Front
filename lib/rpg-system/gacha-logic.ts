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

// Probabilities (0.0 to 1.0)
const RATES = {
    common: 0.60,
    rare: 0.25,
    epic: 0.12,
    legendary: 0.03
};

// Pity Caps
const PITY_EPIC = 10;
const PITY_LEGENDARY = 80;

function getRandomItemByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary'): AnyGachaItem {
    const pool = GACHA_ITEMS.filter(item => item.rarity === rarity);
    if (pool.length === 0) {
        // Fallback in case a rarity is missing pool items
        return GACHA_ITEMS[Math.floor(Math.random() * GACHA_ITEMS.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

export function pullSingle(state: GachaState): PullResult {
    let newPullsEpic = state.pullsSinceEpic + 1;
    let newPullsLegendary = state.pullsSinceLegendary + 1;

    let targetRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';

    // 1. Check Pity first
    if (newPullsLegendary >= PITY_LEGENDARY) {
        targetRarity = 'legendary';
    } else if (newPullsEpic >= PITY_EPIC) {
        targetRarity = 'epic';
    } else {
        // 2. Normal RNG resolution
        const roll = Math.random();
        if (roll < RATES.legendary) {
            targetRarity = 'legendary';
        } else if (roll < RATES.legendary + RATES.epic) {
            targetRarity = 'epic';
        } else if (roll < RATES.legendary + RATES.epic + RATES.rare) {
            targetRarity = 'rare';
        } else {
            targetRarity = 'common';
        }
    }

    // 3. Reset pity counters if hit
    if (targetRarity === 'legendary') {
        newPullsLegendary = 0;
        newPullsEpic = 0; // Usually hitting highest tier resets the lower tier pity too
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
