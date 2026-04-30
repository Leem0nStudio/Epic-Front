-- Epic RPG Database Functions & RPCs
-- This file contains all stored procedures and functions
-- Run this after schema.sql

-- =====================================================
-- SECTION 1: PLAYER INITIALIZATION
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_initialize_player(p_username TEXT, p_novices JSONB[])
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_novice JSONB;
    v_unit_id UUID;
    v_idx INTEGER := 0;
BEGIN
    INSERT INTO players (id, username, energy, max_energy) 
    VALUES (v_user_id, p_username, 20, 20)
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

    INSERT INTO gacha_state (player_id) 
    VALUES (v_user_id)
    ON CONFLICT (player_id) DO NOTHING;

    DELETE FROM party WHERE player_id = v_user_id;
    DELETE FROM units WHERE player_id = v_user_id;

    FOREACH v_novice IN ARRAY p_novices LOOP
        INSERT INTO units (player_id, name, base_stats, growth_rates, affinity, trait, current_job_id, sprite_id, icon_id)
        VALUES (v_user_id, v_novice->>'name', (v_novice->'baseStats'), (v_novice->'growthRates'), 
                v_novice->>'affinity', v_novice->>'trait', 'novice', v_novice->>'spriteId', v_novice->>'iconId')
        RETURNING id INTO v_unit_id;

        INSERT INTO party (player_id, slot_index, unit_id)
        VALUES (v_user_id, v_idx, v_unit_id);

        v_idx := v_idx + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 2: GACHA SYSTEM
-- =====================================================

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

    IF v_balance < v_total_cost THEN 
        RAISE EXCEPTION 'Moneda insuficiente'; 
    END IF;

    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    SELECT pulls_since_epic, pulls_since_legendary INTO v_p_epic, v_p_leg 
    FROM gacha_state WHERE player_id = v_user_id;

    FOR i IN 1..p_amount LOOP
        v_p_epic := v_p_epic + 1;
        v_p_leg := v_p_leg + 1;
        v_roll := random();
        
        IF v_p_leg >= 50 OR v_roll < 0.02 THEN 
            v_rarity := 'legendary'; 
            v_p_leg := 0; 
            v_p_epic := 0;
        ELSIF v_p_epic >= 10 OR v_roll < 0.10 THEN 
            v_rarity := 'epic'; 
            v_p_epic := 0;
        ELSIF v_roll < 0.35 THEN 
            v_rarity := 'rare';
        ELSE 
            v_rarity := 'common';
        END IF;

        v_roll := random();
        IF v_rarity = 'legendary' AND random() < 0.15 THEN 
            v_target_type := 'job_core';
        ELSIF v_roll < 0.4 THEN 
            v_target_type := 'card';
        ELSIF v_roll < 0.7 THEN 
            v_target_type := 'weapon';
        ELSE 
            v_target_type := 'skill';
        END IF;

        IF v_target_type = 'card' THEN
            SELECT id, name INTO v_target_id, v_target_name 
            FROM cards WHERE rarity = v_rarity AND version = v_active_version 
            ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'weapon' THEN
            SELECT id, name INTO v_target_id, v_target_name 
            FROM weapons WHERE rarity = v_rarity AND version = v_active_version 
            ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'skill' THEN
            SELECT id, name INTO v_target_id, v_target_name 
            FROM skills WHERE rarity = v_rarity AND version = v_active_version 
            ORDER BY random() LIMIT 1;
        ELSE -- job_core
            SELECT id, name INTO v_target_id, v_target_name 
            FROM job_cores WHERE rarity = v_rarity AND version = v_active_version 
            ORDER BY random() LIMIT 1;
        END IF;

        IF v_target_id IS NOT NULL THEN
            INSERT INTO inventory (player_id, item_id, item_type) 
            VALUES (v_user_id, v_target_id, v_target_type)
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

    UPDATE gacha_state 
    SET pulls_since_epic = v_p_epic, pulls_since_legendary = v_p_leg, last_pull_at = NOW() 
    WHERE player_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 3: UNIT EVOLUTION
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_evolve_unit(p_unit_id UUID, p_target_job_id TEXT)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_active_version TEXT;
    v_current_job_id TEXT;
    v_level INTEGER;
    v_reqs JSONB;
    v_parent_job_id TEXT;
    v_cost BIGINT;
    v_materials JSONB;
    v_material JSONB;
    v_core_id TEXT;
