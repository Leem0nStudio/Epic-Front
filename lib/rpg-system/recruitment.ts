import { Affinity, UnitStats } from './types';
import { TRAITS_DATABASE, TRAIT_ID_LIST } from './traits';

// Random Helper
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export function generateNovice(forcedAffinity?: Affinity) {
    const affinities: Affinity[] = ['physical', 'magic', 'support', 'ranged'];
    const affinity = forcedAffinity || affinities[Math.floor(Math.random() * affinities.length)];

    // 1. Establish absolute base Novice stats
    const baseStats: UnitStats = {
        hp: Math.floor(randomRange(90, 110)),
        atk: Math.floor(randomRange(8, 12)),
        def: Math.floor(randomRange(8, 12)),
        matk: Math.floor(randomRange(8, 12)),
        mdef: Math.floor(randomRange(8, 12)),
        agi: Math.floor(randomRange(8, 12)),
    };

    // 2. Establish base growth rates per level depending on affinity
    const growthRates: UnitStats = {
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
        if (traitDef) {
            (Object.keys(traitDef.growthModifiers) as Array<keyof UnitStats>).forEach(stat => {
                if (traitDef.growthModifiers[stat]) {
                    growthRates[stat] *= traitDef.growthModifiers[stat]!;
                }
            });
        }
    }

    const NAMES = ["Arthur", "Lina", "Garran", "Elara", "Finn", "Seris", "Braum", "Kael", "Lyra", "Zane"];

    return {
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        baseStats,
        growthRates: {
            hp: Number(growthRates.hp.toFixed(2)), atk: Number(growthRates.atk.toFixed(2)), def: Number(growthRates.def.toFixed(2)),
            matk: Number(growthRates.matk.toFixed(2)), mdef: Number(growthRates.mdef.toFixed(2)), agi: Number(growthRates.agi.toFixed(2))
        },
        affinity,
        trait: traitId
    };
}
