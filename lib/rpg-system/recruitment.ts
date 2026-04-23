import { RPGUnit, Affinity, BaseStats } from './types';
import { TRAITS_DATABASE, TRAIT_ID_LIST } from './traits';

// Random Helper
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const generateId = () => `unit_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

export function generateNovice(forcedAffinity?: Affinity): RPGUnit {
    const affinities: Affinity[] = ['physical', 'magic', 'support', 'ranged'];
    const affinity = forcedAffinity || affinities[Math.floor(Math.random() * affinities.length)];

    // 1. Establish absolute base Novice stats
    const baseStats: BaseStats = {
        hp: Math.floor(randomRange(90, 110)),
        atk: Math.floor(randomRange(8, 12)),
        def: Math.floor(randomRange(8, 12)),
        matk: Math.floor(randomRange(8, 12)),
        mdef: Math.floor(randomRange(8, 12)),
        agi: Math.floor(randomRange(8, 12)),
    };

    // 2. Establish base growth rates per level depending on affinity
    const growthRates: BaseStats = {
        hp: randomRange(8, 10),
        atk: randomRange(1, 1.5),
        def: randomRange(1, 1.5),
        matk: randomRange(1, 1.5),
        mdef: randomRange(1, 1.5),
        agi: randomRange(1, 1.5),
    };

    // Apply affinity bias to growths
    switch (affinity) {
        case 'physical':
            growthRates.hp += 2; growthRates.atk += 1.5; growthRates.def += 1.0;
            break;
        case 'magic':
            growthRates.matk += 2.0; growthRates.mdef += 1.5;
            break;
        case 'ranged':
            growthRates.atk += 1.0; growthRates.agi += 2.0;
            break;
        case 'support':
            growthRates.hp += 3; growthRates.def += 1.5; growthRates.mdef += 1.5;
            break;
    }

    // 3. Roll for a Trait (30% chance)
    let traitId: string | undefined = undefined;
    if (Math.random() < 0.3) {
        traitId = TRAIT_ID_LIST[Math.floor(Math.random() * TRAIT_ID_LIST.length)];
        const traitDef = TRAITS_DATABASE[traitId];
        // Apply Trait Growth Modifiers
        (Object.keys(traitDef.growthModifiers) as Array<keyof BaseStats>).forEach(stat => {
            if (traitDef.growthModifiers[stat]) {
                growthRates[stat] *= traitDef.growthModifiers[stat]!;
            }
        });
    }

    const NAMES = ["Arthur", "Lina", "Garran", "Elara", "Finn", "Seris", "Braum", "Kael", "Lyra", "Zane"];

    return {
        id: generateId(),
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        level: 1,
        baseStats: {
            hp: Math.floor(baseStats.hp), atk: Math.floor(baseStats.atk), def: Math.floor(baseStats.def),
            matk: Math.floor(baseStats.matk), mdef: Math.floor(baseStats.mdef), agi: Math.floor(baseStats.agi)
        },
        growthRates: {
            hp: Number(growthRates.hp.toFixed(2)), atk: Number(growthRates.atk.toFixed(2)), def: Number(growthRates.def.toFixed(2)),
            matk: Number(growthRates.matk.toFixed(2)), mdef: Number(growthRates.mdef.toFixed(2)), agi: Number(growthRates.agi.toFixed(2))
        },
        affinity,
        trait: traitId,
        currentJobId: 'novice',
        unlockedJobs: ['novice'],
        
        equippedWeaponId: null,
        equippedCardsIds: [],
        equippedSkillsIds: []
    };
}

export interface TavernQueueSlot {
    queueId: string;
    generatedUnit: RPGUnit | null;
    availableAtTimestamp: number;
}

export function createTavernSlot(delayMinutes: number = 30): TavernQueueSlot {
    const availableAt = Date.now() + (delayMinutes * 60 * 1000);
    return {
        queueId: `queue_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        generatedUnit: generateNovice(),
        availableAtTimestamp: availableAt
    };
}

export function claimRecruit(roster: RPGUnit[], queueList: TavernQueueSlot[], queueId: string): { newRoster: RPGUnit[], newQueueList: TavernQueueSlot[] } {
    const slotIndex = queueList.findIndex(q => q.queueId === queueId);
    if (slotIndex === -1) throw new Error("Slot not found");
    
    const slot = queueList[slotIndex];
    if (Date.now() < slot.availableAtTimestamp) throw new Error("Recruit not ready yet");
    if (!slot.generatedUnit) throw new Error("No unit generated in this slot");

    const newRoster = [...roster, slot.generatedUnit];
    
    // Replace the claimed slot with a new generation timer (e.g., 60 mins)
    const newQueueList = [...queueList];
    newQueueList[slotIndex] = createTavernSlot(60);

    return { newRoster, newQueueList };
}

export function discardRecruit(queueList: TavernQueueSlot[], queueId: string): TavernQueueSlot[] {
    const slotIndex = queueList.findIndex(q => q.queueId === queueId);
    if (slotIndex === -1) throw new Error("Slot not found");
    
    // Replace the discarded slot and restart the timer (e.g., 30 mins, faster turn around for discarding)
    const newQueueList = [...queueList];
    newQueueList[slotIndex] = createTavernSlot(30);

    return newQueueList;
}
