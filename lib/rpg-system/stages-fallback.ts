import { Chapter, Stage } from './campaign-types';

// Simplified fallback (Ragnarok-style: 1 chapter, 3 stages)
// Used when DB is unavailable - minimal version vs full DB
export const FALLBACK_CHAPTERS: Chapter[] = [
    {
        id: 'chapter_1',
        index: 1,
        name: 'Praderas del Destino',
        description: 'El comienzo de tu aventura.',
        stages: [
            {
                id: 'stage_1_1',
                chapter_id: 'chapter_1',
                index: 1,
                name: 'El Camino Real',
                description: 'Un sendero tranquilo.',
                energy_cost: 5,
                enemies: [
                    { id: 'slime_1', name: 'Limo Débil', level: 1, position: 0, skillIds: ['basic_attack'] },
                    { id: 'slime_2', name: 'Limo Débil', level: 1, position: 1, skillIds: ['basic_attack'] }
                ],
                rewards: {
                    currency: 100,
                    exp: 50,
                    materials: [{ itemId: 'mat_slime_jelly', amount: 1, chance: 0.5 }]
                },
                first_clear_rewards: {
                    currency: 500,
                    premium_currency: 20,
                    exp: 100,
                    materials: []
                },
                star_conditions: [
                    { type: 'win', description: 'Completa la etapa' },
                    { type: 'no_deaths', description: 'Sin bajas' }
                ]
            },
            {
                id: 'stage_1_2',
                chapter_id: 'chapter_1',
                index: 2,
                name: 'Bosque Susurrante',
                description: 'Los árboles guardan secretos.',
                energy_cost: 5,
                enemies: [
                    { id: 'bat_1', name: 'Murciélago', level: 2, position: 0, skillIds: ['basic_attack'] },
                    { id: 'slime_2', name: 'Limo Pegajoso', level: 2, position: 1, skillIds: ['debuff_slow'] }
                ],
                rewards: {
                    currency: 150,
                    exp: 80,
                    materials: [{ itemId: 'mat_bat_wing', amount: 1, chance: 0.4 }]
                },
                first_clear_rewards: {
                    currency: 800,
                    premium_currency: 30,
                    exp: 150,
                    materials: []
                },
                star_conditions: [
                    { type: 'win', description: 'Completa la etapa' },
                    { type: 'no_deaths', description: 'Sin bajas' }
                ],
                unlock_requirements: { stage_id: 'stage_1_1' }
            },
            {
                id: 'stage_1_3',
                chapter_id: 'chapter_1',
                index: 3,
                name: 'Ruinas de la Atalaya',
                description: 'Ecos de batallas pasadas.',
                energy_cost: 5,
                enemies: [
                    { id: 'skeleton_1', name: 'Esqueleto Guerrero', level: 3, position: 0, skillIds: ['basic_attack', 'taunt'] },
                    { id: 'skeleton_2', name: 'Esqueleto Guerrero', level: 3, position: 2, skillIds: ['basic_attack', 'taunt'] }
                ],
                rewards: {
                    currency: 200,
                    exp: 120,
                    materials: [{ itemId: 'mat_bone_frag', amount: 1, chance: 0.5 }]
                },
                first_clear_rewards: {
                    currency: 1000,
                    premium_currency: 50,
                    exp: 200,
                    materials: []
                },
                star_conditions: [
                    { type: 'win', description: 'Limpia las ruinas' },
                    { type: 'no_deaths', description: 'Sin bajas' }
                ],
                unlock_requirements: { stage_id: 'stage_1_2' }
            }
        ]
    }
];
