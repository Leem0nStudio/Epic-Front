-- =============================================
-- EPIC RPG - Complete Setup Script
-- Execute this in Supabase SQL Editor
-- =============================================

-- 1. DISABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE game_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE party DISABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE weapons DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_cores DISABLE ROW LEVEL SECURITY;

-- 2. ADD MISSING COLUMNS TO PLAYERS
-- =============================================
ALTER TABLE players ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- 3. CREATE CAMPAIGN TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    version TEXT,
    index_num INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    description TEXT,
    unlock_requirements JSONB
);

CREATE TABLE IF NOT EXISTS stages (
    id TEXT PRIMARY KEY,
    chapter_id TEXT,
    version TEXT,
    index_num INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    description TEXT,
    energy_cost INTEGER DEFAULT 5,
    enemies JSONB NOT NULL DEFAULT '[]'::jsonb,
    rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
    first_clear_rewards JSONB,
    star_conditions JSONB,
    unlock_requirements JSONB
);

-- 4. INSERT GAME CONFIG
-- =============================================
INSERT INTO game_configs (version, is_active, config_data)
VALUES ('1.0.0', true, '{"description": "Official Launch"}')
ON CONFLICT (version) DO UPDATE SET is_active = true;

-- 5. INSERT SEED DATA (Jobs)
-- =============================================
INSERT INTO jobs (id, version, name, tier, parent_job_id, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements) VALUES
('novice', '1.0.0', 'Novice', 0, NULL, '{"hp": 1.0, "atk": 1.0, "def": 1.0, "matk": 1.0, "mdef": 1.0, "agi": 1.0}', '{"dagger", "sword"}', '[{"id": "first_aid", "name": "First Aid", "type": "active", "powerMod": 0.5}]', '{}', '{"minLevel": 1, "currencyCost": 0, "materials": []}'),
('swordman', '1.0.0', 'Swordman', 1, 'novice', '{"hp": 1.2, "atk": 1.15, "def": 1.1, "matk": 0.8, "mdef": 0.9, "agi": 1.0}', '{"sword", "dagger"}', '[{"id": "bash", "name": "Bash", "type": "active", "powerMod": 1.5}]', '{"HP Recovery+10%"}', '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),
('mage', '1.0.0', 'Mage', 1, 'novice', '{"hp": 0.8, "atk": 0.7, "def": 0.8, "matk": 1.4, "mdef": 1.3, "agi": 0.9}', '{"staff", "dagger"}', '[{"id": "fire_bolt", "name": "Fire Bolt", "type": "active", "powerMod": 1.8}]', '{}', '{"minLevel": 10, "currencyCost": 1000, "materials": []}')
ON CONFLICT (id) DO NOTHING;

-- 6. INSERT SEED DATA (Skills)
-- =============================================
INSERT INTO skills (id, version, name, description, cooldown, effect, scaling, rarity) VALUES
('skill_heal', '1.0.0', 'Curar', 'Restaura HP', 2, '{"heal": 2.5}', '{"stat": "matk", "mult": 2.5}', 'rare'),
('skill_meteor', '1.0.0', 'Meteoro', 'Daño masivo', 4, '{"damage": 4.0}', '{"stat": "matk", "mult": 4.0}', 'epic')
ON CONFLICT (id) DO NOTHING;

-- 7. INSERT SEED DATA (Cards)
-- =============================================
INSERT INTO cards (id, version, name, rarity, effect_type, effect_value, applicable_jobs) VALUES
('card_goblin', '1.0.0', 'Goblin Card', 'common', 'statBoost', '0.10', '{"ALL"}'),
('card_zombie', '1.0.0', 'Zombie Card', 'common', 'statBoost', '0.15', '{"ALL"}')
ON CONFLICT (id) DO NOTHING;

-- 8. INSERT SEED DATA (Weapons)
-- =============================================
INSERT INTO weapons (id, version, name, weapon_type, rarity, stat_bonuses, special_effects) VALUES
('wpn_blade', '1.0.0', 'Iron Blade', 'sword', 'common', '{"atk": 50, "def": 5}', '{}'),
('wpn_wand', '1.0.0', 'Apprentice Wand', 'staff', 'common', '{"matk": 60, "mdef": 10}', '{}')
ON CONFLICT (id) DO NOTHING;

-- 9. INSERT CAMPAIGN CHAPTER 1
-- =============================================
INSERT INTO chapters (id, version, index_num, name, description) VALUES
('chapter_1', '1.0.0', 1, 'Praderas del Destino', 'El comienzo de tu aventura en las tierras de Etherea.')
ON CONFLICT (id) DO NOTHING;

-- 10. INSERT CAMPAIGN STAGES
-- =============================================
INSERT INTO stages (id, chapter_id, version, index_num, name, description, energy_cost, enemies, rewards, first_clear_rewards, star_conditions) VALUES
('stage_1_1', 'chapter_1', '1.0.0', 1, 'El Camino Real', 'Un sendero tranquilo... o eso parecía.', 5,
'[{"id": "slime_1", "name": "Limo Débil", "level": 1, "position": 0, "skillIds": ["basic_attack"]}, {"id": "slime_2", "name": "Limo Débil", "level": 1, "position": 1, "skillIds": ["basic_attack"]}]',
'{"currency": 100, "exp": 50, "materials": [{"itemId": "mat_slime_jelly", "amount": 1, "chance": 0.5}]}',
'{"currency": 500, "premium_currency": 20, "exp": 100, "materials": [{"itemId": "mat_slime_jelly", "amount": 3, "chance": 1.0}]}',
'[{"type": "win", "description": "Completa la etapa"}, {"type": "no_deaths", "description": "Sin bajas"}, {"type": "turn_limit", "value": 10, "description": "Menos de 10 turnos"}]'),

('stage_1_2', 'chapter_1', '1.0.0', 2, 'Bosque Susurrante', 'Los árboles guardan secretos peligrosos.', 6,
'[{"id": "bat_1", "name": "Murciélago", "level": 2, "position": 0, "skillIds": ["basic_attack"]}, {"id": "slime_1", "name": "Limo Pegajoso", "level": 2, "position": 1, "skillIds": ["debuff_slow"]}, {"id": "bat_2", "name": "Murciélago", "level": 2, "position": 3, "skillIds": ["basic_attack"]}]',
'{"currency": 150, "exp": 80, "materials": [{"itemId": "mat_bat_wing", "amount": 1, "chance": 0.4}]}',
'{"currency": 800, "premium_currency": 30, "exp": 150, "materials": [{"itemId": "mat_bat_wing", "amount": 2, "chance": 1.0}]}',
'[{"type": "win", "description": "Completa la etapa"}, {"type": "no_deaths", "description": "Sin bajas"}, {"type": "turn_limit", "value": 10, "description": "Menos de 10 turnos"}]'),

('stage_1_3', 'chapter_1', '1.0.0', 3, 'Ruinas de la Atalaya', 'Ecos de batallas pasadas aún resuenan aquí.', 6,
'[{"id": "skeleton_1", "name": "Esqueleto Guerrero", "level": 3, "position": 0, "skillIds": ["basic_attack", "taunt"]}, {"id": "skeleton_2", "name": "Esqueleto Guerrero", "level": 3, "position": 2, "skillIds": ["basic_attack", "taunt"]}, {"id": "bat_1", "name": "Murciélago", "level": 3, "position": 4, "skillIds": ["basic_attack"]}]',
'{"currency": 200, "exp": 120, "materials": [{"itemId": "mat_bone_frag", "amount": 1, "chance": 0.5}]}',
'{"currency": 1000, "premium_currency": 50, "exp": 200, "materials": [{"itemId": "mat_bone_frag", "amount": 3, "chance": 1.0}]}',
'[{"type": "win", "description": "Limpia las ruinas"}, {"type": "no_deaths", "description": "Sin bajas"}, {"type": "turn_limit", "value": 12, "description": "Menos de 12 turnos"}]')
ON CONFLICT (id) DO NOTHING;

-- 11. CREATE RPC FUNCTIONS
-- =============================================

-- rpc_initialize_player
CREATE OR REPLACE FUNCTION rpc_initialize_player(p_username TEXT, p_novices JSONB[])
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_novice JSONB;
    v_unit_id UUID;
    v_idx INTEGER := 0;
BEGIN
    INSERT INTO players (id, username, energy, max_energy, level, exp) VALUES (v_user_id, p_username, 20, 20, 1, 0)
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

    INSERT INTO gacha_state (player_id) VALUES (v_user_id)
    ON CONFLICT (player_id) DO NOTHING;

    DELETE FROM party WHERE player_id = v_user_id;
    DELETE FROM units WHERE player_id = v_user_id;

    FOREACH v_novice IN ARRAY p_novices LOOP
        INSERT INTO units (player_id, name, base_stats, growth_rates, affinity, trait, current_job_id, sprite_id, icon_id)
        VALUES (v_user_id, v_novice->>'name', (v_novice->'baseStats'), (v_novice->'growthRates'), v_novice->>'affinity', v_novice->>'trait', 'novice', v_novice->>'spriteId', v_novice->>'iconId')
        RETURNING id INTO v_unit_id;

        INSERT INTO party (player_id, slot_index, unit_id)
        VALUES (v_user_id, v_idx, v_unit_id);

        v_idx := v_idx + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- rpc_pull_gacha
CREATE OR REPLACE FUNCTION rpc_pull_gacha(p_amount INTEGER, p_currency_type TEXT)
RETURNS TABLE(res_item_id TEXT, res_item_name TEXT, res_item_rarity TEXT, res_item_type TEXT) AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_cost_per_pull INTEGER;
    v_total_cost INTEGER;
    v_balance BIGINT;
    v_p_epic INTEGER;
    v_p_leg INTEGER;
    v_active_version TEXT;
    v_roll FLOAT;
    v_rarity TEXT;
    v_target_id TEXT;
    v_target_name TEXT;
    v_target_type TEXT;
BEGIN
    IF p_currency_type = 'premium' THEN
        v_cost_per_pull := 50;
        SELECT premium_currency INTO v_balance FROM players WHERE id = v_user_id;
    ELSE
        v_cost_per_pull := 100;
        SELECT currency INTO v_balance FROM players WHERE id = v_user_id;
    END IF;

    v_total_cost := CASE WHEN p_amount >= 10 THEN (p_amount - 1) * v_cost_per_pull ELSE p_amount * v_cost_per_pull END;

    IF v_balance < v_total_cost THEN RAISE EXCEPTION 'Moneda insuficiente'; END IF;

    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    SELECT pulls_since_epic, pulls_since_legendary INTO v_p_epic, v_p_leg FROM gacha_state WHERE player_id = v_user_id;

    FOR i IN 1..p_amount LOOP
        v_p_epic := v_p_epic + 1; v_p_leg := v_p_leg + 1;
        v_roll := random();
        IF v_p_leg >= 50 OR v_roll < 0.02 THEN v_rarity := 'legendary'; v_p_leg := 0; v_p_epic := 0;
        ELSIF v_p_epic >= 10 OR v_roll < 0.10 THEN v_rarity := 'epic'; v_p_epic := 0;
        ELSIF v_roll < 0.35 THEN v_rarity := 'rare';
        ELSE v_rarity := 'common';
        END IF;

        v_roll := random();
        IF v_rarity = 'legendary' AND random() < 0.15 THEN v_target_type := 'job_core';
        ELSIF v_roll < 0.4 THEN v_target_type := 'card';
        ELSIF v_roll < 0.7 THEN v_target_type := 'weapon';
        ELSE v_target_type := 'skill';
        END IF;

        IF v_target_type = 'card' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM cards WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'weapon' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM weapons WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'skill' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM skills WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSE
            SELECT id, name INTO v_target_id, v_target_name FROM job_cores WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        END IF;

        IF v_target_id IS NOT NULL THEN
            INSERT INTO inventory (player_id, item_id, item_type) VALUES (v_user_id, v_target_id, v_target_type)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + 1;
            
            res_item_id := v_target_id;
            res_item_name := v_target_name;
            res_item_rarity := v_rarity;
            res_item_type := v_target_type;
            RETURN NEXT;
        END IF;
    END LOOP;

    IF p_currency_type = 'premium' THEN
        UPDATE players SET premium_currency = premium_currency - v_total_cost WHERE id = v_user_id;
    ELSE
        UPDATE players SET currency = currency - v_total_cost WHERE id = v_user_id;
    END IF;

    UPDATE gacha_state SET pulls_since_epic = v_p_epic, pulls_since_legendary = v_p_leg, last_pull_at = NOW() WHERE player_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- rpc_complete_stage
CREATE OR REPLACE FUNCTION rpc_complete_stage(p_stage_id TEXT, p_stars INTEGER, p_turns INTEGER, p_rewards JSONB)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_material RECORD;
    v_exp_gain INTEGER;
    v_player_exp INTEGER;
    v_player_level INTEGER;
    v_next_level_exp INTEGER;
BEGIN
    INSERT INTO campaign_progress (player_id, stage_id, stars, best_turns)
    VALUES (v_user_id, p_stage_id, p_stars, p_turns)
    ON CONFLICT (player_id, stage_id) DO UPDATE SET
        stars = GREATEST(campaign_progress.stars, EXCLUDED.stars),
        best_turns = LEAST(COALESCE(campaign_progress.best_turns, 999), EXCLUDED.best_turns);

    UPDATE players
    SET currency = currency + COALESCE((p_rewards->>'currency')::BIGINT, 0),
        premium_currency = premium_currency + COALESCE((p_rewards->>'premium_currency')::INTEGER, 0)
    WHERE id = v_user_id;

    v_exp_gain := COALESCE((p_rewards->>'exp')::INTEGER, 0);
    IF v_exp_gain > 0 THEN
        SELECT COALESCE(exp, 0), COALESCE(level, 1) INTO v_player_exp, v_player_level FROM players WHERE id = v_user_id;
        v_player_exp := v_player_exp + v_exp_gain;
        v_next_level_exp := v_player_level * 100;

        IF v_player_exp >= v_next_level_exp THEN
            UPDATE players
            SET level = level + 1,
                exp = v_player_exp - v_next_level_exp,
                energy = max_energy
            WHERE id = v_user_id;
        ELSE
            UPDATE players SET exp = v_player_exp WHERE id = v_user_id;
        END IF;

        UPDATE units
        SET level = level + 1
        WHERE id IN (SELECT unit_id FROM party WHERE player_id = v_user_id);
    END IF;

    IF p_rewards->'materials' IS NOT NULL AND jsonb_array_length(p_rewards->'materials') > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(p_rewards->'materials') AS x("itemId" TEXT, amount INTEGER) LOOP
            INSERT INTO inventory (player_id, item_id, item_type, quantity)
            VALUES (v_user_id, v_material."itemId", 'material', v_material.amount)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + v_material.amount;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;