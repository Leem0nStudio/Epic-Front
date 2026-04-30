-- DEPRECATED: Este archivo fue consolidado en los archivos supabase/schema.sql, supabase/functions.sql, supabase/seed.sql y supabase/cleanup.sql
-- No ejecutar este archivo.
SELECT 'DEPRECATED FILE - use supabase/schema.sql, supabase/functions.sql, supabase/seed.sql, supabase/cleanup.sql'::text;

-- Learn Skill (add skill to inventory and job's unlocked skills)
CREATE OR REPLACE FUNCTION rpc_learn_skill(p_unit_id UUID, p_skill_id TEXT, p_skill_data JSONB)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_job_id TEXT;
    v_current_skills JSONB;
    v_skill_cost INTEGER := 500;
    v_inventory_id UUID;
BEGIN
    -- Get unit's current job
    SELECT current_job_id, jobs.skills_unlocked
    INTO v_job_id, v_current_skills
    FROM units
    LEFT JOIN jobs ON jobs.id = units.current_job_id AND jobs.version = (SELECT version FROM game_configs WHERE is_active = true LIMIT 1)
    WHERE units.id = p_unit_id AND units.player_id = v_user_id;

    IF v_job_id IS NULL THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;

    -- Check if skill already learned
    IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_current_skills) WHERE value->>'id' = p_skill_id) THEN
        RAISE EXCEPTION 'Skill already learned';
    END IF;

    -- Deduct cost
    UPDATE players SET currency = currency - v_skill_cost WHERE id = v_user_id AND currency >= v_skill_cost;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Add skill to inventory (create instance)
    INSERT INTO inventory (player_id, item_id, item_type, metadata)
    VALUES (v_user_id, p_skill_id, 'skill', p_skill_data)
    RETURNING id INTO v_inventory_id;

    -- Add skill to job's unlocked skills for tracking
    UPDATE jobs
    SET skills_unlocked = skills_unlocked || jsonb_build_array(p_skill_data)
    WHERE id = v_job_id
    AND version = (SELECT version FROM game_configs WHERE is_active = true LIMIT 1);

    RETURN v_inventory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Equip Skill (assign skill instance to unit)
CREATE OR REPLACE FUNCTION rpc_equip_skill(p_unit_id UUID, p_inventory_id UUID)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_max_skills INTEGER := 5;
BEGIN
    -- Verify inventory item belongs to user and is a skill
    IF NOT EXISTS (
        SELECT 1 FROM inventory 
        WHERE id = p_inventory_id 
        AND player_id = v_user_id 
        AND item_type = 'skill'
    ) THEN
        RAISE EXCEPTION 'Skill not found in inventory';
    END IF;

    -- Check if already equipped
    IF EXISTS (SELECT 1 FROM units WHERE id = p_unit_id AND p_inventory_id = ANY(equipped_skill_instance_ids)) THEN
        RAISE EXCEPTION 'Skill already equipped';
    END IF;

    -- Equip the skill (add to array, respecting limit)
    UPDATE units
    SET equipped_skill_instance_ids = 
        CASE 
            WHEN array_length(equipped_skill_instance_ids, 1) >= v_max_skills 
            THEN equipped_skill_instance_ids  -- Max reached, don't add
            ELSE array_append(equipped_skill_instance_ids, p_inventory_id)
        END
    WHERE id = p_unit_id AND player_id = v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 1. Add level, exp, last_energy_regen to players table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'level') THEN
        ALTER TABLE players ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'exp') THEN
        ALTER TABLE players ADD COLUMN exp INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'last_energy_regen') THEN
        ALTER TABLE players ADD COLUMN last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Add sprite_id and icon_id to units table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'sprite_id') THEN
        ALTER TABLE units ADD COLUMN sprite_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'icon_id') THEN
        ALTER TABLE units ADD COLUMN icon_id TEXT;
    END IF;
END $$;

-- 3. Regen Energy RPC
CREATE OR REPLACE FUNCTION rpc_regen_energy()
RETURNS void AS $rpc$
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
$rpc$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_deduct_energy(p_cost INTEGER)
RETURNS BOOLEAN AS $rpc$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    PERFORM rpc_regen_energy();
    UPDATE players
    SET energy = energy - p_cost
    WHERE id = v_user_id AND energy >= p_cost;
    RETURN FOUND;
END;
$rpc$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Complete Stage RPC (Updated for Player EXP and Level Up)
CREATE OR REPLACE FUNCTION rpc_complete_stage(p_stage_id TEXT, p_stars INTEGER, p_turns INTEGER, p_rewards JSONB)
RETURNS void AS $rpc$
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

        -- Also level up units in party
        UPDATE units
        SET level = level + 1
        WHERE id IN (SELECT unit_id FROM party WHERE player_id = v_user_id);
    END IF;

    -- 3. Apply Material Rewards
    IF p_rewards->'materials' IS NOT NULL AND jsonb_array_length(p_rewards->'materials') > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(p_rewards->'materials') AS x(itemId TEXT, amount INTEGER) LOOP
            INSERT INTO inventory (player_id, item_id, item_type, quantity)
            VALUES (v_user_id, v_material.itemId, 'material', v_material.amount)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + v_material.amount;
        END LOOP;
    END IF;
END;
$rpc$ LANGUAGE plpgsql SECURITY DEFINER;
