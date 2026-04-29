-- Fix Resource Systems Migration
-- This migration fixes: Unit EXP, Loot System, Energy Refill, Currency Functions

-- =============================================
-- 1. UNIT EXP SYSTEM (CRITICAL FIX)
-- =============================================

-- Add exp column to units table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'exp') THEN
        ALTER TABLE units ADD COLUMN exp INTEGER DEFAULT 0;
    END IF;
END $$;

-- Function to award EXP to units after battle
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
    -- Verify unit belongs to player
    SELECT exp, level INTO v_current_exp, v_current_level
    FROM units 
    WHERE id = p_unit_id AND player_id = v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unit not found';
    END IF;
    
    -- Add EXP
    v_current_exp := v_current_exp + p_exp_gain;
    v_next_level_exp := v_current_level * 100;
    
    -- Level up check (can level up multiple times)
    WHILE v_current_exp >= v_next_level_exp LOOP
        v_current_exp := v_current_exp - v_next_level_exp;
        v_current_level := v_current_level + 1;
        v_next_level_exp := v_current_level * 100;
    END LOOP;
    
    -- Update unit
    UPDATE units 
    SET exp = v_current_exp, 
        level = v_current_level
    WHERE id = p_unit_id AND player_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated rpc_complete_stage to award EXP to participating units
CREATE OR REPLACE FUNCTION rpc_complete_stage(
    p_stage_id TEXT,
    p_stars INTEGER,
    p_turns INTEGER,
    p_rewards JSONB,
    p_participating_units UUID[] DEFAULT NULL -- New parameter for units that fought
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
    
    -- 3. Award EXP to Participating Units (NEW!)
    IF p_participating_units IS NOT NULL AND array_length(p_participating_units, 1) > 0 THEN
        -- Each unit gets EXP based on performance (base 50 + bonus per turn saved)
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

-- =============================================
-- 2. ENERGY GEM REFILL
-- =============================================

CREATE OR REPLACE FUNCTION rpc_refill_energy_with_gems(
    p_gem_cost INTEGER DEFAULT 50
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_gems BIGINT;
BEGIN
    -- Check if player has enough gems
    SELECT premium_currency INTO v_current_gems FROM players WHERE id = v_user_id;
    
    IF v_current_gems < p_gem_cost THEN
        RAISE EXCEPTION 'Insufficient gems';
    END IF;
    
    -- Deduct gems and refill energy
    UPDATE players
    SET premium_currency = premium_currency - p_gem_cost,
        energy = max_energy,
        last_energy_regen = NOW()
    WHERE id = v_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. ADD CURRENCY FUNCTION (Missing)
-- =============================================

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

-- =============================================
-- 4. FIX INVENTORY ITEM TYPES (Standardize)
-- =============================================

-- Update any existing skill_scroll entries to skill
UPDATE inventory SET item_type = 'skill' WHERE item_type = 'skill_scroll';

-- =============================================
-- 5. ADD ENEMY LOOT TABLES SUPPORT
-- =============================================

-- Add enemy_id to campaign_progress for better tracking (optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_progress' AND column_name = 'enemy_data') THEN
        ALTER TABLE campaign_progress ADD COLUMN enemy_data JSONB DEFAULT NULL;
    END IF;
END $$;

-- =============================================
-- 6. UNIT PROGRESSION HELPER VIEWS
-- =============================================

-- View to see unit progress
CREATE OR REPLACE VIEW unit_progress AS
SELECT 
    u.id,
    u.player_id,
    u.name,
    u.level,
    u.exp,
    u.current_job_id,
    (u.level * 100) as next_level_exp,
    ROUND((u.exp::FLOAT / (u.level * 100) * 100), 2) as exp_percentage
FROM units u;

-- Grant access to the view
GRANT SELECT ON unit_progress TO authenticated;
