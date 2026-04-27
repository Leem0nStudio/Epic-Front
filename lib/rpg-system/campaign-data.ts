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
                    { id: 'slime_1', name: 'Limo Débil', level: 1, position: 0, skillIds: ['basic_attack'] },
                    { id: 'slime_2', name: 'Limo Débil', level: 1, position: 1, skillIds: ['basic_attack'] }
                ],
                rewards: {
                    currency: 100,
                    exp: 50,
                    materials: [
                        { itemId: 'mat_slime_jelly', amount: 1, chance: 0.5 }
                    ]
                },
                first_clear_rewards: {
                    currency: 500,
                    premium_currency: 20,
                    exp: 100,
                    materials: [{ itemId: 'mat_slime_jelly', amount: 3, chance: 1.0 }]
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
                    { id: 'bat_1', name: 'Murciélago', level: 2, position: 0, skillIds: ['basic_attack'] },
                    { id: 'slime_1', name: 'Limo Pegajoso', level: 2, position: 1, skillIds: ['debuff_slow'] },
                    { id: 'bat_2', name: 'Murciélago', level: 2, position: 3, skillIds: ['basic_attack'] }
                ],
                rewards: {
                    currency: 150,
                    exp: 80,
                    materials: [
                        { itemId: 'mat_bat_wing', amount: 1, chance: 0.4 }
                    ]
                },
                first_clear_rewards: {
                    currency: 800,
                    premium_currency: 30,
                    exp: 150,
                    materials: [{ itemId: 'mat_bat_wing', amount: 2, chance: 1.0 }]
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
                    { id: 'skeleton_1', name: 'Esqueleto Guerrero', level: 3, position: 0, skillIds: ['basic_attack', 'taunt'] },
                    { id: 'skeleton_2', name: 'Esqueleto Guerrero', level: 3, position: 2, skillIds: ['basic_attack', 'taunt'] },
                    { id: 'bat_1', name: 'Murciélago', level: 3, position: 4, skillIds: ['basic_attack'] }
                ],
                rewards: {
                    currency: 200,
                    exp: 120,
                    materials: [
                        { itemId: 'mat_bone_frag', amount: 1, chance: 0.5 }
                    ]
                },
                first_clear_rewards: {
                    currency: 1000,
                    premium_currency: 50,
                    exp: 200,
                    materials: [{ itemId: 'mat_bone_frag', amount: 3, chance: 1.0 }]
                },
                star_conditions: [
                    { type: 'win', description: 'Limpia las ruinas' },
                    { type: 'no_deaths', description: 'Sin bajas' },
                    { type: 'turn_limit', value: 12, description: 'Menos de 12 turnos' }
                ],
                unlock_requirements: { stage_id: 'stage_1_2' }
            },
            {
                id: 'stage_1_ex',
                chapter_id: 'chapter_1',
                index: 99,
                name: 'Santuario Oculto (EX)',
                description: 'Un lugar sagrado protegido por guardianes ancestrales.',
                energy_cost: 12,
                enemies: [
                    { id: 'spirit_1', name: 'Espíritu de Luz', level: 8, position: 1, skillIds: ['aoe_damage', 'heal'] },
                    { id: 'spirit_2', name: 'Espíritu de Luz', level: 8, position: 2, skillIds: ['aoe_damage', 'heal'] }
                ],
                rewards: {
                    currency: 500,
                    exp: 300,
                    materials: [
                        { itemId: 'mat_soul_dust', amount: 1, chance: 0.8 }
                    ]
                },
                first_clear_rewards: {
                    currency: 2000,
                    premium_currency: 100,
                    exp: 1000,
                    materials: [{ itemId: 'mat_soul_dust', amount: 5, chance: 1.0 }]
                },
                star_conditions: [
                    { type: 'win', description: 'Purifica el santuario' },
                    { type: 'no_deaths', description: 'Sin bajas' },
                    { type: 'turn_limit', value: 15, description: 'Menos de 15 turnos' }
                ],
                unlock_requirements: { stage_id: 'stage_1_3' }
            },
            {
                id: 'stage_1_4',
                chapter_id: 'chapter_1',
                index: 4,
                name: 'Sendero Sombrío',
                description: 'La oscuridad se vuelve más densa cerca de la guarida.',
                energy_cost: 8,
                enemies: [
                    { id: 'ghost_1', name: 'Espectro', level: 4, position: 1, skillIds: ['debuff_poison', 'basic_attack'] },
                    { id: 'skeleton_1', name: 'Esqueleto Guerrero', level: 4, position: 0, skillIds: ['basic_attack', 'taunt'] },
                    { id: 'skeleton_2', name: 'Esqueleto Guerrero', level: 4, position: 2, skillIds: ['basic_attack', 'taunt'] }
                ],
                rewards: {
                    currency: 300,
                    exp: 180,
                    materials: [
                        { itemId: 'mat_soul_dust', amount: 1, chance: 0.3 }
                    ]
                },
                first_clear_rewards: {
                    currency: 1200,
                    premium_currency: 40,
                    exp: 300,
                    materials: [{ itemId: 'mat_soul_dust', amount: 2, chance: 1.0 }]
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
                    { id: 'slime_1', name: 'Limo Guardián', level: 5, position: 0, skillIds: ['basic_attack', 'taunt'] },
                    { id: 'boss_slime', name: 'Rey Limo', level: 6, position: 1, skillIds: ['aoe_damage', 'debuff_slow', 'basic_attack'] },
                    { id: 'slime_2', name: 'Limo Guardián', level: 5, position: 2, skillIds: ['basic_attack', 'taunt'] }
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
                first_clear_rewards: {
                    currency: 5000,
                    premium_currency: 200,
                    exp: 2000,
                    materials: [{ itemId: 'core_knight', amount: 1, chance: 1.0 }]
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
