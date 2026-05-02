-- Epic RPG Database Seed Data
-- This file contains initial data for the game
-- Run this AFTER 03-functions.sql

-- =====================================================
-- SECTION 1: GAME CONFIG
-- =====================================================

INSERT INTO game_configs (version, is_active, config_data)
VALUES ('1.0.0', true, '{"description": "Official Launch"}')
ON CONFLICT (version) DO UPDATE SET is_active = EXCLUDED.is_active;

-- =====================================================
-- SECTION 2: JOBS
-- =====================================================

INSERT INTO jobs (id, version, name, tier, parent_job_id, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements)
VALUES
('novice', '1.0.0', 'Novice', 0, NULL,
 '{"hp": 1.0, "atk": 1.0, "def": 1.0, "matk": 1.0, "mdef": 1.0, "agi": 1.0}',
 '{"dagger", "sword"}',
 '[{"id": "basic_attack", "name": "Ataque Básico", "type": "active", "powerMod": 1.0, "cooldown": 0}, {"id": "first_aid", "name": "First Aid", "type": "active", "powerMod": 0.5, "cooldown": 2}]',
 '{}',
 '{"minLevel": 1, "currencyCost": 0, "materials": []}'),

('swordman', '1.0.0', 'Swordman', 1, 'novice',
 '{"hp": 1.2, "atk": 1.15, "def": 1.1, "matk": 0.8, "mdef": 0.9, "agi": 1.0}',
 '{"sword", "dagger"}',
 '[{"id": "bash", "name": "Bash", "type": "active", "powerMod": 1.5, "cooldown": 1}, {"id": "taunt", "name": "Provocar", "type": "active", "powerMod": 0, "cooldown": 3}]',
 '{"HP Recovery+10%"}',
 '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),

('knight', '1.0.0', 'Knight', 2, 'swordman',
 '{"hp": 1.5, "atk": 1.3, "def": 1.4, "matk": 0.7, "mdef": 1.0, "agi": 0.9}',
 '{"sword"}',
 '[{"id": "bowling_bash", "name": "Bowling Bash", "type": "active", "powerMod": 3.0, "cooldown": 3}, {"id": "shield_bash", "name": "Shield Bash", "type": "active", "powerMod": 2.0, "cooldown": 2}]',
 '{"Spear Mastery"}',
 '{"minLevel": 40, "currencyCost": 5000, "materials": [], "requiredJobCore": "core_knight"}'),

('mage', '1.0.0', 'Mage', 1, 'novice',
 '{"hp": 0.8, "atk": 0.7, "def": 0.8, "matk": 1.4, "mdef": 1.3, "agi": 0.9}',
 '{"staff", "dagger"}',
 '[{"id": "fire_bolt", "name": "Fire Bolt", "type": "active", "powerMod": 1.8, "cooldown": 1}, {"id": "ice_arrow", "name": "Ice Arrow", "type": "active", "powerMod": 1.5, "cooldown": 2}]',
 '{}',
 '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),

('wizard', '1.0.0', 'Wizard', 2, 'mage',
  '{"hp": 0.7, "atk": 0.6, "def": 0.7, "matk": 1.8, "mdef": 1.5, "agi": 0.8}',
  '{"staff"}',
  '[{"id": "meteor", "name": "Meteor", "type": "active", "powerMod": 4.0, "cooldown": 5}]',
  '{"SP Recovery+10%"}',
  '{"minLevel": 40, "currencyCost": 5000, "materials": [], "requiredJobCore": "core_wizard"}'),

-- Tier 3 Jobs (Level 70+)
('paladin', '1.0.0', 'Paladin', 3, 'knight',
  '{"hp": 1.8, "atk": 1.2, "def": 1.6, "matk": 0.9, "mdef": 1.3, "agi": 0.8}',
  '{"sword", "mace"}',
  '[{"id": "holy_shield", "name": "Holy Shield", "type": "active", "powerMod": 2.0, "cooldown": 4}, {"id": "divine_heal", "name": "Divine Heal", "type": "active", "powerMod": 3.0, "cooldown": 3}]',
  '{"Holy Resistance+20%", "Heal Bonus+15%"}',
  '{"minLevel": 70, "currencyCost": 15000, "materials": [], "requiredJobCore": "core_paladin"}'),

('crusader', '1.0.0', 'Crusader', 3, 'knight',
  '{"hp": 2.0, "atk": 1.4, "def": 1.5, "matk": 0.6, "mdef": 1.0, "agi": 0.7}',
  '{"sword", "spear"}',
  '[{"id": "grand_cross", "name": "Grand Cross", "type": "active", "powerMod": 3.5, "cooldown": 5}, {"id": "defender", "name": "Defender", "type": "passive", "powerMod": 0, "cooldown": 0}]',
  '{"Physical Damage Reduction+10%"}',
  '{"minLevel": 70, "currencyCost": 15000, "materials": [], "requiredJobCore": "core_crusader"}'),

('sage', '1.0.0', 'Sage', 3, 'wizard',
  '{"hp": 0.8, "atk": 0.5, "def": 0.6, "matk": 2.2, "mdef": 1.8, "agi": 0.9}',
  '{"staff", "book"}',
  '[{"id": "lord_of_vermin", "name": "Lord of Vermin", "type": "active", "powerMod": 5.0, "cooldown": 6}, {"id": "stone_curse", "name": "Stone Curse", "type": "active", "powerMod": 0, "cooldown": 4}]',
  '{"SP Cost-15%", "Status Effect Chance+10%"}',
  '{"minLevel": 70, "currencyCost": 15000, "materials": [], "requiredJobCore": "core_sage"}'),

('archmage', '1.0.0', 'Archmage', 3, 'wizard',
  '{"hp": 0.6, "atk": 0.5, "def": 0.5, "matk": 2.5, "mdef": 1.6, "agi": 1.0}',
  '{"staff"}',
  '[{"id": "storm_gust", "name": "Storm Gust", "type": "active", "powerMod": 4.5, "cooldown": 5}, {"id": "magic_rock", "name": "Magic Rock", "type": "passive", "powerMod": 0, "cooldown": 0}]',
  '{"MATK+10%", "Frost Damage+20%"}',
  '{"minLevel": 70, "currencyCost": 15000, "materials": [], "requiredJobCore": "core_archmage"}'),

-- Tier 4 Jobs (Level 90+ Endgame)
('arch_paladin', '1.0.0', 'Arch Paladin', 4, 'paladin',
  '{"hp": 2.2, "atk": 1.3, "def": 2.0, "matk": 1.0, "mdef": 1.5, "agi": 0.7}',
  '{"sword", "mace"}',
  '[{"id": "sanctuary", "name": "Sanctuary", "type": "active", "powerMod": 6.0, "cooldown": 7}, {"id": "divine_protection", "name": "Divine Protection", "type": "passive", "powerMod": 0, "cooldown": 0}]',
  '{"All Healing+25%", "Holy Damage+15%"}',
  '{"minLevel": 90, "currencyCost": 50000, "materials": [], "requiredJobCore": "core_arch_paladin"}'),

('grand_archmage', '1.0.0', 'Grand Archmage', 4, 'sage',
  '{"hp": 0.7, "atk": 0.4, "def": 0.5, "matk": 3.0, "mdef": 2.0, "agi": 1.1}',
  '{"staff", "book"}',
  '[{"id": "meteor_storm", "name": "Meteor Storm", "type": "active", "powerMod": 7.0, "cooldown": 8}, {"id": "magic_mastery", "name": "Magic Mastery", "type": "passive", "powerMod": 0, "cooldown": 0}]',
  '{"All Magic Damage+20%", "SP Recovery+15%"}',
  '{"minLevel": 90, "currencyCost": 50000, "materials": [], "requiredJobCore": "core_grand_archmage"}');

-- =====================================================
-- SECTION 3: SKILLS
-- =====================================================

INSERT INTO skills (id, version, name, description, cooldown, effect, scaling, rarity)
VALUES
('skill_heal', '1.0.0', 'Curar', 'Restaura HP', 2, '{"heal": 2.5}', '{"stat": "matk", "mult": 2.5}', 'rare'),
('skill_meteor', '1.0.0', 'Meteoro', 'Daño masivo', 4, '{"damage": 4.0}', '{"stat": "matk", "mult": 4.0}', 'epic'),
('skill_fire_bolt', '1.0.0', 'Fire Bolt', 'Daño de fuego', 1, '{"damage": 2.0, "scaling": "matk"}', '{"stat": "matk", "mult": 2.0}', 'common'),
('skill_ice_spike', '1.0.0', 'Ice Spike', 'Daño de hielo + lento', 3, '{"damage": 2.5, "scaling": "matk", "status": "slow", "chance": 0.5}', '{"stat": "matk", "mult": 2.5}', 'rare'),
('skill_shadow_strike', '1.0.0', 'Shadow Strike', 'Daño oscuro crítico', 3, '{"damage": 3.5, "scaling": "atk"}', '{"stat": "atk", "mult": 3.5}', 'epic'),
('skill_thunder', '1.0.0', 'Thunder', 'Daño de rayo a todos', 5, '{"damage": 2.0, "scaling": "matk", "target": "all_enemies"}', '{"stat": "matk", "mult": 2.0}', 'epic'),
('skill_poison_blast', '1.0.0', 'Poison Blast', 'Daño poison', 2, '{"damage": 1.5, "scaling": "matk", "status": "poison", "chance": 0.7}', '{"stat": "matk", "mult": 1.5}', 'rare'),
('skill_shield_bash', '1.0.0', 'Shield Bash', 'Daño + aturdir', 3, '{"damage": 2.0, "scaling": "atk", "status": "stun", "chance": 0.3}', '{"stat": "atk", "mult": 2.0}', 'rare'),
('skill_blessing', '1.0.0', 'Blessing', 'Buff de ataque', 4, '{"buff": "atk", "multiplier": 1.3, "duration": 3}', '{"stat": "matk", "mult": 0}', 'rare'),
('skill_rejuvenate', '1.0.0', 'Rejuvenate', 'Cura continua', 5, '{"dot": "heal", "power": 1.0, "duration": 3, "scaling": "matk"}', '{"stat": "matk", "mult": 1.0}', 'epic');

-- =====================================================
-- SECTION 4: CARDS
-- =====================================================

INSERT INTO cards (id, version, name, rarity, effect_type, effect_value, applicable_jobs)
VALUES
('card_goblin', '1.0.0', 'Goblin Card', 'common', 'statBoost', '{"atk": 0.10}', '{"ALL"}'),
('card_zombie', '1.0.0', 'Zombie Card', 'common', 'statBoost', '{"hp": 0.15}', '{"ALL"}'),
('card_baphomet', '1.0.0', 'Baphomet Card', 'legendary', 'skillModifier', '{"all_skill_mult": 1.5}', '{"ALL"}');

-- =====================================================
-- SECTION 5: WEAPONS
-- =====================================================

INSERT INTO weapons (id, version, name, weapon_type, rarity, stat_bonuses, special_effects)
VALUES
('wpn_blade', '1.0.0', 'Iron Blade', 'sword', 'common', '{"atk": 50, "def": 5}', '{}'),
('wpn_wand', '1.0.0', 'Apprentice Wand', 'staff', 'common', '{"matk": 60, "mdef": 10}', '{}'),
('wpn_murasame', '1.0.0', 'Murasame', 'sword', 'epic', '{"atk": 250, "agi": 40}', '{"bleed": 0.25}');

-- =====================================================
-- SECTION 6: JOB CORES
-- =====================================================

INSERT INTO job_cores (id, version, name, rarity, unlocks_job_id)
VALUES
    ('core_knight', '1.0.0', 'Knight Core', 'epic', 'knight'),
    ('core_wizard', '1.0.0', 'Wizard Core', 'epic', 'wizard'),
    -- Tier 3 Job Cores
    ('core_paladin', '1.0.0', 'Paladin Core', 'legendary', 'paladin'),
    ('core_crusader', '1.0.0', 'Crusader Core', 'legendary', 'crusader'),
    ('core_sage', '1.0.0', 'Sage Core', 'legendary', 'sage'),
    ('core_archmage', '1.0.0', 'Archmage Core', 'legendary', 'archmage'),
    -- Tier 4 Job Cores (Endgame)
    ('core_arch_paladin', '1.0.0', 'Arch Paladin Core', 'mythic', 'arch_paladin'),
    ('core_grand_archmage', '1.0.0', 'Grand Archmage Core', 'mythic', 'grand_archmage');

-- =====================================================
-- SECTION 7: NEW SKILL SYSTEM (Modular/Combo)
-- =====================================================

-- Tags
INSERT INTO tags (name) VALUES
    ('burn'), ('poison'), ('freeze'), ('stun'), ('sleep'),
    ('crit'), ('aoe'), ('chain'), ('heal'), ('shield'),
    ('buff'), ('debuff'), ('self_buff'), ('drain')
ON CONFLICT (name) DO NOTHING;

-- Triggers
INSERT INTO triggers (name) VALUES
    ('on_hit'), ('on_crit'), ('on_kill'), ('on_skill_use'), ('on_damage_taken'), ('on_death')
ON CONFLICT (name) DO NOTHING;

-- Effects
INSERT INTO effects (type, value, duration, extra) VALUES
    ('damage', 50, NULL, '{"scaling": "atk"}'::jsonb),
    ('heal', 30, NULL, '{"scaling": "matk"}'::jsonb),
    ('apply_status', NULL, 3, '{"status": "burn", "chance": 0.5}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "poison", "chance": 0.6}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "stun", "chance": 0.3}'::jsonb),
    ('shield', 20, 2, NULL),
    ('buff', NULL, 3, '{"stat": "atk", "multiplier": 1.3}'::jsonb),
    ('debuff', NULL, 2, '{"stat": "def", "multiplier": 0.7}'::jsonb),
    ('drain', 10, NULL, '{"heal_percent": 0.5}'::jsonb),
    ('explode', 100, NULL, '{"radius": 2}'::jsonb),
    ('reduce_cooldown', -1, NULL, NULL),
    ('boost_crit', 50, 2, NULL)
ON CONFLICT DO NOTHING;

-- Skill Modules
INSERT INTO skill_modules (version, name, description, base_power, cooldown, tags) VALUES
    ('1.0.0', 'Basic Attack', 'Basic melee attack', 15, 0, ARRAY['crit']),
    ('1.0.0', 'Fire Strike', 'Fire attack that applies burn', 25, 2, ARRAY['burn', 'aoe']),
    ('1.0.0', 'Ice Spike', 'Ice attack that may freeze', 20, 2, ARRAY['freeze', 'aoe']),
    ('1.0.0', 'Thunder', 'Lightning damage to all enemies', 30, 3, ARRAY['aoe']),
    ('1.0.0', 'Poison Dagger', 'Poisoned blade', 15, 1, ARRAY['poison', 'debuff']),
    ('1.0.0', 'Healing Light', 'Restore HP to ally', 35, 3, ARRAY['heal']),
    ('1.0.0', 'Shield Bash', 'Stun with shield', 20, 2, ARRAY['stun', 'shield']),
    ('1.0.0', 'Berserk', 'Boost attack, lower defense', 40, 4, ARRAY['buff', 'self_buff', 'debuff']),
    ('1.0.0', 'Chain Lightning', 'Chain attack hits multiple targets', 25, 2, ARRAY['chain', 'aoe']),
    ('1.0.0', 'Vampire Bite', 'Drain HP from enemy', 20, 2, ARRAY['drain', 'crit']),
    ('1.0.0', 'Holy Smite', 'Holy damage, bonus vs evil', 35, 3, ARRAY['aoe']),
    ('1.0.0', 'Focus Shot', 'High crit chance critical hit', 30, 2, ARRAY['crit', 'chain']);

-- Job Skill Modules (skills available per job)
-- =====================================================
-- SECTION 7: INITIAL PLAYER ITEMS (Starter Pack)
-- =====================================================

-- These are template items that players can obtain
-- Using ON CONFLICT DO NOTHING to handle existing data

INSERT INTO weapons (id, version, name, weapon_type, rarity, stat_bonuses, special_effects)
VALUES 
    ('weapon_wooden_sword', '1.0.0', 'Espada de Madera', 'sword', 'common', '{"atk": 5}', NULL),
    ('weapon_iron_sword', '1.0.0', 'Espada de Hierro', 'sword', 'rare', '{"atk": 15}', NULL),
    ('weapon_staff_fire', '1.0.0', 'Bastón de Fuego', 'staff', 'rare', '{"matk": 20}', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cards (id, version, name, rarity, effect_type, effect_value, applicable_jobs)
VALUES
    ('card_power_up', '1.0.0', 'Poderío', 'common', 'damage', '{"power": 1.2}', ARRAY['swordman', 'knight', 'warrior']),
    ('card_fire_shield', '1.0.0', 'Escudo de Fuego', 'rare', 'buff', '{"power": 1.5, "duration": 3}', ARRAY['mage', 'wizard']),
    ('card_light_heal', '1.0.0', 'Luz Curativa', 'epic', 'heal', '{"power": 2.0, "chance": 0.3}', ARRAY['priest', 'acolyte'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (id, version, name, description, cooldown, effect, scaling, rarity)
VALUES
    ('skill_fireball', '1.0.0', 'Bola de Fuego', 'Lanza una bola de fuego al enemigo', 2, '{"type": "damage", "power": 1.5}', '{"stat": "matk", "mult": 1.5}', 'rare'),
    ('skill_heal', '1.0.0', 'Curación', 'Restaura HP a un aliado', 3, '{"type": "heal", "power": 1.0}', '{"stat": "mdef", "mult": 2.0}', 'rare'),
    ('skill_power_strike', '1.0.0', 'Golpe Poderoso', 'Golpe devastador', 1, '{"type": "damage", "power": 2.0, "chance": 0.2}', '{"stat": "atk", "mult": 1.8}', 'epic')
ON CONFLICT (id) DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index)
SELECT 'novice', sm.id, ROW_NUMBER() OVER () - 1
FROM skill_modules sm WHERE sm.name = 'Basic Attack'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index) VALUES
    ('swordman', (SELECT id FROM skill_modules WHERE name = 'Shield Bash'), 0),
    ('swordman', (SELECT id FROM skill_modules WHERE name = 'Fire Strike'), 1),
    ('mage', (SELECT id FROM skill_modules WHERE name = 'Ice Spike'), 0),
    ('mage', (SELECT id FROM skill_modules WHERE name = 'Thunder'), 1),
    ('knight', (SELECT id FROM skill_modules WHERE name = 'Shield Bash'), 0),
    ('knight', (SELECT id FROM skill_modules WHERE name = 'Holy Smite'), 1),
    ('wizard', (SELECT id FROM skill_modules WHERE name = 'Fire Strike'), 0),
    ('wizard', (SELECT id FROM skill_modules WHERE name = 'Chain Lightning'), 1);