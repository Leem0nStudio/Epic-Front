-- Epic RPG Database Functions & RPCs
-- This file contains all stored procedures and functions
-- Run this AFTER 01-schema.sql

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
    -- Insert player with starting energy (30 max)
    INSERT INTO players (id, username, energy, max_energy, currency, premium_currency)
    VALUES (v_user_id, p_username, 30, 30, 1000, 50)
    ON CONFLICT (id) DO UPDATE SET 
        username = EXCLUDED.username,
        energy = EXCLUDED.energy,
        max_energy = EXCLUDED.max_energy;

    -- Initialize gacha pity counters
    INSERT INTO gacha_state (player_id)
    VALUES (v_user_id)
    ON CONFLICT (player_id) DO NOTHING;

    -- Clear existing units and party
    DELETE FROM party WHERE player_id = v_user_id;
    DELETE FROM units WHERE player_id = v_user_id;
    DELETE FROM inventory WHERE player_id = v_user_id;

    -- Create starter units
    FOREACH v_novice IN ARRAY p_novices LOOP
        INSERT INTO units (player_id, name, base_stats, growth_rates, affinity, trait, current_job_id, sprite_id, icon_id)
        VALUES (v_user_id, v_novice->>'name', (v_novice->'baseStats'), (v_novice->'growthRates'),
                v_novice->>'affinity', v_novice->>'trait', 'novice', v_novice->>'spriteId', v_novice->>'iconId')
        RETURNING id INTO v_unit_id;

        INSERT INTO party (player_id, slot_index, unit_id)
        VALUES (v_user_id, v_idx, v_unit_id);

        v_idx := v_idx + 1;
    END LOOP;

    -- Add starter items to inventory
    INSERT INTO inventory (player_id, item_id, item_type, quantity)
    VALUES 
        (v_user_id, 'weapon_sword_iron', 'weapon', 1),
        (v_user_id, 'card_power_up', 'card', 2),
        (v_user_id, 'skill_basic_attack', 'skill', 1),
        (v_user_id, 'card_light_heal', 'card', 1),
        (v_user_id, 'armor_leather', 'armor', 1),
        (v_user_id, 'ring_copper', 'accessory', 1),
        (v_user_id, 'boots_leather', 'boots', 1),
        (v_user_id, 'mat_iron', 'material', 10);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add starter inventory items if empty
CREATE OR REPLACE FUNCTION rpc_add_starter_inventory()
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    -- Only add if inventory is empty
    IF NOT EXISTS (SELECT 1 FROM inventory WHERE player_id = v_user_id) THEN
        INSERT INTO inventory (player_id, item_id, item_type, quantity)
        VALUES 
            (v_user_id, 'weapon_sword_iron', 'weapon', 1),
            (v_user_id, 'card_power_up', 'card', 2),
            (v_user_id, 'skill_basic_attack', 'skill', 1),
            (v_user_id, 'card_light_heal', 'card', 1),
            (v_user_id, 'armor_leather', 'armor', 1),
            (v_user_id, 'ring_copper', 'accessory', 1),
            (v_user_id, 'boots_leather', 'boots', 1),
            (v_user_id, 'mat_iron', 'material', 10);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 2: GACHA SYSTEM
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_pull_gacha(p_amount INTEGER, p_currency_type TEXT, p_banner_id TEXT DEFAULT 'standard')
RETURNS TABLE(res_item_id TEXT, res_item_name TEXT, res_item_rarity TEXT, res_item_type TEXT, res_spark_count INTEGER) AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_cost_per_pull INTEGER;
    v_total_cost INTEGER;
    v_balance BIGINT;
    v_p_epic INTEGER;
    v_p_leg INTEGER;
    v_spark_count INTEGER := 0;
    v_active_version TEXT;
    v_roll FLOAT;
    v_rarity TEXT;
    v_target_id TEXT;
    v_target_name TEXT;
    v_target_type TEXT;
    v_banner RECORD;
    v_banner_costs JSONB;
    v_use_banner_pity BOOLEAN := FALSE;
    v_featured_rarity TEXT;
    v_has_featured_items BOOLEAN := FALSE;
    v_featured_item RECORD;
