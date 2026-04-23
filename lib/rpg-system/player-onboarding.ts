import { RPGUnit } from './types';
import { generateNovice, TavernQueueSlot, createTavernSlot } from './recruitment';
import { ExtendedInventory } from './gacha-types';

export interface PlayerSaveData {
    roster: RPGUnit[];
    party: (string | null)[]; // Array of unit IDs or null for empty slots
    partySize: number;
    inventory: ExtendedInventory;
    tavernQueue: TavernQueueSlot[];
}

export function initializeNewPlayer(): PlayerSaveData {
    // 1. Initial 3 Novices (One of each affinity as requested)
    const novice1 = generateNovice('physical');
    const novice2 = generateNovice('ranged');
    const novice3 = generateNovice('magic');
    
    const initialRoster = [novice1, novice2, novice3];
    
    // Store only the IDs in the party slots
    const initialParty = [novice1.id, novice2.id, novice3.id];
    
    // 2. Starting Inventory
    const initialInventory: ExtendedInventory = {
        currency: 5000,
        premiumCurrency: 100, // gems to try the gacha later
        materials: {
            'iron_ore': 5
        },
        weapons: [],
        cards: [],
        skills: [],
        jobCores: []
    };
    
    // 3. Setup Tavern Queue (3 slots: one ready now, two generating)
    const initialTavernQueue = [
        createTavernSlot(0),  // Ready immediately for early game replacement loop
        createTavernSlot(30), // Ready in 30 minutes
        createTavernSlot(60)  // Ready in 60 minutes
    ];

    return {
        roster: initialRoster,
        party: initialParty,
        partySize: 3, // Start with 3 slots
        inventory: initialInventory,
        tavernQueue: initialTavernQueue
    };
}
