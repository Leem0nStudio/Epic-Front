-- Track Player Campaign Progress
CREATE TABLE IF NOT EXISTS campaign_progress (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    best_turns INTEGER,
    cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (player_id, stage_id)
);

-- Add Stamina/Energy to Players
ALTER TABLE players ADD COLUMN IF NOT EXISTS energy INTEGER DEFAULT 20;
ALTER TABLE players ADD COLUMN IF NOT EXISTS max_energy INTEGER DEFAULT 20;
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add Unique Constraint to Inventory for easier reward granting (materials stack)
-- Note: Cards/Weapons might NOT stack in a real game, but materials definitely do.
-- For this simplified demo, we assume materials stack by item_id.
ALTER TABLE inventory ADD CONSTRAINT unique_player_item UNIQUE (player_id, item_id);

-- RPC to record stage completion and grant rewards
CREATE OR REPLACE FUNCTION rpc_complete_stage(
    p_stage_id TEXT,
    p_stars INTEGER,
    p_turns INTEGER,
    p_rewards JSONB
)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_material RECORD;
BEGIN
    -- 1. Upsert progress
    INSERT INTO campaign_progress (player_id, stage_id, stars, best_turns)
    VALUES (v_user_id, p_stage_id, p_stars, p_turns)
    ON CONFLICT (player_id, stage_id)
    DO UPDATE SET
        stars = GREATEST(campaign_progress.stars, EXCLUDED.stars),
        best_turns = LEAST(COALESCE(campaign_progress.best_turns, 999), EXCLUDED.best_turns);

    -- 2. Grant Rewards: Currency
    UPDATE players SET
        currency = currency + (p_rewards->>'currency')::BIGINT,
        premium_currency = premium_currency + COALESCE((p_rewards->>'premium_currency')::INTEGER, 0)
    WHERE id = v_user_id;

    -- 3. Grant Rewards: Materials
    IF p_rewards->'materials' IS NOT NULL AND jsonb_array_length(p_rewards->'materials') > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(p_rewards->'materials') AS x(itemId TEXT, amount INTEGER) LOOP
            INSERT INTO inventory (player_id, item_id, item_type, quantity)
            VALUES (v_user_id, v_material.itemId, 'material', v_material.amount)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + v_material.amount;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE campaign_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress" ON campaign_progress FOR ALL USING (auth.uid() = player_id);