BEGIN
    -- Load banner config
    SELECT * INTO v_banner FROM banners WHERE id = p_banner_id AND is_active = true;
    IF NOT FOUND THEN
        -- Fallback to standard behavior if banner not found
        v_banner := NULL;
    END IF;

    -- Determine costs from banner or defaults
    IF v_banner IS NOT NULL THEN
        v_banner_costs := v_banner.currency_cost;
        IF p_currency_type = 'premium' THEN
            v_cost_per_pull := (v_banner_costs->'premium'->>'single')::INTEGER;
        ELSE
            v_cost_per_pull := (v_banner_costs->'soft'->>'single')::INTEGER;
        END IF;
    ELSE
        IF p_currency_type = 'premium' THEN
            v_cost_per_pull := 300;
        ELSE
            v_cost_per_pull := 100;
        END IF;
    END IF;

    -- Get balance
    IF p_currency_type = 'premium' THEN
        SELECT premium_currency INTO v_balance FROM players WHERE id = v_user_id;
    ELSE
        SELECT currency INTO v_balance FROM players WHERE id = v_user_id;
    END IF;

    -- Apply 10% discount for 10+ pulls
    v_total_cost := CASE WHEN p_amount >= 10 THEN floor(p_amount * v_cost_per_pull * 0.9)::INTEGER ELSE p_amount * v_cost_per_pull END;

    IF v_balance < v_total_cost THEN
        RAISE EXCEPTION 'Moneda insuficiente';
    END IF;

    -- Get active version
    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    IF v_active_version IS NULL THEN
        v_active_version := 'v1.0';
    END IF;

    -- Load pity counters (per-banner or global)
    IF v_banner IS NOT NULL AND v_banner.pity_carry_over = false THEN
        -- Per-banner pity
        SELECT pulls_since_epic, pulls_since_legendary, spark_count
        INTO v_p_epic, v_p_leg, v_spark_count
        FROM banner_pity WHERE player_id = v_user_id AND banner_id = p_banner_id;

        IF NOT FOUND THEN
            INSERT INTO banner_pity (player_id, banner_id, pulls_since_epic, pulls_since_legendary, spark_count)
            VALUES (v_user_id, p_banner_id, 0, 0, 0);
            v_p_epic := 0;
            v_p_leg := 0;
            v_spark_count := 0;
        END IF;
        v_use_banner_pity := TRUE;
    ELSE
        -- Global pity (standard banner or carry-over)
        SELECT pulls_since_epic, pulls_since_legendary INTO v_p_epic, v_p_leg
        FROM gacha_state WHERE player_id = v_user_id;

        IF NOT FOUND THEN
            INSERT INTO gacha_state (player_id, pulls_since_epic, pulls_since_legendary)
            VALUES (v_user_id, 0, 0);
            v_p_epic := 0;
            v_p_leg := 0;
        END IF;
    END IF;

    -- Check if banner has featured items for this rarity
    v_featured_rarity := v_banner.featured_rarity;

    FOR i IN 1..p_amount LOOP
        v_p_epic := v_p_epic + 1;
        v_p_leg := v_p_leg + 1;
        v_spark_count := v_spark_count + 1;
        v_roll := random();

        -- Determine rarity based on pity system
        IF v_p_leg >= 80 THEN
            v_rarity := 'legendary';
            v_p_leg := 0;
            v_p_epic := 0;
        ELSIF v_p_leg >= 70 AND random() < (0.03 + (v_p_leg - 70) * 0.05) THEN
            v_rarity := 'legendary';
            v_p_leg := 0;
            v_p_epic := 0;
        ELSIF v_p_epic >= 15 THEN
            v_rarity := 'epic';
            v_p_epic := 0;
        ELSIF random() < 0.03 THEN
            v_rarity := 'legendary';
            v_p_leg := 0;
            v_p_epic := 0;
        ELSIF random() < 0.12 THEN
            v_rarity := 'epic';
            v_p_epic := 0;
        ELSIF random() < 0.25 THEN
            v_rarity := 'rare';
        ELSIF random() < 0.20 THEN
            v_rarity := 'uncommon';
        ELSE
            v_rarity := 'common';
        END IF;

        -- Check if this rarity matches banner's featured rarity
        IF v_banner IS NOT NULL AND v_rarity = v_featured_rarity THEN
            -- Check if banner has featured items
            SELECT EXISTS(
                SELECT 1 FROM banner_featured_items WHERE banner_id = p_banner_id
            ) INTO v_has_featured_items;

            IF v_has_featured_items THEN
                -- Pick a featured item from this banner
                SELECT bfi.item_id, bfi.item_type INTO v_target_id, v_target_type
                FROM banner_featured_items bfi
                WHERE bfi.banner_id = p_banner_id
                ORDER BY random() LIMIT 1;

                IF v_target_id IS NOT NULL THEN
                    -- Get item name from the appropriate table
                    IF v_target_type = 'card' THEN
                        SELECT name INTO v_target_name FROM cards WHERE id = v_target_id;
                    ELSIF v_target_type = 'weapon' THEN
                        SELECT name INTO v_target_name FROM weapons WHERE id = v_target_id;
                    ELSIF v_target_type = 'skill' THEN
                        SELECT name INTO v_target_name FROM skills WHERE id = v_target_id;
                    ELSE
                        SELECT name INTO v_target_name FROM job_cores WHERE id = v_target_id;
                    END IF;
                END IF;
            END IF;
        END IF;

        -- If no featured item picked, use standard pool
        IF v_target_id IS NULL THEN
            -- Determine item type
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

            -- Query item from appropriate table
            IF v_target_type = 'card' THEN
                SELECT id, name INTO v_target_id, v_target_name
                FROM cards WHERE rarity = v_rarity AND (version = v_active_version OR version IS NULL)
                ORDER BY random() LIMIT 1;
            ELSIF v_target_type = 'weapon' THEN
                SELECT id, name INTO v_target_id, v_target_name
                FROM weapons WHERE rarity = v_rarity AND (version = v_active_version OR version IS NULL)
                ORDER BY random() LIMIT 1;
            ELSIF v_target_type = 'skill' THEN
                SELECT id, name INTO v_target_id, v_target_name
                FROM skills WHERE rarity = v_rarity AND (version = v_active_version OR version IS NULL)
                ORDER BY random() LIMIT 1;
            ELSE
                SELECT id, name INTO v_target_id, v_target_name
                FROM job_cores WHERE rarity = v_rarity AND (version = v_active_version OR version IS NULL)
                ORDER BY random() LIMIT 1;
            END IF;

            -- Fallback to common if no item found
            IF v_target_id IS NULL THEN
                IF v_target_type = 'card' THEN
                    SELECT id, name INTO v_target_id, v_target_name
                    FROM cards WHERE rarity = 'common' AND (version = v_active_version OR version IS NULL)
                    ORDER BY random() LIMIT 1;
                ELSIF v_target_type = 'weapon' THEN
                    SELECT id, name INTO v_target_id, v_target_name
                    FROM weapons WHERE rarity = 'common' AND (version = v_active_version OR version IS NULL)
                    ORDER BY random() LIMIT 1;
                ELSIF v_target_type = 'skill' THEN
                    SELECT id, name INTO v_target_id, v_target_name
                    FROM skills WHERE rarity = 'common' AND (version = v_active_version OR version IS NULL)
                    ORDER BY random() LIMIT 1;
                ELSE
                    SELECT id, name INTO v_target_id, v_target_name
                    FROM job_cores WHERE rarity = 'common' AND (version = v_active_version OR version IS NULL)
                    ORDER BY random() LIMIT 1;
                END IF;
                v_rarity := 'common';
            END IF;
        END IF;

        IF v_target_id IS NOT NULL THEN
            -- Add to inventory
            INSERT INTO inventory (player_id, item_id, item_type)
            VALUES (v_user_id, v_target_id, v_target_type)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + 1;

            -- Return result
            res_item_id := v_target_id;
            res_item_name := v_target_name;
            res_item_rarity := v_rarity;
            res_item_type := v_target_type;
            res_spark_count := v_spark_count;
            RETURN NEXT;
        END IF;

        -- Reset for next iteration
        v_target_id := NULL;
        v_target_name := NULL;
        v_target_type := NULL;
    END LOOP;

    -- Deduct currency
    IF p_currency_type = 'premium' THEN
        UPDATE players SET premium_currency = premium_currency - v_total_cost WHERE id = v_user_id;
    ELSE
        UPDATE players SET currency = currency - v_total_cost WHERE id = v_user_id;
    END IF;

    -- Update pity counters
    IF v_use_banner_pity THEN
        UPDATE banner_pity
        SET pulls_since_epic = v_p_epic, pulls_since_legendary = v_p_leg,
            spark_count = v_spark_count, last_pull_at = NOW()
        WHERE player_id = v_user_id AND banner_id = p_banner_id;
    ELSE
        UPDATE gacha_state
        SET pulls_since_epic = v_p_epic, pulls_since_legendary = v_p_leg, last_pull_at = NOW()
        WHERE player_id = v_user_id;
    END IF;
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
    v_tick_interval INTERVAL := '4 minutes';
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

