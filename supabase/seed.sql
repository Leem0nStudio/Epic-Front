-- Fresh Seed Data for v1.0.0

-- 1. Game Config
INSERT INTO game_configs (version, is_active, config_data)
VALUES ('1.0.0', true, '{"description": "Lanzamiento Oficial"}')
ON CONFLICT DO NOTHING;

-- 2. Jobs
INSERT INTO jobs (id, version, name, tier, parent_job_id, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements)
VALUES
('novice', '1.0.0', 'Novice', 0, NULL, '{"hp": 1.0, "atk": 1.0, "def": 1.0, "matk": 1.0, "mdef": 1.0, "agi": 1.0}', '{"dagger", "sword"}', '[]', '{}', '{"minLevel": 1, "currencyCost": 0, "materials": []}'),
('swordman', '1.0.0', 'Swordman', 1, 'novice', '{"hp": 1.2, "atk": 1.15, "def": 1.1, "matk": 0.8, "mdef": 0.9, "agi": 1.0}', '{"sword", "dagger"}', '[]', '{}', '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),
('knight', '1.0.0', 'Knight', 2, 'swordman', '{"hp": 1.5, "atk": 1.3, "def": 1.4, "matk": 0.7, "mdef": 1.0, "agi": 0.9}', '{"sword"}', '[]', '{}', '{"minLevel": 40, "currencyCost": 5000, "materials": [{"itemId": "iron_ore", "amount": 10}]}'),
('rune_knight', '1.0.0', 'Rune Knight', 3, 'knight', '{"hp": 2.0, "atk": 1.8, "def": 1.6, "matk": 1.2, "mdef": 1.3, "agi": 1.1}', '{"sword"}', '[]', '{}', '{"minLevel": 70, "currencyCost": 50000, "materials": [{"itemId": "rare_scale", "amount": 5}]}'),
('mage', '1.0.0', 'Mage', 1, 'novice', '{"hp": 0.8, "atk": 0.7, "def": 0.8, "matk": 1.4, "mdef": 1.3, "agi": 0.9}', '{"staff", "dagger"}', '[]', '{}', '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),
('wizard', '1.0.0', 'Wizard', 2, 'mage', '{"hp": 0.85, "atk": 0.6, "def": 0.8, "matk": 1.8, "mdef": 1.5, "agi": 1.0}', '{"staff"}', '[]', '{}', '{"minLevel": 40, "currencyCost": 5000, "materials": [{"itemId": "magic_crystal", "amount": 10}]}'),
('warlock', '1.0.0', 'Warlock', 3, 'wizard', '{"hp": 1.0, "atk": 0.5, "def": 1.0, "matk": 2.5, "mdef": 2.0, "agi": 1.1}', '{"staff"}', '[]', '{}', '{"minLevel": 70, "currencyCost": 50000, "materials": [{"itemId": "rare_meteor", "amount": 5}]}'),
('crusader', '1.0.0', 'Crusader', 2, 'swordman', '{"hp": 1.6, "atk": 1.1, "def": 1.6, "matk": 1.1, "mdef": 1.3, "agi": 0.8}', '{"sword", "shield"}', '[]', '{}', '{"minLevel": 40, "currencyCost": 5000, "materials": [{"itemId": "holy_water", "amount": 10}]}'),
('royal_guard', '1.0.0', 'Royal Guard', 3, 'crusader', '{"hp": 2.2, "atk": 1.5, "def": 2.0, "matk": 1.4, "mdef": 1.6, "agi": 1.0}', '{"sword", "spear"}', '[]', '{}', '{"minLevel": 70, "currencyCost": 50000, "materials": [{"itemId": "divine_shield_fragment", "amount": 5}]}');

-- 3. Skills
INSERT INTO skills (id, version, name, description, cooldown, effect, scaling, rarity)
VALUES
('bash', '1.0.0', 'Bash', 'Single target strike', 1, '{"damage": 150}', '{"stat": "atk", "mult": 1.5}', 'common'),
('fire_bolt', '1.0.0', 'Fire Bolt', 'Fire magic strike', 1, '{"damage": 180}', '{"stat": "matk", "mult": 1.8}', 'common'),
('heal', '1.0.0', 'Heal', 'Restore HP', 2, '{"heal": 250}', '{"stat": "matk", "mult": 2.5}', 'rare');

-- 4. Cards
INSERT INTO cards (id, version, name, rarity, effect_type, effect_value, applicable_jobs)
VALUES
('card_goblin', '1.0.0', 'Goblin Card', 'common', 'statBoost', '{"atk": 0.1}', '{"ALL"}'),
('card_zombie', '1.0.0', 'Zombie Card', 'common', 'statBoost', '{"hp": 0.15}', '{"ALL"}'),
('card_baphomet', '1.0.0', 'Baphomet Card', 'legendary', 'skillModifier', '{"aoe": 1}', '{"ALL"}');

-- 5. Weapons
INSERT INTO weapons (id, version, name, weapon_type, rarity, stat_bonuses, special_effects)
VALUES
('wpn_blade', '1.0.0', 'Iron Blade', 'sword', 'common', '{"atk": 50, "def": 5}', '{}'),
('wpn_wand', '1.0.0', 'Apprentice Wand', 'staff', 'common', '{"matk": 60, "mdef": 10}', '{}'),
('wpn_murasame', '1.0.0', 'Murasame', 'sword', 'epic', '{"atk": 250, "agi": 40}', '{"bleed": 0.25}');
