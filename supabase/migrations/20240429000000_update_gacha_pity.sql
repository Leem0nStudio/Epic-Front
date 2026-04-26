-- Update Gacha RPC with new pity thresholds and Reward Logic
CREATE OR REPLACE FUNCTION rpc_pull_gacha(p_amount INTEGER, p_currency_type TEXT)
RETURNS TABLE(item_id TEXT, item_name TEXT, item_rarity TEXT, item_type TEXT) AS $$
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
    -- 1. Determine cost & validate balance
    IF p_currency_type = 'premium' THEN
        v_cost_per_pull := 50;
        SELECT premium_currency INTO v_balance FROM players WHERE id = v_user_id;
    ELSE
        v_cost_per_pull := 100;
        SELECT currency INTO v_balance FROM players WHERE id = v_user_id;
    END IF;

    v_total_cost := CASE WHEN p_amount >= 10 THEN (p_amount - 1) * v_cost_per_pull ELSE p_amount * v_cost_per_pull END;

    IF v_balance < v_total_cost THEN RAISE EXCEPTION 'Moneda insuficiente'; END IF;

    -- 2. Fetch state
    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    SELECT pulls_since_epic, pulls_since_legendary INTO v_p_epic, v_p_leg FROM gacha_state WHERE player_id = v_user_id;

    -- 3. Execution Loop
    FOR i IN 1..p_amount LOOP
        v_p_epic := v_p_epic + 1;
        v_p_leg := v_p_leg + 1;

        v_roll := random();

        -- Apply Pity: Legendary every 50, Epic every 10
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

        -- 4. Decide Reward Type
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

        -- 5. Fetch Random Item
        IF v_target_type = 'card' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM cards WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'weapon' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM weapons WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'skill' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM skills WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSE -- job_core
            SELECT id, name INTO v_target_id, v_target_name FROM job_cores WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        END IF;

        -- Fallback if specific type pool is empty (e.g. no common weapons)
        IF v_target_id IS NULL THEN
            SELECT id, name, 'card' INTO v_target_id, v_target_name, v_target_type FROM cards WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        END IF;

        -- 6. Grant Reward
        IF v_target_id IS NOT NULL THEN
            INSERT INTO inventory (player_id, item_id, item_type) VALUES (v_user_id, v_target_id, v_target_type);
            item_id := v_target_id;
            item_name := v_target_name;
            item_rarity := v_rarity;
            item_type := v_target_type;
            RETURN NEXT;
        END IF;
    END LOOP;

    -- 7. Finalize State
    IF p_currency_type = 'premium' THEN
        UPDATE players SET premium_currency = premium_currency - v_total_cost WHERE id = v_user_id;
    ELSE
        UPDATE players SET currency = currency - v_total_cost WHERE id = v_user_id;
    END IF;

    UPDATE gacha_state SET
        pulls_since_epic = v_p_epic,
        pulls_since_legendary = v_p_leg,
        last_pull_at = NOW()
    WHERE player_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
