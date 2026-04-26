-- Epic_schema.sql
-- Consolidated schema for the RPG system

-- 1. Metadata & Config
CREATE TABLE game_configs (
    version TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Static Data (Content)
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    tier INTEGER NOT NULL,
    parent_job_id TEXT REFERENCES jobs(id),
    stat_modifiers JSONB NOT NULL,
    allowed_weapons TEXT[] NOT NULL,
    skills_unlocked JSONB NOT NULL,
    passive_effects TEXT[] NOT NULL,
    evolution_requirements JSONB NOT NULL
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
    effect_target TEXT NOT NULL, -- Added missing column
    effect_value JSONB,
    applicable_jobs TEXT[] NOT NULL
);

CREATE TABLE weapons (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    stat_bonuses JSONB,
    special_effects JSONB
);

CREATE TABLE job_cores (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    unlocks_job_id TEXT REFERENCES jobs(id)
);

-- 3. Player Data
CREATE TABLE players (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    currency BIGINT DEFAULT 1000,
    premium_currency BIGINT DEFAULT 100,
    energy INTEGER DEFAULT 20,
    max_energy INTEGER DEFAULT 20,
    last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    party_size_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_player_item UNIQUE (player_id, item_id)
);

CREATE TABLE party (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    PRIMARY KEY (player_id, slot_index)
);

CREATE TABLE recruitment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_data JSONB NOT NULL,
    available_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE campaign_progress (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    best_turns INTEGER,
    cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (player_id, stage_id)
);

-- 4. RPC Functions

-- Initialize Player
CREATE OR REPLACE FUNCTION rpc_initialize_player(p_username TEXT, p_novices JSONB[])
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_novice JSONB;
    v_unit_id UUID;
    v_idx INTEGER := 0;
BEGIN
    INSERT INTO players (id, username) VALUES (v_user_id, p_username)
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

    INSERT INTO gacha_state (player_id) VALUES (v_user_id)
    ON CONFLICT (player_id) DO NOTHING;

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

-- Pull Gacha
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
        ELSE -- job_core
            SELECT id, name INTO v_target_id, v_target_name FROM job_cores WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        END IF;

        IF v_target_id IS NULL THEN
            SELECT id, name, 'card' INTO v_target_id, v_target_name, v_target_type FROM cards WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        END IF;

        IF v_target_id IS NOT NULL THEN
            INSERT INTO inventory (player_id, item_id, item_type) VALUES (v_user_id, v_target_id, v_target_type)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + 1;
            item_id := v_target_id; item_name := v_target_name; item_rarity := v_rarity; item_type := v_target_type;
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

-- Evolve Unit
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
    SELECT current_job_id, level INTO v_current_job_id, v_level FROM units WHERE id = p_unit_id AND player_id = v_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Unidad no encontrada'; END IF;

    SELECT evolution_requirements, parent_job_id FROM jobs WHERE id = p_target_job_id AND version = v_active_version INTO v_reqs, v_parent_job_id;
    IF v_current_job_id IS DISTINCT FROM v_parent_job_id THEN RAISE EXCEPTION 'Ruta de evolución incorrecta'; END IF;
    IF v_level < (v_reqs->>'minLevel')::INTEGER THEN RAISE EXCEPTION 'Nivel insuficiente'; END IF;

    v_cost := (v_reqs->>'currencyCost')::BIGINT;
    v_materials := v_reqs->'materials';
    v_core_id := v_reqs->>'requiredJobCore';

    UPDATE players SET currency = currency - v_cost WHERE id = v_user_id AND currency >= v_cost;
    IF NOT FOUND THEN RAISE EXCEPTION 'Zeny insuficiente'; END IF;

    IF v_materials IS NOT NULL AND jsonb_array_length(v_materials) > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(v_materials) AS x(itemId TEXT, amount INTEGER) LOOP
            UPDATE inventory SET quantity = quantity - v_material.amount WHERE player_id = v_user_id AND item_id = v_material.itemId AND quantity >= v_material.amount;
            IF NOT FOUND THEN RAISE EXCEPTION 'Materiales faltantes'; END IF;
        END LOOP;
    END IF;

    IF v_core_id IS NOT NULL THEN
        UPDATE inventory SET quantity = quantity - 1 WHERE player_id = v_user_id AND item_id = v_core_id AND quantity >= 1;
        IF NOT FOUND THEN RAISE EXCEPTION 'Se requiere el núcleo de trabajo'; END IF;
    END IF;

    DELETE FROM inventory WHERE quantity <= 0;
    UPDATE units SET current_job_id = p_target_job_id, unlocked_jobs = array_append(unlocked_jobs, p_target_job_id) WHERE id = p_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete Stage
CREATE OR REPLACE FUNCTION rpc_complete_stage(p_stage_id TEXT, p_stars INTEGER, p_turns INTEGER, p_rewards JSONB)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_material RECORD;
BEGIN
    INSERT INTO campaign_progress (player_id, stage_id, stars, best_turns)
    VALUES (v_user_id, p_stage_id, p_stars, p_turns)
    ON CONFLICT (player_id, stage_id) DO UPDATE SET stars = GREATEST(campaign_progress.stars, EXCLUDED.stars), best_turns = LEAST(COALESCE(campaign_progress.best_turns, 999), EXCLUDED.best_turns);

    UPDATE players SET currency = currency + (p_rewards->>'currency')::BIGINT, premium_currency = premium_currency + COALESCE((p_rewards->>'premium_currency')::INTEGER, 0)
    WHERE id = v_user_id;

    IF p_rewards->'materials' IS NOT NULL AND jsonb_array_length(p_rewards->'materials') > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_to_recordset(p_rewards->'materials') AS x(itemId TEXT, amount INTEGER) LOOP
            INSERT INTO inventory (player_id, item_id, item_type, quantity) VALUES (v_user_id, v_material.itemId, 'material', v_material.amount)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + v_material.amount;
        END LOOP;
    END IF;
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
