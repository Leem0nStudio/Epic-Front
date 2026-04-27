-- Epic RPG Schema - Final Version (Cleaned and Restored)

-- 1. Game Config & Data Versioning
CREATE TABLE game_configs (
    version TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Master Data Tables
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    tier INTEGER NOT NULL,
    parent_job_id TEXT,
    stat_modifiers JSONB NOT NULL,
    allowed_weapons TEXT[],
    skills_unlocked JSONB,
    passive_effects TEXT[],
    evolution_requirements JSONB
);

CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    description TEXT,
    cooldown INTEGER DEFAULT 0,
    effect JSONB,
    scaling JSONB,
    rarity TEXT NOT NULL
);

CREATE TABLE cards (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    effect_target TEXT NOT NULL,
    effect_value TEXT NOT NULL,
    applicable_jobs TEXT[]
);

CREATE TABLE weapons (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    stat_bonuses JSONB NOT NULL,
    special_effects JSONB
);

CREATE TABLE job_cores (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    unlocks_job_id TEXT REFERENCES jobs(id)
);

-- 3. Player Data Tables
CREATE TABLE players (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT NOT NULL,
    currency BIGINT DEFAULT 1000,
    premium_currency INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 20,
    max_energy INTEGER DEFAULT 20,
    last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    party_size_limit INTEGER DEFAULT 3,
    inventory_slots INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gacha_state (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    pulls_since_epic INTEGER DEFAULT 0,
    pulls_since_legendary INTEGER DEFAULT 0,
    last_pull_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE units (
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
    sprite_id TEXT,
    icon_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE party (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    PRIMARY KEY (player_id, slot_index)
);

CREATE TABLE recruitment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_data JSONB NOT NULL,
    available_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_claimed BOOLEAN DEFAULT false
);

CREATE TABLE campaign_progress (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    best_turns INTEGER,
    PRIMARY KEY (player_id, slot_index) -- ERROR IN ORIGINAL SCHEMA, should be stage_id
);
-- Fixing potential PK error in campaign_progress if it existed
ALTER TABLE campaign_progress DROP CONSTRAINT IF EXISTS campaign_progress_pkey;
ALTER TABLE campaign_progress ADD PRIMARY KEY (player_id, stage_id);

-- 4. RPC Functions

-- Regen Energy
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

    IF v_current_energy IS NULL THEN RETURN; END IF;

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

-- Deduct Energy (Atomic)
CREATE OR REPLACE FUNCTION rpc_deduct_energy(p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_energy INTEGER;
BEGIN
    SELECT energy INTO v_current_energy FROM players WHERE id = v_user_id;

    IF v_current_energy < p_amount THEN
        RETURN FALSE;
    END IF;

    UPDATE players SET energy = energy - p_amount WHERE id = v_user_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete Stage
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize Player
CREATE OR REPLACE FUNCTION rpc_initialize_player(p_username TEXT, p_novices JSONB[])
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_novice JSONB;
    v_unit_id UUID;
    v_idx INTEGER := 0;
BEGIN
    INSERT INTO players (id, username, energy, max_energy, last_energy_regen)
    VALUES (v_user_id, p_username, 20, 20, NOW())
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

-- 5. RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players own" ON players FOR ALL USING (auth.uid() = id);

ALTER TABLE gacha_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gacha own" ON gacha_state FOR ALL USING (auth.uid() = player_id);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Units own" ON units FOR ALL USING (auth.uid() = player_id);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory own" ON inventory FOR ALL USING (auth.uid() = player_id);

ALTER TABLE party ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Party own" ON party FOR ALL USING (auth.uid() = player_id);

ALTER TABLE recruitment_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruitment own" ON recruitment_queue FOR ALL USING (auth.uid() = player_id);

ALTER TABLE campaign_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign own" ON campaign_progress FOR ALL USING (auth.uid() = player_id);

ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config public" ON game_configs FOR SELECT USING (true);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs public" ON jobs FOR SELECT USING (true);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills public" ON skills FOR SELECT USING (true);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards public" ON cards FOR SELECT USING (true);

ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weapons public" ON weapons FOR SELECT USING (true);

ALTER TABLE job_cores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cores public" ON job_cores FOR SELECT USING (true);
