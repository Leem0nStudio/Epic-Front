-- Seeding Game Data (Version 1.0)

INSERT INTO game_data_versions (version_string, is_active) VALUES ('1.0.0', true);

-- 1. Job Definitions
INSERT INTO job_definitions (id, name, tier, parent_job_id, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements, version_id)
VALUES
('novice', 'Novice', 0, NULL,
 '{"hp": 1.0, "atk": 1.0, "def": 1.0, "matk": 1.0, "mdef": 1.0, "agi": 1.0}',
 ARRAY['dagger', 'sword'],
 '[{"id": "bash", "name": "Bash", "type": "basic", "powerMod": 1.0, "description": "Basic physical attack."}]',
 ARRAY['Play Dead: Can avoid combat once per stage.'],
 '{"minLevel": 1, "materials": [], "currencyCost": 0}', 1),

('swordman', 'Swordman', 1, 'novice',
 '{"hp": 1.2, "atk": 1.15, "def": 1.1, "matk": 0.8, "mdef": 0.9, "agi": 1.0}',
 ARRAY['sword', 'dagger'],
 '[{"id": "magnum_break", "name": "Magnum Break", "type": "active", "powerMod": 1.5, "description": "AoE Fire attack."}, {"id": "provoke", "name": "Provoke", "type": "active", "powerMod": 0, "description": "Draws enemy aggro for 3 turns."}]',
 ARRAY['HP Recovery: Increases passive HP regen by 10%.'],
 '{"minLevel": 10, "materials": [], "currencyCost": 1000}', 1),

('knight', 'Knight', 2, 'swordman',
 '{"hp": 1.5, "atk": 1.3, "def": 1.4, "matk": 0.7, "mdef": 1.0, "agi": 0.9}',
 ARRAY['sword'],
 '[{"id": "bowling_bash", "name": "Bowling Bash", "type": "burst", "powerMod": 3.0, "description": "Massive AoE physical hit that knocks back enemies."}]',
 ARRAY['Peco Peco Ride: Mobility increased, allowing quicker turn priority.'],
 '{"minLevel": 40, "materials": [{"itemId": "iron_ore", "amount": 10}, {"itemId": "badge_of_courage", "amount": 1}], "currencyCost": 5000}', 1),

('rune_knight', 'Rune Knight', 3, 'knight',
 '{"hp": 2.0, "atk": 1.8, "def": 1.6, "matk": 1.2, "mdef": 1.3, "agi": 1.1}',
 ARRAY['sword'],
 '[{"id": "dragon_breath", "name": "Dragon Breath", "type": "ultimate", "powerMod": 5.0, "description": "Ultimate fire damage calculated based on current HP."}]',
 ARRAY['Rune Mastery: Can use magic combat runes to buff the party.'],
 '{"minLevel": 70, "materials": [{"itemId": "rare_dragon_scale", "amount": 5}, {"itemId": "heroic_emblem", "amount": 1}], "currencyCost": 50000}', 1),

('mage', 'Mage', 1, 'novice',
 '{"hp": 0.8, "atk": 0.7, "def": 0.8, "matk": 1.4, "mdef": 1.3, "agi": 0.9}',
 ARRAY['staff', 'dagger'],
 '[{"id": "fire_bolt", "name": "Fire Bolt", "type": "active", "powerMod": 1.8, "description": "Calls down bolts of fire from the sky."}]',
 ARRAY['SP Recovery: Increases mana regeneration per turn.'],
 '{"minLevel": 10, "materials": [], "currencyCost": 1000}', 1),

('wizard', 'Wizard', 2, 'mage',
 '{"hp": 0.85, "atk": 0.6, "def": 0.8, "matk": 1.8, "mdef": 1.5, "agi": 1.0}',
 ARRAY['staff'],
 '[{"id": "storm_gust", "name": "Storm Gust", "type": "burst", "powerMod": 3.5, "description": "Massive AoE blizzard that can freeze targets."}]',
 ARRAY['Area Magic Mastery: Cast times for AoE spells reduced by 20%.'],
 '{"minLevel": 40, "materials": [{"itemId": "magic_crystal", "amount": 10}, {"itemId": "spellbook_page", "amount": 5}], "currencyCost": 5000}', 1),

