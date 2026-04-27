import { CombatUnit } from '../types/combat';

export type StarConditionType = 'win' | 'no_deaths' | 'turn_limit' | 'all_survived' | 'timed_clear';

export interface StarCondition {
    type: StarConditionType;
    value?: number; // e.g., turn limit value
    description: string;
}

export interface StageReward {
    currency: number;
    premium_currency?: number;
    exp: number;
    materials: { itemId: string; amount: number; chance: number }[];
}

export interface EnemyTemplate {
    id: string;
    name: string;
    level: number;
    position: number;
    skillIds?: string[];
}

export interface Stage {
    id: string;
    chapter_id: string;
    index: number;
    name: string;
    description: string;
    energy_cost: number;
    enemies: EnemyTemplate[];
    rewards: StageReward;
    first_clear_rewards?: StageReward;
    star_conditions: StarCondition[];
    unlock_requirements?: {
        stage_id?: string;
        player_level?: number;
    };
}

export interface Chapter {
    id: string;
    index: number;
    name: string;
    description: string;
    stages: Stage[];
}

export interface PlayerStageProgress {
    stage_id: string;
    stars: number; // 0-3
    cleared: boolean;
    best_turns?: number;
}