BEGIN
    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    SELECT current_job_id, level INTO v_current_job_id, v_level 
    FROM units WHERE id = p_unit_id AND player_id = v_user_id;
    
    IF NOT FOUND THEN 
        RAISE EXCEPTION 'Unidad no encontrada'; 
    END IF;

    SELECT evolution_requirements, parent_job_id INTO v_reqs, v_parent_job_id 
    FROM jobs WHERE id = p_target_job_id AND version = v_active_version;
    
    IF v_current_job_id IS DISTINCT FROM v_parent_job_id THEN 
        RAISE EXCEPTION 'Ruta de evolución incorrecta'; 
    END IF;
    
    IF v_level < (v_reqs->>'minLevel')::INTEGER THEN 
        RAISE EXCEPTION 'Nivel insuficiente'; 
    END IF;

    v_cost := (v_reqs->>'currencyCost')::BIGINT;
    v_materials := v_reqs->'materials';
    v_core_id := v_reqs->>'requiredJobCore';

    UPDATE players SET currency = currency - v_cost 
    WHERE id = v_user_id AND currency >= v_cost;
    
    IF NOT FOUND THEN 
        RAISE EXCEPTION 'Zeny insuficiente'; 
    END IF;

    IF v_materials IS NOT NULL AND jsonb_array_length(v_materials) > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(v_materials) AS x("itemId" TEXT, amount INTEGER) LOOP
            UPDATE inventory SET quantity = quantity - v_material.amount 
            WHERE player_id = v_user_id AND item_id = v_material."itemId" AND quantity >= v_material.amount;
            
            IF NOT FOUND THEN 
                RAISE EXCEPTION 'Materiales faltantes'; 
            END IF;
        END LOOP;
    END IF;

    IF v_core_id IS NOT NULL THEN
        UPDATE inventory SET quantity = quantity - 1 
        WHERE player_id = v_user_id AND item_id = v_core_id AND quantity >= 1;
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Se requiere el núcleo de trabajo'; 
        END IF;
    END IF;

    DELETE FROM inventory WHERE quantity <= 0;
    UPDATE units SET current_job_id = p_target_job_id, 
                     unlocked_jobs = array_append(unlocked_jobs, p_target_job_id) 
    WHERE id = p_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 4: ENERGY SYSTEM
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_regen_energy()
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_energy_per_tick INTEGER := 1;
    v_tick_interval INTERVAL := '6 minutes';
    v_now TIMESTAMP WITH TIME ZONE := NOW();
    v_last_regen TIMESTAMP WITH TIME ZONE;
    v_current_energy INTEGER;
    v_max_energy INTEGER;
    v_ticks_passed INTEGER;
    v_energy_to_add INTEGER;
