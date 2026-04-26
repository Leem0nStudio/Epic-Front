-- 1. CLEANUP LEGACY TABLES
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS party_slots CASCADE;
DROP TABLE IF EXISTS recruitment_slots CASCADE;

-- 2. ENSURE CORE TABLES EXIST WITH CORRECT SCHEMA
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    currency BIGINT DEFAULT 1000,
    premium_currency BIGINT DEFAULT 100,
    party_size_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    base_stats JSONB NOT NULL,
    growth_rates JSONB NOT NULL,
    affinity TEXT NOT NULL,
    trait TEXT,
    current_job_id TEXT NOT NULL,
    unlocked_jobs TEXT[] DEFAULT ARRAY['novice'],
    equipped_weapon_instance_id UUID,
    equipped_card_instance_ids UUID[] DEFAULT ARRAY[]::UUID[],
    equipped_skill_instance_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS party (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    PRIMARY KEY (player_id, slot_index)
);

CREATE TABLE IF NOT EXISTS recruitment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_data JSONB NOT NULL,
    available_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENHANCED RPCs

-- Atomic Currency Update
CREATE OR REPLACE FUNCTION rpc_add_currency(p_zeny BIGINT, p_gems BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE players
    SET currency = currency + p_zeny,
        premium_currency = premium_currency + p_gems
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset Player Data (Internal Use/Onboarding)
CREATE OR REPLACE FUNCTION rpc_reset_player_data()
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    DELETE FROM party WHERE player_id = v_user_id;
    DELETE FROM units WHERE player_id = v_user_id;
    DELETE FROM inventory WHERE player_id = v_user_id;
    DELETE FROM recruitment_queue WHERE player_id = v_user_id;
    DELETE FROM gacha_state WHERE player_id = v_user_id;

    UPDATE players SET
        currency = 1000,
        premium_currency = 100,
        party_size_limit = 3
    WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix rpc_initialize_player to be more robust
CREATE OR REPLACE FUNCTION rpc_initialize_player(
    p_username TEXT,
    p_novices JSONB[]
)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_novice JSONB;
    v_unit_id UUID;
    v_idx INTEGER := 0;
BEGIN
    INSERT INTO players (id, username)
    VALUES (v_user_id, p_username)
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

    INSERT INTO gacha_state (player_id)
    VALUES (v_user_id)
    ON CONFLICT (player_id) DO NOTHING;

    -- Clear existing novices if any (to allow restart)
    DELETE FROM party WHERE player_id = v_user_id;
    DELETE FROM units WHERE player_id = v_user_id;

    FOREACH v_novice IN ARRAY p_novices LOOP
        INSERT INTO units (player_id, name, base_stats, growth_rates, affinity, trait, current_job_id)
        VALUES (v_user_id, v_novice->>'name', (v_novice->'baseStats'), (v_novice->'growthRates'), v_novice->>'affinity', v_novice->>'trait', 'novice')
        RETURNING id INTO v_unit_id;

        INSERT INTO party (player_id, slot_index, unit_id)
        VALUES (v_user_id, v_idx, v_unit_id);

        v_idx := v_idx + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RE-APPLY RLS (Ensuring everything is secure)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read players" ON players;
DROP POLICY IF EXISTS "Own player edit" ON players;
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Own player edit" ON players FOR ALL USING (auth.uid() = id);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Units own" ON units;
CREATE POLICY "Units own" ON units FOR ALL USING (auth.uid() = player_id);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inventory own" ON inventory;
CREATE POLICY "Inventory own" ON inventory FOR ALL USING (auth.uid() = player_id);

ALTER TABLE party ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Party own" ON party;
CREATE POLICY "Party own" ON party FOR ALL USING (auth.uid() = player_id);

ALTER TABLE recruitment_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recruitment own" ON recruitment_queue;
CREATE POLICY "Recruitment own" ON recruitment_queue FOR ALL USING (auth.uid() = player_id);
