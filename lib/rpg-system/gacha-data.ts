import { CardItem, WeaponItem, SkillItem, JobCoreItem, AnyGachaItem } from './gacha-types';

export const GACHA_DATABASE: Record<string, AnyGachaItem> = {
    // ============================================
    // CARDS (10 Examples)
    // ============================================
    'card_goblin': {
        id: 'card_goblin', name: 'Goblin Card', type: 'card', rarity: 'common', version: 'v1.0',
        description: 'Increases physical damage by 10%.',
        effectType: 'statBoost', effectTarget: 'atk', effectValue: 0.10, applicableJobs: ['ALL']
    },
    'card_zombie': {
        id: 'card_zombie', name: 'Zombie Card', type: 'card', rarity: 'common', version: 'v1.0',
        description: 'Increases Max HP by 15%.',
        effectType: 'statBoost', effectTarget: 'hp', effectValue: 0.15, applicableJobs: ['ALL']
    },
    'card_skeleton': {
        id: 'card_skeleton', name: 'Skeleton Worker Card', type: 'card', rarity: 'rare', version: 'v1.0',
        description: 'Increases physical damage against medium targets by 20%.',
        effectType: 'conditionalEffect', effectTarget: 'damage_medium', effectValue: 0.20, applicableJobs: ['swordman', 'knight', 'rune_knight']
    },
    'card_ghost': {
        id: 'card_ghost', name: 'Ghostring Card', type: 'card', rarity: 'epic', version: 'v1.0',
        description: 'Chance to evade physical attacks (15%).',
        effectType: 'conditionalEffect', effectTarget: 'evasion', effectValue: 0.15, applicableJobs: ['ALL']
    },
    'card_baphomet': {
        id: 'card_baphomet', name: 'Baphomet Card', type: 'card', rarity: 'legendary', version: 'v1.0',
        description: 'Basic attacks hit all enemies in a 3x3 area.',
        effectType: 'skillModifier', effectTarget: 'basic_attack_aoe', effectValue: 1, applicableJobs: ['ALL']
    },
    'card_elder_willow': {
        id: 'card_elder_willow', name: 'Elder Willow Card', type: 'card', rarity: 'common', version: 'v1.0',
        description: 'Magic Attack +10%.',
        effectType: 'statBoost', effectTarget: 'matk', effectValue: 0.10, applicableJobs: ['mage', 'wizard', 'warlock']
    },
    'card_pecopeco': {
        id: 'card_pecopeco', name: 'Peco Peco Card', type: 'card', rarity: 'rare', version: 'v1.0',
        description: 'HP +25%.',
        effectType: 'statBoost', effectTarget: 'hp', effectValue: 0.25, applicableJobs: ['ALL']
    },
    'card_vampire': {
        id: 'card_vampire', name: 'Vampire Bat Card', type: 'card', rarity: 'rare', version: 'v1.0',
        description: '10% chance to drain 5% HP on basic attacks.',
        effectType: 'conditionalEffect', effectTarget: 'lifesteal_chance', effectValue: 0.10, applicableJobs: ['ALL']
    },
    'card_hydra': {
        id: 'card_hydra', name: 'Hydra Card', type: 'card', rarity: 'epic', version: 'v1.0',
        description: 'Damage to Demihuman targets +20%.',
        effectType: 'conditionalEffect', effectTarget: 'damage_demihuman', effectValue: 0.20, applicableJobs: ['ALL']
    },
    'card_valkyrie': {
        id: 'card_valkyrie', name: 'Valkyrie Randgris Card', type: 'card', rarity: 'legendary', version: 'v1.0',
        description: 'Physical Attack +10%, makes attacks un-interruptible.',
        effectType: 'skillModifier', effectTarget: 'uninterruptible', effectValue: 1, applicableJobs: ['ALL']
    },

    // ============================================
    // WEAPONS (5 Examples)
    // ============================================
    'wpn_blade': {
        id: 'wpn_blade', name: 'Iron Blade', type: 'weapon', rarity: 'common', version: 'v1.0',
        description: 'A standard iron sword.', weaponCategory: 'sword',
        statBonuses: { atk: 50, def: 5 }
    },
    'wpn_wand': {
        id: 'wpn_wand', name: 'Apprentice Wand', type: 'weapon', rarity: 'common', version: 'v1.0',
        description: 'A magical wooden catalyst.', weaponCategory: 'staff',
        statBonuses: { matk: 60, mdef: 10 }
    },
    'wpn_crimson_bow': {
        id: 'wpn_crimson_bow', name: 'Crimson Bow', type: 'weapon', rarity: 'rare', version: 'v1.0',
        description: 'A bow burning with fire element.', weaponCategory: 'bow',
        statBonuses: { atk: 120, agi: 20 }, specialEffect: 'Fire Element attacks'
    },
    'wpn_murasame': {
        id: 'wpn_murasame', name: 'Murasame', type: 'weapon', rarity: 'epic', version: 'v1.0',
        description: 'A cursed katana that causes bleeding.', weaponCategory: 'sword',
        statBonuses: { atk: 250, agi: 40 }, specialEffect: 'Attacks have a 25% chance to cause Bleed.'
    },
    'wpn_staff_of_destruction': {
        id: 'wpn_staff_of_destruction', name: 'Staff of Destruction', type: 'weapon', rarity: 'legendary', version: 'v1.0',
        description: 'A staff containing chaotic magic.', weaponCategory: 'staff',
        statBonuses: { matk: 400 }, specialEffect: 'Reduces cast time of Burst skills by 50%.'
    },

    // ============================================
    // SKILLS (5 Examples)
    // ============================================
    'skill_heal': {
        id: 'skill_heal', name: 'Heal', type: 'skill', rarity: 'rare', version: 'v1.0',
        description: 'Restores HP to a target.', skillType: 'active',
        cooldown: 2, scaling: { stat: 'matk', multiplier: 2.5 }
    },
    'skill_double_strafe': {
        id: 'skill_double_strafe', name: 'Double Strafe', type: 'skill', rarity: 'common', version: 'v1.0',
        description: 'Fires two quick shots.', skillType: 'active',
        cooldown: 1, scaling: { stat: 'atk', multiplier: 1.8 }
    },
    'skill_meteor_strike': {
        id: 'skill_meteor_strike', name: 'Meteor Strike', type: 'skill', rarity: 'epic', version: 'v1.0',
        description: 'Devastating fiery strike.', skillType: 'burst',
        cooldown: 4, scaling: { stat: 'atk', multiplier: 4.0 }, effect: 'Stuns target on critical hit.'
    },
    'skill_energy_coat': {
        id: 'skill_energy_coat', name: 'Energy Coat', type: 'skill', rarity: 'epic', version: 'v1.0',
        description: 'Reduces incoming physical damage.', skillType: 'passive',
        cooldown: 0, scaling: { stat: 'matk', multiplier: 0.5 }, effect: 'Reduces damage by converting SP to HP buffer.'
    },
    'skill_cross_impact': {
        id: 'skill_cross_impact', name: 'Cross Impact', type: 'skill', rarity: 'legendary', version: 'v1.0',
        description: 'Ultimate assassination technique.', skillType: 'burst',
        cooldown: 5, scaling: { stat: 'atk', multiplier: 7.0 }, effect: 'Ignores target defense.'
    },

    // ============================================
    // JOB CORES (Examples)
    // ============================================
    'core_dark_knight': {
        id: 'core_dark_knight', name: 'Heart of the Abyss', type: 'job_core', rarity: 'legendary', version: 'v1.0',
        description: 'Unlocks the secret Dark Knight evolution path for Knights.',
        unlocksJobId: 'dark_knight'
    }
};

// Help lists for logic filtering
export const GACHA_ITEMS = Object.values(GACHA_DATABASE);