('warlock', 'Warlock', 3, 'wizard',
 '{"hp": 1.0, "atk": 0.5, "def": 1.0, "matk": 2.5, "mdef": 2.0, "agi": 1.1}',
 ARRAY['staff'],
 '[{"id": "comet", "name": "Comet", "type": "ultimate", "powerMod": 6.0, "description": "Devastating cosmic ultimate attack that burns enemies."}]',
 ARRAY['Reading Spellbook: Can store magic spells for instant cast out of turn.'],
 '{"minLevel": 70, "materials": [{"itemId": "rare_meteor_fragment", "amount": 5}, {"itemId": "ancient_grimoire", "amount": 1}], "currencyCost": 50000}', 1);

-- 2. Item Definitions
INSERT INTO item_definitions (id, name, description, type, rarity, stats, special_effects, config, version_id)
VALUES
-- Cards (10 required)
('card_goblin', 'Goblin Card', 'Increases physical damage by 10%.', 'card', 'common', '{"atk": 0.10}', NULL, '{"effectType": "statBoost", "applicableJobs": ["ALL"]}', 1),
('card_zombie', 'Zombie Card', 'Increases Max HP by 15%.', 'card', 'common', '{"hp": 0.15}', NULL, '{"effectType": "statBoost", "applicableJobs": ["ALL"]}', 1),
('card_elder_willow', 'Elder Willow Card', 'Magic Attack +10%.', 'card', 'common', '{"matk": 0.10}', NULL, '{"effectType": "statBoost", "applicableJobs": ["mage", "wizard", "warlock"]}', 1),
('card_skeleton', 'Skeleton Worker Card', 'Increases physical damage against medium targets by 20%.', 'card', 'rare', '{"damage_medium": 0.20}', NULL, '{"effectType": "conditionalEffect", "applicableJobs": ["swordman", "knight", "rune_knight"]}', 1),
('card_pecopeco', 'Peco Peco Card', 'HP +25%.', 'card', 'rare', '{"hp": 0.25}', NULL, '{"effectType": "statBoost", "applicableJobs": ["ALL"]}', 1),
('card_vampire', 'Vampire Bat Card', '10% chance to drain 5% HP on basic attacks.', 'card', 'rare', '{"lifesteal_chance": 0.10}', NULL, '{"effectType": "conditionalEffect", "applicableJobs": ["ALL"]}', 1),
('card_ghost', 'Ghostring Card', 'Chance to evade physical attacks (15%).', 'card', 'epic', '{"evasion": 0.15}', NULL, '{"effectType": "conditionalEffect", "applicableJobs": ["ALL"]}', 1),
('card_hydra', 'Hydra Card', 'Damage to Demihuman targets +20%.', 'card', 'epic', '{"damage_demihuman": 0.20}', NULL, '{"effectType": "conditionalEffect", "applicableJobs": ["ALL"]}', 1),
('card_baphomet', 'Baphomet Card', 'Basic attacks hit all enemies in a 3x3 area.', 'card', 'legendary', '{"basic_attack_aoe": 1}', NULL, '{"effectType": "skillModifier", "applicableJobs": ["ALL"]}', 1),
('card_valkyrie', 'Valkyrie Randgris Card', 'Physical Attack +10%, makes attacks un-interruptible.', 'card', 'legendary', '{"atk": 0.10}', NULL, '{"effectType": "skillModifier", "applicableJobs": ["ALL"]}', 1),

