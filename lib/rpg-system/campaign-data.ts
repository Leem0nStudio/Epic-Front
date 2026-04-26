import { Chapter } from './campaign-types';

export const CAMPAIGN_CHAPTERS: Chapter[] = [
    {
        id: 'chapter_1',
        index: 1,
        name: 'Praderas del Destino',
        description: 'El comienzo de tu aventura en las tierras de Etherea.',
        stages: [
            {
                id: 'stage_1_1',
                chapter_id: 'chapter_1',
                index: 1,
                name: 'El Camino Real',
                description: 'Un sendero tranquilo... o eso parecía.',
                energy_cost: 5,
                enemies: [
                    { id: 'slime_1', name: 'Limo Débil', level: 1, position: 0 },
                    { id: 'slime_2', name: 'Limo Débil', level: 1, position: 1 }
                ],
                rewards: {
                    currency: 100,
                    exp: 50,
                    materials: [
                        { itemId: 'mat_slime_jelly', amount: 1, chance: 0.5 }
                    ]
                },
                star_conditions: [
                    { type: 'win', description: 'Completa la etapa' },
                    { type: 'no_deaths', description: 'Sin bajas en el equipo' },
                    { type: 'turn_limit', value: 10, description: 'Menos de 10 turnos' }
                ]
            },
            {
                id: 'stage_1_2',
                chapter_id: 'chapter_1',
                index: 2,
                name: 'Bosque Susurrante',
                description: 'Los árboles guardan secretos peligrosos.',
                energy_cost: 6,
                enemies: [
                    { id: 'bat_1', name: 'Murciélago', level: 2, position: 0 },
                    { id: 'slime_1', name: 'Limo Débil', level: 2, position: 1 },
                    { id: 'bat_2', name: 'Murciélago', level: 2, position: 3 }
                ],
                rewards: {
                    currency: 150,
                    exp: 80,
                    materials: [
                        { itemId: 'mat_bat_wing', amount: 1, chance: 0.4 }
                    ]
                },
                star_conditions: [
                    { type: 'win', description: 'Completa la etapa' },
                    { type: 'no_deaths', description: 'Sin bajas' },
                    { type: 'turn_limit', value: 10, description: 'Menos de 10 turnos' }
                ],
                unlock_requirements: { stage_id: 'stage_1_1' }
            },
            {
                id: 'stage_1_3',
                chapter_id: 'chapter_1',
                index: 3,
                name: 'Ruinas de la Atalaya',
                description: 'Ecos de batallas pasadas aún resuenan aquí.',
                energy_cost: 6,
                enemies: [
                    { id: 'skeleton_1', name: 'Esqueleto Guerrero', level: 3, position: 0 },
                    { id: 'skeleton_2', name: 'Esqueleto Guerrero', level: 3, position: 2 },
                    { id: 'bat_1', name: 'Murciélago', level: 3, position: 4 }
                ],
                rewards: {
                    currency: 200,
                    exp: 120,
                    materials: [
                        { itemId: 'mat_bone_frag', amount: 1, chance: 0.5 }
                    ]
                },
                star_conditions: [
                    { type: 'win', description: 'Limpia las ruinas' },
                    { type: 'no_deaths', description: 'Sin bajas' },
                    { type: 'turn_limit', value: 12, description: 'Menos de 12 turnos' }
                ],
                unlock_requirements: { stage_id: 'stage_1_2' }
            },
            {
                id: 'stage_1_4',
                chapter_id: 'chapter_1',
                index: 4,
                name: 'Sendero Sombrío',
                description: 'La oscuridad se vuelve más densa cerca de la guarida.',
                energy_cost: 8,
                enemies: [
                    { id: 'ghost_1', name: 'Espectro', level: 4, position: 1 },
                    { id: 'skeleton_1', name: 'Esqueleto Guerrero', level: 4, position: 0 },
                    { id: 'skeleton_2', name: 'Esqueleto Guerrero', level: 4, position: 2 }
                ],
                rewards: {
                    currency: 300,
                    exp: 180,
                    materials: [
                        { itemId: 'mat_soul_dust', amount: 1, chance: 0.3 }
                    ]
                },
                star_conditions: [
                    { type: 'win', description: 'Cruza el sendero' },
                    { type: 'no_deaths', description: 'Sin bajas' },
                    { type: 'turn_limit', value: 15, description: 'Menos de 15 turnos' }
                ],
                unlock_requirements: { stage_id: 'stage_1_3' }
            },
            {
                id: 'stage_1_5',
                chapter_id: 'chapter_1',
                index: 5,
                name: 'Cámara del Gran Limo',
                description: 'El primer gran desafío.',
                energy_cost: 10,
                enemies: [
                    { id: 'slime_1', name: 'Limo Guardián', level: 5, position: 0 },
                    { id: 'boss_slime', name: 'Rey Limo', level: 6, position: 1 },
                    { id: 'slime_2', name: 'Limo Guardián', level: 5, position: 2 }
                ],
                rewards: {
                    currency: 1000,
                    premium_currency: 50,
                    exp: 500,
                    materials: [
                        { itemId: 'core_knight', amount: 1, chance: 0.1 },
                        { itemId: 'mat_slime_core', amount: 1, chance: 1.0 }
                    ]
                },
                star_conditions: [
                    { type: 'win', description: 'Vence al Rey Limo' },
                    { type: 'no_deaths', description: 'Sin bajas' },
                    { type: 'turn_limit', value: 20, description: 'Menos de 20 turnos' }
                ],
                unlock_requirements: { stage_id: 'stage_1_4' }
            }
        ]
    }
];
