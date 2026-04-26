-- Epic_seed.sql
-- Consolidated seed data for the RPG system

-- 1. Game Config
INSERT INTO game_configs (version, is_active, config_data)
VALUES ('1.0.0', true, '{"description": "Official Launch"}')
ON CONFLICT (version) DO UPDATE SET is_active = EXCLUDED.is_active;

-- 2. Jobs
INSERT INTO jobs (id, version, name, tier, parent_job_id, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements)
VALUES
('novice', '1.0.0', 'Novice', 0, NULL, '{"hp": 1.0, "atk": 1.0, "def": 1.0, "matk": 1.0, "mdef": 1.0, "agi": 1.0}', '{"dagger", "sword"}', '[{"id": "first_aid", "name": "First Aid", "type": "active", "powerMod": 0.5}]', '{}', '{"minLevel": 1, "currencyCost": 0, "materials": []}'),
('swordman', '1.0.0', 'Swordman', 1, 'novice', '{"hp": 1.2, "atk": 1.15, "def": 1.1, "matk": 0.8, "mdef": 0.9, "agi": 1.0}', '{"sword", "dagger"}', '[{"id": "bash", "name": "Bash", "type": "active", "powerMod": 1.5}]', '{"HP Recovery+10%"}', '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),
('knight', '1.0.0', 'Knight', 2, 'swordman', '{"hp": 1.5, "atk": 1.3, "def": 1.4, "matk": 0.7, "mdef": 1.0, "agi": 0.9}', '{"sword"}', '[{"id": "bowling_bash", "name": "Bowling Bash", "type": "active", "powerMod": 3.0}]', '{"Spear Mastery"}', '{"minLevel": 40, "currencyCost": 5000, "materials": [], "requiredJobCore": "core_knight"}'),
('mage', '1.0.0', 'Mage', 1, 'novice', '{"hp": 0.8, "atk": 0.7, "def": 0.8, "matk": 1.4, "mdef": 1.3, "agi": 0.9}', '{"staff", "dagger"}', '[{"id": "fire_bolt", "name": "Fire Bolt", "type": "active", "powerMod": 1.8}]', '{}', '{"minLevel": 10, "currencyCost": 1000, "materials": []}');

-- 3. Skills (Gacha scrolls)
INSERT INTO skills (id, version, name, description, cooldown, effect, scaling, rarity)
VALUES
('skill_heal', '1.0.0', 'Curar', 'Restaura HP', 2, '{"heal": 2.5}', '{"stat": "matk", "mult": 2.5}', 'rare'),
('skill_meteor', '1.0.0', 'Meteoro', 'Daño masivo', 4, '{"damage": 4.0}', '{"stat": "matk", "mult": 4.0}', 'epic');

-- 4. Cards
INSERT INTO cards (id, version, name, rarity, effect_type, effect_target, effect_value, applicable_jobs)
VALUES
('card_goblin', '1.0.0', 'Goblin Card', 'common', 'statBoost', 'atk', '0.10', '{"ALL"}'),
('card_zombie', '1.0.0', 'Zombie Card', 'common', 'statBoost', 'hp', '0.15', '{"ALL"}'),
('card_baphomet', '1.0.0', 'Baphomet Card', 'legendary', 'skillModifier', 'aoe', '1', '{"ALL"}');

-- 5. Weapons
INSERT INTO weapons (id, version, name, weapon_type, rarity, stat_bonuses, special_effects)
VALUES
('wpn_blade', '1.0.0', 'Iron Blade', 'sword', 'common', '{"atk": 50, "def": 5}', '{}'),
('wpn_wand', '1.0.0', 'Apprentice Wand', 'staff', 'common', '{"matk": 60, "mdef": 10}', '{}'),
('wpn_murasame', '1.0.0', 'Murasame', 'sword', 'epic', '{"atk": 250, "agi": 40}', '{"bleed": 0.25}');

-- 6. Job Cores
INSERT INTO job_cores (id, version, name, rarity, unlocks_job_id)
VALUES
('core_knight', '1.0.0', 'Knight Core', 'epic', 'knight');