-- Weapons (5 required)
('wpn_blade', 'Iron Blade', 'A standard iron sword.', 'weapon', 'common', '{"atk": 50, "def": 5}', NULL, '{"weaponCategory": "sword"}', 1),
('wpn_wand', 'Apprentice Wand', 'A magical wooden catalyst.', 'weapon', 'common', '{"matk": 60, "mdef": 10}', NULL, '{"weaponCategory": "staff"}', 1),
('wpn_crimson_bow', 'Crimson Bow', 'A bow burning with fire element.', 'weapon', 'rare', '{"atk": 120, "agi": 20}', ARRAY['Fire Element attacks'], '{"weaponCategory": "bow"}', 1),
('wpn_murasame', 'Murasame', 'A cursed katana that causes bleeding.', 'weapon', 'epic', '{"atk": 250, "agi": 40}', ARRAY['Attacks have a 25% chance to cause Bleed.'], '{"weaponCategory": "sword"}', 1),
('wpn_staff_of_destruction', 'Staff of Destruction', 'A staff containing chaotic magic.', 'weapon', 'legendary', '{"matk": 400}', ARRAY['Reduces cast time of Burst skills by 50%.'], '{"weaponCategory": "staff"}', 1),

-- Materials for Evolution
('iron_ore', 'Hierro en Bruto', 'Material básico de forja.', 'material', 'common', NULL, NULL, '{}', 1),
('badge_of_courage', 'Insignia de Valor', 'Otorgada a guerreros prometedores.', 'material', 'rare', NULL, NULL, '{}', 1),
('magic_crystal', 'Cristal Mágico', 'Gema que vibra con energía.', 'material', 'common', NULL, NULL, '{}', 1),
('spellbook_page', 'Página de Hechizo', 'Contiene fórmulas arcanas.', 'material', 'rare', NULL, NULL, '{}', 1),
('rare_dragon_scale', 'Escama de Dragón', 'Extremadamente dura y valiosa.', 'material', 'epic', NULL, NULL, '{}', 1),
('heroic_emblem', 'Emblema Heroico', 'Prueba de grandes hazañas.', 'material', 'legendary', NULL, NULL, '{}', 1),
('rare_meteor_fragment', 'Fragmento de Meteoro', 'Roca estelar con poder cósmico.', 'material', 'epic', NULL, NULL, '{}', 1),
('ancient_grimoire', 'Grimorio Antiguo', 'Conocimiento prohibido.', 'material', 'legendary', NULL, NULL, '{}', 1),

-- Skills (5 required)
('skill_double_strafe', 'Double Strafe', 'Fires two quick shots.', 'skill', 'common', NULL, ARRAY['Fires two quick shots.'], '{"skillType": "active", "cooldown": 1, "scaling": {"stat": "atk", "multiplier": 1.8}}', 1),
('skill_heal', 'Heal', 'Restores HP to a target.', 'skill', 'rare', NULL, ARRAY['Restores HP to a target.'], '{"skillType": "active", "cooldown": 2, "scaling": {"stat": "matk", "multiplier": 2.5}}', 1),
('skill_meteor_strike', 'Meteor Strike', 'Devastating fiery strike.', 'skill', 'epic', NULL, ARRAY['Stuns target on critical hit.'], '{"skillType": "burst", "cooldown": 4, "scaling": {"stat": "atk", "multiplier": 4.0}}', 1),
('skill_energy_coat', 'Energy Coat', 'Reduces incoming physical damage.', 'skill', 'epic', NULL, ARRAY['Reduces damage by converting SP to HP buffer.'], '{"skillType": "passive", "cooldown": 0, "scaling": {"stat": "matk", "multiplier": 0.5}}', 1),
('skill_cross_impact', 'Cross Impact', 'Ultimate assassination technique.', 'skill', 'legendary', NULL, ARRAY['Ignores target defense.'], '{"skillType": "burst", "cooldown": 5, "scaling": {"stat": "atk", "multiplier": 7.0}}', 1),

-- Job Cores
('core_dark_knight', 'Heart of the Abyss', 'Unlocks the secret Dark Knight evolution path.', 'job_core', 'legendary', NULL, NULL, '{"unlocksJobId": "dark_knight"}', 1);