CREATE OR REPLACE FUNCTION rpc_refill_energy_with_gems(p_gem_cost INTEGER DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_gems BIGINT;
    v_refill_count INTEGER;
    v_actual_cost INTEGER;
BEGIN
    -- Calculate scaling cost: base 50 + 25 per refill today
    SELECT COALESCE(refill_count_today, 0) INTO v_refill_count
    FROM players WHERE id = v_user_id;
    
    v_actual_cost := COALESCE(p_gem_cost, 50 + (v_refill_count * 25));
    
    SELECT premium_currency INTO v_current_gems FROM players WHERE id = v_user_id;

    IF v_current_gems < v_actual_cost THEN
        RAISE EXCEPTION 'Insufficient gems';
    END IF;

    UPDATE players
    SET premium_currency = premium_currency - v_actual_cost,
        energy = max_energy,
        last_energy_regen = NOW(),
        refill_count_today = COALESCE(refill_count_today, 0) + 1
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
    p_participating_units UUID[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_material RECORD;
    v_exp_gain INTEGER;
    v_player_exp INTEGER;
    v_player_level INTEGER;
    v_next_level_exp INTEGER;
    v_unit_id UUID;
    v_unit_exp_gain INTEGER;
    v_is_first_clear BOOLEAN := FALSE;
    v_clear_count INTEGER := 0;
    v_stage_record RECORD;
    v_base_currency INTEGER;
    v_base_exp INTEGER;
    v_stage_materials JSONB;
    v_awarded_materials JSONB := '[]'::JSONB;
    v_drop_roll NUMERIC;
BEGIN
    -- Get stage rewards from server (not client) to prevent manipulation
    SELECT base_currency, base_exp, material_drops INTO v_stage_record
    FROM stages WHERE id = p_stage_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Stage not found: %', p_stage_id;
    END IF;

    v_base_currency := COALESCE(v_stage_record.base_currency, 0);
    v_base_exp := COALESCE(v_stage_record.base_exp, 0);
    v_stage_materials := COALESCE(v_stage_record.material_drops, '[]'::JSONB);

    -- Check if this is first clear
    SELECT clear_count INTO v_clear_count FROM campaign_progress
    WHERE player_id = v_user_id AND stage_id = p_stage_id;

    v_is_first_clear := COALESCE(v_clear_count, 0) = 0;

    -- Record stage completion and increment clear count
    INSERT INTO campaign_progress (player_id, stage_id, stars, best_turns, clear_count)
    VALUES (v_user_id, p_stage_id, p_stars, p_turns, 1)
    ON CONFLICT (player_id, stage_id) DO UPDATE SET
        stars = GREATEST(campaign_progress.stars, EXCLUDED.stars),
        best_turns = LEAST(COALESCE(campaign_progress.best_turns, 999), EXCLUDED.best_turns),
        clear_count = campaign_progress.clear_count + 1,
        cleared_at = NOW();

    -- Apply diminishing returns for repeated clears (50% reduction after first 3 clears)
    IF NOT v_is_first_clear AND v_clear_count >= 3 THEN
        v_base_currency := floor(v_base_currency::NUMERIC * 0.5);
        v_base_exp := floor(v_base_exp::NUMERIC * 0.5);
    END IF;

    -- 1. Apply Currency Rewards (with diminishing returns if applicable)
    UPDATE players
    SET currency = currency + v_base_currency,
        premium_currency = premium_currency + CASE WHEN v_is_first_clear THEN 10 ELSE 0 END
    WHERE id = v_user_id;

    -- First clear bonus: extra 50% currency and 100 bonus exp
    IF v_is_first_clear THEN
        UPDATE players
        SET currency = currency + floor(v_base_currency::NUMERIC * 0.5),
            exp = exp + 100
        WHERE id = v_user_id;
    END IF;

    -- 2. Apply Player EXP and Level Up
    v_exp_gain := v_base_exp;
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

    -- 4. Apply Material Rewards (server-side drop calculation)
    -- Drop rates are calculated server-side to prevent client manipulation
    IF jsonb_array_length(v_stage_materials) > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(v_stage_materials) AS x(item_id TEXT, amount INTEGER, drop_chance NUMERIC) LOOP
            -- Server-side drop roll
            v_drop_roll := random();
            
            -- First clear always drops; repeated clears use drop chance with diminishing returns
            IF v_is_first_clear OR (v_clear_count < 3 AND v_drop_roll <= v_material.drop_chance) OR 
               (v_clear_count >= 3 AND v_drop_roll <= v_material.drop_chance * 0.3) THEN
                
                INSERT INTO inventory (player_id, item_id, item_type, quantity)
                VALUES (v_user_id, v_material.item_id, 'material', v_material.amount)
                ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + v_material.amount;
                
                v_awarded_materials := v_awarded_materials || jsonb_build_array(jsonb_build_object('itemId', v_material.item_id, 'amount', v_material.amount));
            END IF;
        END LOOP;
    END IF;

    -- Return summary of applied rewards (server-calculated)
    RETURN jsonb_build_object(
        'isFirstClear', v_is_first_clear,
        'currency', v_base_currency,
        'exp', v_exp_gain,
        'premiumCurrency', CASE WHEN v_is_first_clear THEN 10 ELSE 0 END,
        'materials', v_awarded_materials,
        'clearCount', v_clear_count + 1,
        'diminishingReturns', CASE WHEN v_clear_count >= 3 THEN true ELSE false END
    );
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

    RETURN v_inventory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_equip_skill(p_unit_id UUID, p_inventory_id UUID)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_equipped JSONB;
    v_skills TEXT[];
    v_max_skills INTEGER := 2;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM inventory
        WHERE id = p_inventory_id
        AND player_id = v_user_id
        AND item_type = 'skill'
    ) THEN
        RAISE EXCEPTION 'Skill not found in inventory';
    END IF;

    -- Get current equipped items
    SELECT equipped_items INTO v_current_equipped FROM units WHERE id = p_unit_id;
    v_current_equipped := COALESCE(v_current_equipped, '{}'::JSONB);
    v_skills := COALESCE(v_current_equipped->'skills', ARRAY[]::TEXT[]);

    -- Check if already equipped
    IF p_inventory_id::TEXT = ANY(v_skills) THEN
        RAISE EXCEPTION 'Skill already equipped';
    END IF;

    -- Add if under max
    IF array_length(v_skills, 1) < v_max_skills THEN
        v_skills := array_append(v_skills, p_inventory_id::TEXT);
        
        UPDATE units
        SET equipped_items = jsonb_set(v_current_equipped, '{skills}', to_jsonb(v_skills))
        WHERE id = p_unit_id AND player_id = v_user_id;
    ELSE
        RAISE EXCEPTION 'Maximum skills equipped (max: %)', v_max_skills;
    END IF;

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
-- SECTION 9: DAILY REWARDS
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_claim_daily_reward(
    p_reward_currency INTEGER,
    p_reward_premium INTEGER,
    p_reward_exp INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_streak INTEGER;
    v_last_claim DATE;
    v_today DATE := CURRENT_DATE;
    v_can_claim BOOLEAN := FALSE;
BEGIN
    SELECT streak, last_claim_date INTO v_streak, v_last_claim
    FROM player_daily_rewards WHERE player_id = v_user_id;

    IF NOT FOUND THEN
        INSERT INTO player_daily_rewards (player_id, streak, last_claim_date)
        VALUES (v_user_id, 0, NULL);
        v_streak := 0;
        v_last_claim := NULL;
    END IF;

    IF v_last_claim IS NULL OR v_last_claim < v_today THEN
        IF v_last_claim = v_today - INTERVAL '1 day' THEN
            v_streak := v_streak + 1;
        ELSIF v_last_claim IS NULL OR v_last_claim < v_today - INTERVAL '1 day' THEN
            v_streak := 1;
        END IF;
        v_can_claim := TRUE;
    END IF;

    IF NOT v_can_claim THEN
        RAISE EXCEPTION 'Reward already claimed today';
    END IF;

    -- Update streak and claim date
    UPDATE player_daily_rewards
    SET streak = v_streak,
        last_claim_date = v_today
    WHERE player_id = v_user_id;

    -- Add currency rewards
    PERFORM rpc_add_currency(p_reward_currency::BIGINT, p_reward_premium);

    -- Add player EXP
    IF p_reward_exp > 0 THEN
        UPDATE players
        SET exp = exp + p_reward_exp
        WHERE id = v_user_id;

        -- Check for player level up
        -- (This is a simplified version, ideally we'd have a common function)
        UPDATE players
        SET level = level + floor(exp / (level * 100)),
            exp = exp % (level * 100)
        WHERE id = v_user_id AND exp >= (level * 100);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'new_streak', v_streak,
        'currency_gained', p_reward_currency,
        'premium_gained', p_reward_premium,
        'exp_gained', p_reward_exp
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 10: TRAINING SYSTEM
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_train_unit(
    p_unit_id UUID,
    p_training_type TEXT DEFAULT 'basic'
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_energy_cost INTEGER;
    v_exp_gain INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Server-side validation of training type and values
    -- This prevents client manipulation of exp/energy values
    CASE p_training_type
        WHEN 'basic' THEN
            v_energy_cost := 5;
            v_exp_gain := 25;
        WHEN 'intensive' THEN
            v_energy_cost := 15;
            v_exp_gain := 75;
        WHEN 'elite' THEN
            v_energy_cost := 30;
            v_exp_gain := 200;
        ELSE
            RAISE EXCEPTION 'Invalid training type: %', p_training_type;
    END CASE;

    -- 1. Deduct Energy (server validates)
    IF NOT rpc_deduct_energy(v_energy_cost) THEN
        RAISE EXCEPTION 'Insufficient energy';
    END IF;

    -- 2. Award EXP to unit (returns actual exp gained, may vary due to level bonuses)
    PERFORM rpc_award_unit_exp(p_unit_id, v_exp_gain);

    -- 3. Get new level after training
    SELECT u.level INTO v_new_level FROM units u WHERE u.id = p_unit_id;

    RETURN jsonb_build_object(
        'success', true,
        'unit_id', p_unit_id,
        'exp_gained', v_exp_gain,
        'new_level', v_new_level,
        'training_type', p_training_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 11: UTILITY VIEWS
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

-- =====================================================
-- CRAFTING SYSTEM: Skill Fragments
-- =====================================================

CREATE OR REPLACE FUNCTION rpc_craft_skill(p_player_id UUID, p_fragment_id TEXT)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_fragment RECORD;
    v_player_fragment RECORD;
    v_skill_module_id UUID;
    v_learned_skill_id UUID;
BEGIN
    IF p_player_id != v_user_id THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT * INTO v_fragment FROM skill_fragments WHERE id = p_fragment_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fragmento no encontrado';
    END IF;

    SELECT * INTO v_player_fragment FROM player_skill_fragments
    WHERE player_id = p_player_id AND fragment_id = p_fragment_id;

    IF NOT FOUND OR v_player_fragment.quantity < v_fragment.piece_count THEN
        RAISE EXCEPTION 'Fragmentos insuficientes: %/%',
            COALESCE(v_player_fragment.quantity, 0), v_fragment.piece_count;
    END IF;

    v_skill_module_id := v_fragment.skill_module_id;

    INSERT INTO player_learned_skills (player_id, skill_module_id)
    VALUES (p_player_id, v_skill_module_id)
    ON CONFLICT (player_id, skill_module_id) DO NOTHING
    RETURNING id INTO v_learned_skill_id;

    IF v_learned_skill_id IS NULL THEN
        SELECT id INTO v_learned_skill_id FROM player_learned_skills
        WHERE player_id = p_player_id AND skill_module_id = v_skill_module_id;
    END IF;

    UPDATE player_skill_fragments
    SET quantity = quantity - v_fragment.piece_count
    WHERE player_id = p_player_id AND fragment_id = p_fragment_id;

    DELETE FROM player_skill_fragments WHERE quantity <= 0;

    RETURN v_learned_skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_add_skill_fragment(p_player_id UUID, p_fragment_id TEXT, p_amount INTEGER DEFAULT 1)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF p_player_id != v_user_id THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    INSERT INTO player_skill_fragments (player_id, fragment_id, quantity)
    VALUES (p_player_id, p_fragment_id, p_amount)
    ON CONFLICT (player_id, fragment_id)
    DO UPDATE SET quantity = player_skill_fragments.quantity + p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_get_player_fragments(p_player_id UUID)
RETURNS TABLE(fragment_id TEXT, name TEXT, description TEXT, piece_count INTEGER, rarity TEXT, current_quantity INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sf.id AS fragment_id,
        sf.name,
        sf.description,
        sf.piece_count,
        sf.rarity,
        COALESCE(psf.quantity, 0) AS current_quantity
    FROM skill_fragments sf
    LEFT JOIN player_skill_fragments psf ON psf.fragment_id = sf.id AND psf.player_id = p_player_id
    ORDER BY
        CASE sf.rarity
            WHEN 'legendary' THEN 1
            WHEN 'epic' THEN 2
            WHEN 'rare' THEN 3
            ELSE 4
        END,
        sf.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_get_player_learned_skills(p_player_id UUID)
RETURNS TABLE(skill_module_id UUID, skill_name TEXT, skill_description TEXT, learned_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sm.id AS skill_module_id,
        sm.name AS skill_name,
        sm.description AS skill_description,
        pls.learned_at
    FROM player_learned_skills pls
    JOIN skill_modules sm ON sm.id = pls.skill_module_id
    WHERE pls.player_id = p_player_id
    ORDER BY pls.learned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 12: PROGRESION V2.0 (Job Levels, Transcendence, Potentials)
-- =====================================================

-- Add player EXP with level up calculation
CREATE OR REPLACE FUNCTION rpc_add_player_exp(p_player_id UUID, p_exp_gain INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_exp INTEGER;
    v_current_level INTEGER;
    v_new_exp INTEGER;
    v_new_level INTEGER;
    v_exp_for_next INTEGER;
    v_leveled_up BOOLEAN := FALSE;
BEGIN
    -- Use provided player_id or auth.uid()
    v_user_id := COALESCE(p_player_id, v_user_id);

    SELECT exp, level INTO v_current_exp, v_current_level FROM players WHERE id = v_user_id;
    
    v_new_exp := v_current_exp + p_exp_gain;
    v_new_level := v_current_level;
    
    -- Calculate level up using formula: level * 100 EXP
    WHILE v_new_exp >= (v_new_level * 100) LOOP
        v_new_exp := v_new_exp - (v_new_level * 100);
        v_new_level := v_new_level + 1;
        v_leveled_up := TRUE;
    END LOOP;

    UPDATE players SET exp = v_new_exp, level = v_new_level WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'leveledUp', v_leveled_up,
        'newLevel', v_new_level,
        'expGained', p_exp_gain,
        'expRemaining', v_new_exp,
        'expForNextLevel', v_new_level * 100
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unit EXP with level up and job level calculation
CREATE OR REPLACE FUNCTION rpc_add_unit_exp(p_unit_id UUID, p_exp_gain INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_exp INTEGER;
    v_current_level INTEGER;
    v_current_job TEXT;
    v_job_levels JSONB;
    v_current_job_exp INTEGER;
    v_current_job_level INTEGER;
    v_new_exp INTEGER;
    v_new_level INTEGER;
    v_new_job_exp INTEGER;
    v_new_job_level INTEGER;
    v_leveled_up BOOLEAN := FALSE;
    v_job_leveled_up BOOLEAN := FALSE;
    v_skill_points_gained INTEGER := 0;
BEGIN
    SELECT exp, level, current_job_id, job_levels INTO v_current_exp, v_current_level, v_current_job, v_job_levels
    FROM units WHERE id = p_unit_id AND player_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;

    -- Get current job level info
    v_job_levels := COALESCE(v_job_levels, '{}'::JSONB);
    v_current_job_exp := COALESCE((v_job_levels->v_current_job->>'exp')::INTEGER, 0);
    v_current_job_level := COALESCE((v_job_levels->v_current_job->>'level')::INTEGER, 1);

    -- Unit level progression (slower than player): level * 80
    v_new_exp := v_current_exp + p_exp_gain;
    v_new_level := v_current_level;

    WHILE v_new_exp >= (v_new_level * 80) LOOP
        v_new_exp := v_new_exp - (v_new_level * 80);
        v_new_level := v_new_level + 1;
        v_leveled_up := TRUE;
    END LOOP;

    -- Job level progression (half of unit EXP): level * 50
    v_new_job_exp := v_current_job_exp + floor(p_exp_gain::NUMERIC / 2);
    v_new_job_level := v_current_job_level;

    WHILE v_new_job_exp >= (v_new_job_level * 50) LOOP
        v_new_job_exp := v_new_job_exp - (v_new_job_level * 50);
        v_new_job_level := v_new_job_level + 1;
        v_job_leveled_up := TRUE;
        v_skill_points_gained := v_skill_points_gained + 1;
    END LOOP;

    -- Update job levels
    v_job_levels := jsonb_set(v_job_levels, 
        ARRAY[v_current_job::TEXT],
        jsonb_build_object(
            'jobId', v_current_job,
            'level', v_new_job_level,
            'exp', v_new_job_exp,
            'skillPoints', ((v_job_levels->v_current_job->>'skillPoints')::INTEGER + v_skill_points_gained),
            'skillsUnlocked', COALESCE(v_job_levels->v_current_job->'skillsUnlocked', '[]'::JSONB)
        )
    );

    UPDATE units 
    SET exp = v_new_exp, 
        level = v_new_level,
        job_levels = v_job_levels
    WHERE id = p_unit_id;

    RETURN jsonb_build_object(
        'unitLeveledUp', v_leveled_up,
        'unitNewLevel', v_new_level,
        'jobLeveledUp', v_job_leveled_up,
        'jobNewLevel', v_new_job_level,
        'skillPointsGained', v_skill_points_gained,
        'expGained', p_exp_gain
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Invest skill point in job skill tree
CREATE OR REPLACE FUNCTION rpc_invest_skill_point(
    p_unit_id UUID, 
    p_job_id TEXT, 
    p_skill_id TEXT,
    p_tier INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_job_levels JSONB;
    v_job_skills JSONB;
    v_available_points INTEGER;
    v_current_skill_level INTEGER;
BEGIN
    -- Get current progression data
    SELECT job_levels, job_skills INTO v_job_levels, v_job_skills
    FROM units WHERE id = p_unit_id AND player_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;

    v_job_levels := COALESCE(v_job_levels, '{}'::JSONB);
    v_job_skills := COALESCE(v_job_skills, '{}'::JSONB);

    -- Get available skill points
    v_available_points := COALESCE((v_job_levels->p_job_id->>'skillPoints')::INTEGER, 0);

    IF v_available_points < 1 THEN
        RAISE EXCEPTION 'No skill points available';
    END IF;

    -- Check tier prerequisites
    IF p_tier > 1 THEN
        v_current_skill_level := COALESCE((v_job_skills->p_job_id->p_skill_id)::INTEGER, 0);
        IF v_current_skill_level = 0 THEN
            RAISE EXCEPTION 'Unlock previous tier first';
        END IF;
    END IF;

    -- Deduct point and add skill
    v_job_levels := jsonb_set(v_job_levels, 
        ARRAY[p_job_id, 'skillPoints'],
        (v_available_points - 1)::TEXT::JSONB
    );

    v_current_skill_level := COALESCE((v_job_skills->p_job_id->p_skill_id)::INTEGER, 0);
    v_job_skills := jsonb_set(v_job_skills,
        ARRAY[p_job_id, p_skill_id],
        (v_current_skill_level + 1)::TEXT::JSONB
    );

    UPDATE units 
    SET job_levels = v_job_levels, job_skills = v_job_skills
    WHERE id = p_unit_id;

    RETURN jsonb_build_object(
        'success', true,
        'skillId', p_skill_id,
        'newLevel', v_current_skill_level + 1,
        'pointsRemaining', v_available_points - 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transcend unit (awakening system)
CREATE OR REPLACE FUNCTION rpc_transcend_unit(p_unit_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_transcend INTEGER;
    v_required_level INTEGER := 99;
    v_max_transcend INTEGER := 5;
BEGIN
    SELECT transcendence_level INTO v_current_transcend FROM units 
    WHERE id = p_unit_id AND player_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;

    v_current_transcend := COALESCE(v_current_transcend, 0);

    IF v_current_transcend >= v_max_transcend THEN
        RAISE EXCEPTION 'Maximum transcendence level reached (%)', v_max_transcend;
    END IF;

    -- Check level requirement
    IF (SELECT level FROM units WHERE id = p_unit_id) < v_required_level THEN
        RAISE EXCEPTION 'Requires level % to transcend', v_required_level;
    END IF;

    UPDATE units SET transcendence_level = v_current_transcend + 1
    WHERE id = p_unit_id;

    RETURN jsonb_build_object(
        'success', true,
        'newTranscendenceLevel', v_current_transcend + 1,
        'bonusStats', jsonb_build_object(
            'hp', 0.1 * (v_current_transcend + 1),
            'atk', 0.1 * (v_current_transcend + 1),
            'def', 0.1 * (v_current_transcend + 1)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unlock potential
CREATE OR REPLACE FUNCTION rpc_unlock_potential(p_unit_id UUID, p_potential_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_potentials TEXT[];
    v_potential RECORD;
    v_unit_level INTEGER;
    v_job_level INTEGER;
    v_transcend_level INTEGER;
    v_can_unlock BOOLEAN := FALSE;
    v_job_levels JSONB;
    v_current_job TEXT;
BEGIN
    SELECT potentials_unlocked, level, current_job_id, transcendence_level, job_levels
    INTO v_potentials, v_unit_level, v_current_job, v_transcend_level, v_job_levels
    FROM units WHERE id = p_unit_id AND player_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;

    -- Check if already unlocked
    IF p_potential_id = ANY(COALESCE(v_potentials, ARRAY[]::TEXT[])) THEN
        RAISE EXCEPTION 'Potential already unlocked';
    END IF;

    -- Get potential requirements
    SELECT * INTO v_potential FROM potentials WHERE id = p_potential_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Potential not found';
    END IF;

    -- Check requirements
    v_job_levels := COALESCE(v_job_levels, '{}'::JSONB);
    v_job_level := COALESCE((v_job_levels->v_current_job->>'level')::INTEGER, 0);

    CASE v_potential.requirement_type
        WHEN 'level' THEN
            v_can_unlock := v_unit_level >= v_potential.requirement_value;
        WHEN 'job_level' THEN
            v_can_unlock := v_job_level >= v_potential.requirement_value;
        WHEN 'transcendence' THEN
            v_can_unlock := v_transcend_level >= v_potential.requirement_value;
    END CASE;

    IF NOT v_can_unlock THEN
        RAISE EXCEPTION 'Requirements not met: % %', 
            v_potential.requirement_type, v_potential.requirement_value;
    END IF;

    -- Unlock potential
    v_potentials := COALESCE(v_potentials, ARRAY[]::TEXT[]) || p_potential_id;
    UPDATE units SET potentials_unlocked = v_potentials WHERE id = p_unit_id;

    RETURN jsonb_build_object(
        'success', true,
        'potentialId', p_potential_id,
        'potentialName', v_potential.name,
        'statBonus', v_potential.stat_bonus
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 13: GACHA BANNER SYSTEM
-- =====================================================

-- Get active banners for display
CREATE OR REPLACE FUNCTION rpc_get_active_banners()
RETURNS TABLE(
    banner_id TEXT,
    banner_name TEXT,
    banner_description TEXT,
    banner_type TEXT,
    featured_rarity TEXT,
    rate_up_multiplier NUMERIC,
    end_date TIMESTAMP WITH TIME ZONE,
    spark_cost INTEGER,
    currency_cost JSONB,
    featured_items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.name,
        b.description,
        b.banner_type,
        b.featured_rarity,
        b.rate_up_multiplier,
        b.end_date,
        b.spark_cost,
        b.currency_cost,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'itemId', bfi.item_id,
                'itemType', bfi.item_type,
                'rateUpMultiplier', bfi.rate_up_multiplier,
                'displayOrder', bfi.display_order
            ) ORDER BY bfi.display_order)
            FROM banner_featured_items bfi WHERE bfi.banner_id = b.id),
            '[]'::JSONB
        )
    FROM banners b
    WHERE b.is_active = true
      AND (b.start_date IS NULL OR b.start_date <= NOW())
      AND (b.end_date IS NULL OR b.end_date > NOW())
    ORDER BY b.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Claim spark reward (guaranteed featured item after N pulls)
CREATE OR REPLACE FUNCTION rpc_claim_spark(p_banner_id TEXT, p_selected_item_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_banner RECORD;
    v_pity RECORD;
    v_item RECORD;
BEGIN
    -- Get banner
    SELECT * INTO v_banner FROM banners WHERE id = p_banner_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Banner not found or inactive';
    END IF;

    IF v_banner.spark_cost IS NULL THEN
        RAISE EXCEPTION 'This banner does not support spark';
    END IF;

    -- Get pity state
    SELECT * INTO v_pity FROM banner_pity
    WHERE player_id = v_user_id AND banner_id = p_banner_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No pulls recorded for this banner';
    END IF;

    IF v_pity.spark_count < v_banner.spark_cost THEN
        RAISE EXCEPTION 'Insufficient pulls for spark: %/%', v_pity.spark_count, v_banner.spark_cost;
    END IF;

    -- Verify selected item is a valid featured item
    IF NOT EXISTS (
        SELECT 1 FROM banner_featured_items
        WHERE banner_id = p_banner_id AND item_id = p_selected_item_id
    ) THEN
        RAISE EXCEPTION 'Selected item is not a featured item on this banner';
    END IF;

    -- Get item type from featured items
    SELECT item_type INTO v_item FROM banner_featured_items
    WHERE banner_id = p_banner_id AND item_id = p_selected_item_id;

    -- Add item to inventory
    INSERT INTO inventory (player_id, item_id, item_type)
    VALUES (v_user_id, p_selected_item_id, v_item.item_type)
    ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + 1;

    -- Reset spark counter
    UPDATE banner_pity SET spark_count = 0
    WHERE player_id = v_user_id AND banner_id = p_banner_id;

    RETURN jsonb_build_object(
        'success', true,
        'itemId', p_selected_item_id,
        'itemType', v_item.item_type,
        'newSparkCount', 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get player's pity state for a banner
CREATE OR REPLACE FUNCTION rpc_get_banner_pity(p_banner_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_pity RECORD;
    v_banner RECORD;
BEGIN
    SELECT * INTO v_banner FROM banners WHERE id = p_banner_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Banner not found';
    END IF;

    SELECT * INTO v_pity FROM banner_pity
    WHERE player_id = v_user_id AND banner_id = p_banner_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'pullsSinceEpic', 0,
            'pullsSinceLegendary', 0,
            'sparkCount', 0,
            'sparkCost', v_banner.spark_cost
        );
    END IF;

    RETURN jsonb_build_object(
        'pullsSinceEpic', v_pity.pulls_since_epic,
        'pullsSinceLegendary', v_pity.pulls_since_legendary,
        'sparkCount', v_pity.spark_count,
        'sparkCost', v_banner.spark_cost
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get global pity state (standard banner)
CREATE OR REPLACE FUNCTION rpc_get_global_pity()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_pity RECORD;
BEGIN
    SELECT * INTO v_pity FROM gacha_state WHERE player_id = v_user_id;

    IF NOT FOUND THEN
        INSERT INTO gacha_state (player_id) VALUES (v_user_id);
        RETURN jsonb_build_object(
            'pullsSinceEpic', 0,
            'pullsSinceLegendary', 0
        );
    END IF;

    RETURN jsonb_build_object(
        'pullsSinceEpic', v_pity.pulls_since_epic,
        'pullsSinceLegendary', v_pity.pulls_since_legendary
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 14: ARENA PVP SYSTEM
-- =====================================================

-- Find arena opponents (matchmaking by points ±200)
CREATE OR REPLACE FUNCTION rpc_arena_find_opponents()
RETURNS TABLE(
    opponent_id UUID,
    opponent_name TEXT,
    opponent_power BIGINT,
    opponent_points INTEGER,
    opponent_wins INTEGER,
    opponent_losses INTEGER,
    opponent_rank_tier TEXT
) AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_points INTEGER;
    v_season_id TEXT;
BEGIN
    -- Get current season
    SELECT id INTO v_season_id FROM arena_seasons WHERE is_active = true LIMIT 1;
    IF v_season_id IS NULL THEN
        RAISE EXCEPTION 'No active arena season';
    END IF;

    -- Get or create player ranking
    SELECT points INTO v_user_points FROM arena_rankings
    WHERE player_id = v_user_id AND season_id = v_season_id;

    IF NOT FOUND THEN
        INSERT INTO arena_rankings (player_id, season_id, points, rank_tier)
        VALUES (v_user_id, v_season_id, 1000, 'bronce');
        v_user_points := 1000;
    END IF;

    -- Find 3 opponents within ±200 points
    RETURN QUERY
    SELECT
        p.id,
        COALESCE(p.username, 'Héroe Anónimo'),
        COALESCE(
            (SELECT SUM((b->>'hp')::BIGINT + (b->>'atk')::BIGINT * 2 + (b->>'def')::BIGINT)
             FROM jsonb_array_elements('[]'::JSONB) b),
            5000::BIGINT
        ),
        ar.points,
        ar.wins,
        ar.losses,
        ar.rank_tier
    FROM players p
    JOIN arena_rankings ar ON ar.player_id = p.id AND ar.season_id = v_season_id
    WHERE p.id != v_user_id
      AND ar.points BETWEEN v_user_points - 200 AND v_user_points + 200
    ORDER BY ABS(ar.points - v_user_points)
    LIMIT 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get or initialize arena ranking
CREATE OR REPLACE FUNCTION rpc_arena_get_ranking()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_season_id TEXT;
    v_ranking RECORD;
BEGIN
    SELECT id INTO v_season_id FROM arena_seasons WHERE is_active = true LIMIT 1;
    IF v_season_id IS NULL THEN
        RETURN jsonb_build_object('error', 'No active arena season');
    END IF;

    SELECT * INTO v_ranking FROM arena_rankings
    WHERE player_id = v_user_id AND season_id = v_season_id;

    IF NOT FOUND THEN
        INSERT INTO arena_rankings (player_id, season_id, points, rank_tier)
        VALUES (v_user_id, v_season_id, 1000, 'bronce');
        RETURN jsonb_build_object(
            'points', 1000,
            'wins', 0,
            'losses', 0,
            'streak', 0,
            'rankTier', 'bronce',
            'rewardClaimed', false
        );
    END IF;

    RETURN jsonb_build_object(
        'points', v_ranking.points,
        'wins', v_ranking.wins,
        'losses', v_ranking.losses,
        'streak', v_ranking.streak,
        'rankTier', v_ranking.rank_tier,
        'rewardClaimed', v_ranking.reward_claimed
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit arena battle result
CREATE OR REPLACE FUNCTION rpc_arena_submit_result(
    p_defender_id UUID,
    p_result TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_season_id TEXT;
    v_attacker_points INTEGER;
    v_defender_points INTEGER;
    v_points_change INTEGER;
    v_match_id UUID;
BEGIN
    IF p_result NOT IN ('win', 'loss', 'draw') THEN
        RAISE EXCEPTION 'Invalid result: %', p_result;
    END IF;

    SELECT id INTO v_season_id FROM arena_seasons WHERE is_active = true LIMIT 1;
    IF v_season_id IS NULL THEN
        RAISE EXCEPTION 'No active arena season';
    END IF;

    -- Get attacker points
    SELECT points INTO v_attacker_points FROM arena_rankings
    WHERE player_id = v_user_id AND season_id = v_season_id;
    IF NOT FOUND THEN v_attacker_points := 1000; END IF;

    -- Get defender points
    SELECT points INTO v_defender_points FROM arena_rankings
    WHERE player_id = p_defender_id AND season_id = v_season_id;
    IF NOT FOUND THEN v_defender_points := 1000; END IF;

    -- Calculate points change (±25 for win/loss, 0 for draw)
    CASE p_result
        WHEN 'win' THEN v_points_change := 25;
        WHEN 'loss' THEN v_points_change := -25;
        ELSE v_points_change := 0;
    END CASE;

    -- Record match
    INSERT INTO arena_matches (attacker_id, defender_id, season_id, result, attacker_points_change, defender_points_change)
    VALUES (v_user_id, p_defender_id, v_season_id, p_result, v_points_change, -v_points_change)
    RETURNING id INTO v_match_id;

    -- Update attacker ranking
    INSERT INTO arena_rankings (player_id, season_id, points, wins, losses, streak, rank_tier, last_match_at)
    VALUES (v_user_id, v_season_id,
            GREATEST(0, v_attacker_points + v_points_change),
            CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
            CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
            CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
            'bronce', NOW())
    ON CONFLICT (player_id, season_id) DO UPDATE SET
        points = GREATEST(0, arena_rankings.points + v_points_change),
        wins = arena_rankings.wins + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
        losses = arena_rankings.losses + CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
        streak = CASE WHEN p_result = 'win' THEN arena_rankings.streak + 1 ELSE 0 END,
        rank_tier = CASE
            WHEN GREATEST(0, arena_rankings.points + v_points_change) >= 2000 THEN 'leyenda'
            WHEN GREATEST(0, arena_rankings.points + v_points_change) >= 1500 THEN 'diamante'
            WHEN GREATEST(0, arena_rankings.points + v_points_change) >= 1200 THEN 'oro'
            WHEN GREATEST(0, arena_rankings.points + v_points_change) >= 1000 THEN 'plata'
            ELSE 'bronce'
        END,
        last_match_at = NOW();

    -- Update defender ranking
    INSERT INTO arena_rankings (player_id, season_id, points, wins, losses, streak, rank_tier, last_match_at)
    VALUES (p_defender_id, v_season_id,
            GREATEST(0, v_defender_points - v_points_change),
            CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
            CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
            0,
            'bronce', NOW())
    ON CONFLICT (player_id, season_id) DO UPDATE SET
        points = GREATEST(0, arena_rankings.points - v_points_change),
        wins = arena_rankings.wins + CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
        losses = arena_rankings.losses + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
        streak = 0,
        rank_tier = CASE
            WHEN GREATEST(0, arena_rankings.points - v_points_change) >= 2000 THEN 'leyenda'
            WHEN GREATEST(0, arena_rankings.points - v_points_change) >= 1500 THEN 'diamante'
            WHEN GREATEST(0, arena_rankings.points - v_points_change) >= 1200 THEN 'oro'
            WHEN GREATEST(0, arena_rankings.points - v_points_change) >= 1000 THEN 'plata'
            ELSE 'bronce'
        END,
        last_match_at = NOW();

    RETURN jsonb_build_object(
        'matchId', v_match_id,
        'result', p_result,
        'pointsChange', v_points_change,
        'newPoints', GREATEST(0, v_attacker_points + v_points_change)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get arena leaderboard
CREATE OR REPLACE FUNCTION rpc_arena_get_leaderboard(p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
    rank_num BIGINT,
    player_id UUID,
    player_name TEXT,
    points INTEGER,
    wins INTEGER,
    losses INTEGER,
    rank_tier TEXT
) AS $$
DECLARE
    v_season_id TEXT;
BEGIN
    SELECT id INTO v_season_id FROM arena_seasons WHERE is_active = true LIMIT 1;
    IF v_season_id IS NULL THEN RETURN; END IF;

    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY ar.points DESC),
        ar.player_id,
        COALESCE(p.username, 'Héroe Anónimo'),
        ar.points,
        ar.wins,
        ar.losses,
        ar.rank_tier
    FROM arena_rankings ar
    JOIN players p ON p.id = ar.player_id
    WHERE ar.season_id = v_season_id
    ORDER BY ar.points DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 15: INFINITE TOWER SYSTEM
-- =====================================================

-- Get tower progress
CREATE OR REPLACE FUNCTION rpc_tower_get_progress()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_season_id TEXT;
    v_progress RECORD;
BEGIN
    SELECT id INTO v_season_id FROM tower_seasons WHERE is_active = true LIMIT 1;
    IF v_season_id IS NULL THEN
        RETURN jsonb_build_object('error', 'No active tower season');
    END IF;

    SELECT * INTO v_progress FROM tower_progress
    WHERE player_id = v_user_id AND season_id = v_season_id;

    IF NOT FOUND THEN
        INSERT INTO tower_progress (player_id, season_id)
        VALUES (v_user_id, v_season_id);
        RETURN jsonb_build_object(
            'highestFloor', 0,
            'floorsCompleted', '[]'::JSONB,
            'rewardClaimedUpTo', 0,
            'seasonId', v_season_id
        );
    END IF;

    RETURN jsonb_build_object(
        'highestFloor', v_progress.highest_floor,
        'floorsCompleted', v_progress.floors_completed,
        'rewardClaimedUpTo', v_progress.reward_claimed_up_to,
        'seasonId', v_season_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete a tower floor
CREATE OR REPLACE FUNCTION rpc_tower_complete_floor(
    p_floor INTEGER,
    p_stars INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_season_id TEXT;
    v_energy_cost INTEGER;
    v_currency_reward INTEGER;
    v_exp_reward INTEGER;
    v_highest INTEGER;
BEGIN
    SELECT id INTO v_season_id FROM tower_seasons WHERE is_active = true LIMIT 1;
    IF v_season_id IS NULL THEN
        RAISE EXCEPTION 'No active tower season';
    END IF;

    -- Energy cost: 3 base + 1 per 10 floors
    v_energy_cost := 3 + (p_floor / 10);

    -- Rewards scale with floor
    v_currency_reward := 50 + (p_floor * 15);
    v_exp_reward := 30 + (p_floor * 10);

    -- Deduct energy
    IF NOT rpc_deduct_energy(v_energy_cost) THEN
        RAISE EXCEPTION 'Insufficient energy';
    END IF;

    -- Update progress
    INSERT INTO tower_progress (player_id, season_id, highest_floor, floors_completed)
    VALUES (v_user_id, v_season_id, p_floor, jsonb_build_array(jsonb_build_object('floor', p_floor, 'stars', p_stars)))
    ON CONFLICT (player_id, season_id) DO UPDATE SET
        highest_floor = GREATEST(tower_progress.highest_floor, p_floor),
        floors_completed = tower_progress.floors_completed || jsonb_build_object('floor', p_floor, 'stars', p_stars);

    -- Award rewards
    UPDATE players SET currency = currency + v_currency_reward WHERE id = v_user_id;
    PERFORM rpc_add_player_exp(v_user_id, v_exp_reward);

    RETURN jsonb_build_object(
        'success', true,
        'floor', p_floor,
        'stars', p_stars,
        'currencyReward', v_currency_reward,
        'expReward', v_exp_reward
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 16: SHOP SYSTEM
-- =====================================================

-- Get available shop items
CREATE OR REPLACE FUNCTION rpc_shop_get_items()
RETURNS TABLE(
    item_id TEXT,
    item_name TEXT,
    item_description TEXT,
    item_type TEXT,
    content JSONB,
    price_gems INTEGER,
    price_money TEXT,
    display_order INTEGER,
    max_purchases_per_day INTEGER,
    current_purchases INTEGER
) AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    SELECT
        si.id,
        si.name,
        si.description,
        si.item_type,
        si.content,
        si.price_gems,
        si.price_money,
        si.display_order,
        si.max_purchases_per_day,
        COALESCE(sp.purchase_count, 0)
    FROM shop_items si
    LEFT JOIN shop_purchases sp ON sp.item_id = si.id AND sp.player_id = v_user_id
        AND sp.last_purchase_at >= CURRENT_DATE
    WHERE si.is_available = true
    ORDER BY si.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Purchase shop item with gems
CREATE OR REPLACE FUNCTION rpc_shop_purchase(p_item_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_item RECORD;
    v_player_gems BIGINT;
    v_purchase RECORD;
    v_today_purchases INTEGER := 0;
BEGIN
    -- Get shop item
    SELECT * INTO v_item FROM shop_items WHERE id = p_item_id AND is_available = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item not found or unavailable';
    END IF;

    IF v_item.price_gems IS NULL THEN
        RAISE EXCEPTION 'This item cannot be purchased with gems';
    END IF;

    -- Check daily purchase limit
    IF v_item.max_purchases_per_day IS NOT NULL THEN
        SELECT COALESCE(purchase_count, 0) INTO v_today_purchases
        FROM shop_purchases
        WHERE player_id = v_user_id AND item_id = p_item_id
          AND last_purchase_at >= CURRENT_DATE;

        IF v_today_purchases >= v_item.max_purchases_per_day THEN
            RAISE EXCEPTION 'Daily purchase limit reached';
        END IF;
    END IF;

    -- Check gems
    SELECT premium_currency INTO v_player_gems FROM players WHERE id = v_user_id;
    IF v_player_gems < v_item.price_gems THEN
        RAISE EXCEPTION 'Insufficient gems';
    END IF;

    -- Deduct gems
    UPDATE players SET premium_currency = premium_currency - v_item.price_gems WHERE id = v_user_id;

    -- Grant content
    IF (v_item.content->>'currency')::INTEGER > 0 THEN
        UPDATE players SET currency = currency + (v_item.content->>'currency')::INTEGER WHERE id = v_user_id;
    END IF;

    IF (v_item.content->>'gems')::INTEGER > 0 THEN
        UPDATE players SET premium_currency = premium_currency + (v_item.content->>'gems')::INTEGER WHERE id = v_user_id;
    END IF;

    IF (v_item.content->>'energy')::INTEGER > 0 THEN
        UPDATE players SET energy = LEAST(max_energy, energy + (v_item.content->>'energy')::INTEGER) WHERE id = v_user_id;
    END IF;

    -- Record purchase
    INSERT INTO shop_purchases (player_id, item_id, purchase_count, last_purchase_at)
    VALUES (v_user_id, p_item_id, 1, NOW())
    ON CONFLICT (player_id, item_id) DO UPDATE SET
        purchase_count = shop_purchases.purchase_count + 1,
        last_purchase_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'itemId', p_item_id,
        'gemsSpent', v_item.price_gems
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 17: GUILD SYSTEM
-- =====================================================

-- Create guild (costs 500 gems)
CREATE OR REPLACE FUNCTION rpc_guild_create(p_name TEXT, p_description TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_gems BIGINT;
    v_guild_id UUID;
BEGIN
    SELECT premium_currency INTO v_gems FROM players WHERE id = v_user_id;
    IF v_gems < 500 THEN
        RAISE EXCEPTION 'Insufficient gems (need 500)';
    END IF;

    IF EXISTS (SELECT 1 FROM guild_members WHERE player_id = v_user_id) THEN
        RAISE EXCEPTION 'Already in a guild';
    END IF;

    IF LENGTH(p_name) < 3 OR LENGTH(p_name) > 20 THEN
        RAISE EXCEPTION 'Guild name must be 3-20 characters';
    END IF;

    UPDATE players SET premium_currency = premium_currency - 500 WHERE id = v_user_id;

    INSERT INTO guilds (name, description, leader_id)
    VALUES (p_name, p_description, v_user_id)
    RETURNING id INTO v_guild_id;

    INSERT INTO guild_members (player_id, guild_id, role)
    VALUES (v_user_id, v_guild_id, 'leader');

    RETURN jsonb_build_object(
        'success', true,
        'guildId', v_guild_id,
        'name', p_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join guild
CREATE OR REPLACE FUNCTION rpc_guild_join(p_guild_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_guild RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM guild_members WHERE player_id = v_user_id) THEN
        RAISE EXCEPTION 'Already in a guild';
    END IF;

    SELECT * INTO v_guild FROM guilds WHERE id = p_guild_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guild not found';
    END IF;

    IF v_guild.member_count >= v_guild.max_members THEN
        RAISE EXCEPTION 'Guild is full';
    END IF;

    INSERT INTO guild_members (player_id, guild_id, role)
    VALUES (v_user_id, p_guild_id, 'member');

    UPDATE guilds SET member_count = member_count + 1 WHERE id = p_guild_id;

    RETURN jsonb_build_object('success', true, 'guildName', v_guild.name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leave guild
CREATE OR REPLACE FUNCTION rpc_guild_leave()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_guild_id UUID;
    v_role TEXT;
BEGIN
    SELECT guild_id, role INTO v_guild_id, v_role
    FROM guild_members WHERE player_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not in a guild';
    END IF;

    IF v_role = 'leader' THEN
        RAISE EXCEPTION 'Leader cannot leave. Transfer leadership or dissolve guild.';
    END IF;

    DELETE FROM guild_members WHERE player_id = v_user_id;
    UPDATE guilds SET member_count = member_count - 1 WHERE id = v_guild_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donate to guild (currency, gives guild exp)
CREATE OR REPLACE FUNCTION rpc_guild_donate(p_amount INTEGER DEFAULT 100)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_guild_id UUID;
    v_currency BIGINT;
BEGIN
    SELECT gm.guild_id INTO v_guild_id
    FROM guild_members gm WHERE gm.player_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not in a guild';
    END IF;

    SELECT currency INTO v_currency FROM players WHERE id = v_user_id;
    IF v_currency < p_amount THEN
        RAISE EXCEPTION 'Insufficient currency';
    END IF;

    UPDATE players SET currency = currency - p_amount WHERE id = v_user_id;

    -- Contribution goes to player and guild exp
    UPDATE guild_members SET contribution = contribution + p_amount WHERE player_id = v_user_id;
    UPDATE guilds SET exp = exp + p_amount WHERE id = v_guild_id;

    RETURN jsonb_build_object(
        'success', true,
        'donated', p_amount,
        'guildExp', (SELECT exp FROM guilds WHERE id = v_guild_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get guild info
CREATE OR REPLACE FUNCTION rpc_guild_get_info()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_guild_id UUID;
    v_guild RECORD;
    v_members JSONB;
BEGIN
    SELECT gm.guild_id INTO v_guild_id
    FROM guild_members gm WHERE gm.player_id = v_user_id;

    IF v_guild_id IS NULL THEN
        RETURN jsonb_build_object('inGuild', false);
    END IF;

    SELECT * INTO v_guild FROM guilds WHERE id = v_guild_id;

    SELECT jsonb_agg(jsonb_build_object(
        'playerId', gm.player_id,
        'username', COALESCE(p.username, 'Anónimo'),
        'role', gm.role,
        'contribution', gm.contribution,
        'joinedAt', gm.joined_at
    ) ORDER BY gm.contribution DESC)
    INTO v_members
    FROM guild_members gm
    JOIN players p ON p.id = gm.player_id
    WHERE gm.guild_id = v_guild_id;

    RETURN jsonb_build_object(
        'inGuild', true,
        'guildId', v_guild.id,
        'name', v_guild.name,
        'description', v_guild.description,
        'level', v_guild.level,
        'exp', v_guild.exp,
        'memberCount', v_guild.member_count,
        'maxMembers', v_guild.max_members,
        'leaderId', v_guild.leader_id,
        'members', COALESCE(v_members, '[]'::JSONB)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;