BEGIN
    SELECT energy, max_energy, last_energy_regen
    INTO v_current_energy, v_max_energy, v_last_regen
    FROM players WHERE id = v_user_id;

    IF v_current_energy >= v_max_energy THEN
        UPDATE players SET last_energy_regen = v_now WHERE id = v_user_id;
        RETURN;
    END IF;

    v_ticks_passed := floor(extract(epoch from (v_now - v_last_regen)) / extract(epoch from v_tick_interval));

    IF v_ticks_passed > 0 THEN
        v_energy_to_add := v_ticks_passed * v_energy_per_tick;
        UPDATE players
        SET energy = LEAST(v_max_energy, v_current_energy + v_energy_to_add),
            last_energy_regen = v_last_regen + (v_ticks_passed * v_tick_interval)
        WHERE id = v_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_deduct_energy(p_cost INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    PERFORM rpc_regen_energy();
    UPDATE players
    SET energy = energy - p_cost
    WHERE id = v_user_id AND energy >= p_cost;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_refill_energy_with_gems(p_gem_cost INTEGER DEFAULT 50)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_gems BIGINT;
BEGIN
    SELECT premium_currency INTO v_current_gems FROM players WHERE id = v_user_id;
    
    IF v_current_gems < p_gem_cost THEN
        RAISE EXCEPTION 'Insufficient gems';
    END IF;
    
    UPDATE players
    SET premium_currency = premium_currency - p_gem_cost,
        energy = max_energy,
        last_energy_regen = NOW()
    WHERE id = v_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 5: CAMPAIGN & BATTLE
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_complete_stage(
    p_stage_id TEXT,
    p_stars INTEGER,
    p_turns INTEGER,
    p_rewards JSONB,
    p_participating_units UUID[] DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_material RECORD;
    v_exp_gain INTEGER;
    v_player_exp INTEGER;
    v_player_level INTEGER;
    v_next_level_exp INTEGER;
    v_unit_id UUID;
    v_unit_exp_gain INTEGER;
BEGIN
    -- Record stage completion
    INSERT INTO campaign_progress (player_id, stage_id, stars, best_turns)
    VALUES (v_user_id, p_stage_id, p_stars, p_turns)
    ON CONFLICT (player_id, stage_id) DO UPDATE SET
        stars = GREATEST(campaign_progress.stars, EXCLUDED.stars),
        best_turns = LEAST(COALESCE(campaign_progress.best_turns, 999), EXCLUDED.best_turns);
    
    -- 1. Apply Currency Rewards
    UPDATE players
    SET currency = currency + (p_rewards->>'currency')::BIGINT,
        premium_currency = premium_currency + COALESCE((p_rewards->>'premium_currency')::INTEGER, 0)
    WHERE id = v_user_id;
    
    -- 2. Apply Player EXP and Level Up
    v_exp_gain := COALESCE((p_rewards->>'exp')::INTEGER, 0);
    IF v_exp_gain > 0 THEN
        SELECT exp, level INTO v_player_exp, v_player_level FROM players WHERE id = v_user_id;
        v_player_exp := v_player_exp + v_exp_gain;
        v_next_level_exp := v_player_level * 100;
        
        IF v_player_exp >= v_next_level_exp THEN
            UPDATE players
            SET level = level + 1,
                exp = v_player_exp - v_next_level_exp,
                energy = max_energy -- Refill energy on level up
            WHERE id = v_user_id;
        ELSE
            UPDATE players SET exp = v_player_exp WHERE id = v_user_id;
        END IF;
    END IF;
    
    -- 3. Award EXP to Participating Units
    IF p_participating_units IS NOT NULL AND array_length(p_participating_units, 1) > 0 THEN
        v_unit_exp_gain := 50 + GREATEST(0, 20 - p_turns) * 5;
        
        FOREACH v_unit_id IN ARRAY p_participating_units LOOP
            PERFORM rpc_award_unit_exp(v_unit_id, v_unit_exp_gain);
        END LOOP;
    END IF;
    
    -- 4. Apply Material Rewards
    IF p_rewards->'materials' IS NOT NULL AND jsonb_array_length(p_rewards->'materials') > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(p_rewards->'materials') AS x("itemId" TEXT, amount INTEGER) LOOP
            INSERT INTO inventory (player_id, item_id, item_type, quantity)
            VALUES (v_user_id, v_material."itemId", 'material', v_material.amount)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + v_material.amount;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 6: UNIT PROGRESSION
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_award_unit_exp(
    p_unit_id UUID,
    p_exp_gain INTEGER
)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_exp INTEGER;
    v_current_level INTEGER;
    v_next_level_exp INTEGER;
BEGIN
    SELECT exp, level INTO v_current_exp, v_current_level
    FROM units 
    WHERE id = p_unit_id AND player_id = v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;
    
    v_current_exp := v_current_exp + p_exp_gain;
    v_next_level_exp := v_current_level * 100;
    
    WHILE v_current_exp >= v_next_level_exp LOOP
        v_current_exp := v_current_exp - v_next_level_exp;
        v_current_level := v_current_level + 1;
        v_next_level_exp := v_current_level * 100;
    END LOOP;
    
    UPDATE units 
    SET exp = v_current_exp, 
        level = v_current_level
    WHERE id = p_unit_id AND player_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 7: SKILLS & EQUIPMENT
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_learn_skill(p_unit_id UUID, p_skill_id TEXT, p_skill_data JSONB)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_job_id TEXT;
    v_current_skills JSONB;
    v_skill_cost INTEGER := 500;
    v_inventory_id UUID;
BEGIN
    SELECT current_job_id, jobs.skills_unlocked
    INTO v_job_id, v_current_skills
    FROM units
    LEFT JOIN jobs ON jobs.id = units.current_job_id 
        AND jobs.version = (SELECT version FROM game_configs WHERE is_active = true LIMIT 1)
    WHERE units.id = p_unit_id AND units.player_id = v_user_id;

    IF v_job_id IS NULL THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;

    IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_current_skills) WHERE value->>'id' = p_skill_id) THEN
        RAISE EXCEPTION 'Skill already learned';
    END IF;

    UPDATE players SET currency = currency - v_skill_cost 
    WHERE id = v_user_id AND currency >= v_skill_cost;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    INSERT INTO inventory (player_id, item_id, item_type, metadata)
    VALUES (v_user_id, p_skill_id, 'skill', p_skill_data)
    RETURNING id INTO v_inventory_id;

    UPDATE jobs
    SET skills_unlocked = skills_unlocked || jsonb_build_array(p_skill_data)
    WHERE id = v_job_id
    AND version = (SELECT version FROM game_configs WHERE is_active = true LIMIT 1);

    RETURN v_inventory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_equip_skill(p_unit_id UUID, p_inventory_id UUID)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_max_skills INTEGER := 5;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM inventory 
        WHERE id = p_inventory_id 
        AND player_id = v_user_id 
        AND item_type = 'skill'
    ) THEN
        RAISE EXCEPTION 'Skill not found in inventory';
    END IF;

    IF EXISTS (SELECT 1 FROM units WHERE id = p_unit_id AND p_inventory_id = ANY(equipped_skill_instance_ids)) THEN
        RAISE EXCEPTION 'Skill already equipped';
    END IF;

    UPDATE units
    SET equipped_skill_instance_ids = 
        CASE 
            WHEN array_length(equipped_skill_instance_ids, 1) >= v_max_skills 
            THEN equipped_skill_instance_ids
            ELSE array_append(equipped_skill_instance_ids, p_inventory_id)
        END
    WHERE id = p_unit_id AND player_id = v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 8: CURRENCY MANAGEMENT
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_add_currency(
    p_currency_amount BIGINT DEFAULT 0,
    p_premium_amount INTEGER DEFAULT 0
)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    UPDATE players
    SET currency = currency + GREATEST(0, p_currency_amount),
        premium_currency = premium_currency + GREATEST(0, p_premium_amount)
    WHERE id = v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 9: UTILITY VIEWS
-- =====================================================

CREATE OR REPLACE VIEW unit_progress AS
SELECT 
    u.id,
    u.player_id,
    u.name,
    u.level,
    u.exp,
    u.current_job_id,
    (u.level * 100) as next_level_exp,
    ROUND((u.exp::FLOAT / (u.level * 100) * 100)::NUMERIC, 2) as exp_percentage
FROM units u;

GRANT SELECT ON unit_progress TO authenticated;
