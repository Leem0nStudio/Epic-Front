import { AssetService } from '../services/asset-service';
import { Affinity, UnitStats } from './types';
import { TRAITS_DATABASE, TRAIT_ID_LIST } from './traits';

// Random Helper
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export function generateNovice(forcedAffinity?: Affinity) {
    const affinities: Affinity[] = ['physical', 'magic', 'support', 'ranged'];
    const affinity = forcedAffinity || affinities[Math.floor(Math.random() * affinities.length)];

    // 1. Establish absolute base Novice stats
    const base_stats: UnitStats = {
        hp: Math.floor(randomRange(90, 110)),
        atk: Math.floor(randomRange(8, 12)),
        def: Math.floor(randomRange(8, 12)),
        matk: Math.floor(randomRange(8, 12)),
        mdef: Math.floor(randomRange(8, 12)),
        agi: Math.floor(randomRange(8, 12)),
    };

    // 2. Establish base growth rates per level depending on affinity
    const growth_rates: UnitStats = {
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
            growth_rates.hp += 2; growth_rates.atk += 1.5; growth_rates.def += 1.0;
            break;
        case 'magic':
            growth_rates.matk += 2.0; growth_rates.mdef += 1.5;
            break;
        case 'ranged':
            growth_rates.atk += 1.0; growth_rates.agi += 2.0;
            break;
        case 'support':
            growth_rates.hp += 3; growth_rates.def += 1.5; growth_rates.mdef += 1.5;
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
                    growth_rates[stat] *= traitDef.growthModifiers[stat]!;
                }
            });
        }
    }

    const NAMES = ["Arthur", "Lina", "Garran", "Elara", "Finn", "Seris", "Braum", "Kael", "Lyra", "Zane"];

    const archetype = AssetService.getAffinityArchetype(affinity);
    const spriteId = AssetService.getRandomSpriteId(archetype);
    const iconId = AssetService.getJobIconId('novice');

    return {
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        baseStats: base_stats,
        growthRates: {
            hp: Number(growth_rates.hp.toFixed(2)), atk: Number(growth_rates.atk.toFixed(2)), def: Number(growth_rates.def.toFixed(2)),
            matk: Number(growth_rates.matk.toFixed(2)), mdef: Number(growth_rates.mdef.toFixed(2)), agi: Number(growth_rates.agi.toFixed(2))
        },
        affinity,
        trait: traitId,
        spriteId,
        iconId
    };
}
