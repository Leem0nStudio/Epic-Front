-- Consolidated RPG Schema (Final Version)
-- This migration fixes conflicts between 'profiles'/'players' and ensures data consistency.

-- 1. Metadata
CREATE TABLE IF NOT EXISTS game_configs (
    version TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Static Definitions
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT NOT NULL,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    tier INTEGER NOT NULL,
    parent_job_id TEXT,
    stat_modifiers JSONB NOT NULL,
    allowed_weapons TEXT[] NOT NULL,
    skills_unlocked JSONB NOT NULL,
    passive_effects TEXT[] NOT NULL,
    evolution_requirements JSONB NOT NULL,
    PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS skills (
    id TEXT NOT NULL,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    description TEXT,
    cooldown INTEGER DEFAULT 1,
    effect JSONB,
    scaling JSONB,
    rarity TEXT NOT NULL,
    PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS cards (
    id TEXT NOT NULL,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    effect_value JSONB NOT NULL,
    applicable_jobs TEXT[],
    PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS weapons (
    id TEXT NOT NULL,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    stat_bonuses JSONB NOT NULL,
    special_effects JSONB,
    PRIMARY KEY (id, version)
);

-- 3. Player State
-- Using 'players' as the primary table for player state
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    currency BIGINT DEFAULT 1000,
    premium_currency BIGINT DEFAULT 100,
    party_size_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gacha_state (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    pulls_since_epic INTEGER DEFAULT 0,
    pulls_since_legendary INTEGER DEFAULT 0,
    last_pull_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    base_stats JSONB NOT NULL, -- {hp, atk, def, matk, mdef, agi}
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
    item_type TEXT NOT NULL, -- 'card', 'weapon', 'skill_scroll', 'job_core'
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

-- 4. Secure RPC Functions

-- Initialize Player
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
    INSERT INTO players (id, username) VALUES (v_user_id, p_username)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO gacha_state (player_id) VALUES (v_user_id)
    ON CONFLICT (player_id) DO NOTHING;

    FOREACH v_novice IN ARRAY p_novices LOOP
        INSERT INTO units (player_id, name, base_stats, growth_rates, affinity, trait, current_job_id)
        VALUES (v_user_id, v_novice->>'name', (v_novice->'baseStats'), (v_novice->'growthRates'), v_novice->>'affinity', v_novice->>'trait', 'novice')
        RETURNING id INTO v_unit_id;

        INSERT INTO party (player_id, slot_index, unit_id)
        VALUES (v_user_id, v_idx, v_unit_id)
        ON CONFLICT (player_id, slot_index) DO UPDATE SET unit_id = EXCLUDED.unit_id;

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
        IF v_p_leg >= 80 OR v_roll < 0.02 THEN v_rarity := 'legendary'; v_p_leg := 0; v_p_epic := 0;
        ELSIF v_p_epic >= 10 OR v_roll < 0.10 THEN v_rarity := 'epic'; v_p_epic := 0;
        ELSIF v_roll < 0.35 THEN v_rarity := 'rare';
        ELSE v_rarity := 'common';
        END IF;

        v_roll := random();
        IF v_roll < 0.5 THEN v_target_type := 'card';
        ELSIF v_roll < 0.8 THEN v_target_type := 'weapon';
        ELSE v_target_type := 'skill_scroll';
        END IF;

        IF v_target_type = 'card' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM cards WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'weapon' THEN
            SELECT id, name INTO v_target_id, v_target_name FROM weapons WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        ELSE
            SELECT id, name INTO v_target_id, v_target_name FROM skills WHERE rarity = v_rarity AND version = v_active_version ORDER BY random() LIMIT 1;
        END IF;

        IF v_target_id IS NOT NULL THEN
            INSERT INTO inventory (player_id, item_id, item_type) VALUES (v_user_id, v_target_id, v_target_type);
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
BEGIN
    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    SELECT current_job_id, level INTO v_current_job_id, v_level FROM units WHERE id = p_unit_id AND player_id = v_user_id;

    SELECT evolution_requirements, parent_job_id INTO v_reqs, v_parent_job_id
    FROM jobs WHERE id = p_target_job_id AND version = v_active_version;

    IF v_current_job_id IS DISTINCT FROM v_parent_job_id THEN RAISE EXCEPTION 'Ruta de evolución incorrecta'; END IF;
    IF v_level < (v_reqs->>'minLevel')::INTEGER THEN RAISE EXCEPTION 'Nivel insuficiente'; END IF;

    v_cost := (v_reqs->>'currencyCost')::BIGINT;
    v_materials := v_reqs->'materials';

    UPDATE players SET currency = currency - v_cost WHERE id = v_user_id AND currency >= v_cost;
    IF NOT FOUND THEN RAISE EXCEPTION 'Zeny insuficiente'; END IF;

    IF v_materials IS NOT NULL AND jsonb_array_length(v_materials) > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_array_elements(v_materials) LOOP
            UPDATE inventory SET quantity = quantity - (v_material->>'amount')::INTEGER
            WHERE player_id = v_user_id AND item_id = v_material->>'itemId' AND quantity >= (v_material->>'amount')::INTEGER;
            IF NOT FOUND THEN RAISE EXCEPTION 'Materiales faltantes'; END IF;
        END LOOP;
        DELETE FROM inventory WHERE quantity <= 0;
    END IF;

    UPDATE units SET current_job_id = p_target_job_id, unlocked_jobs = array_append(unlocked_jobs, p_target_job_id) WHERE id = p_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Own player edit" ON players FOR ALL USING (auth.uid() = id);

ALTER TABLE gacha_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gacha private" ON gacha_state FOR ALL USING (auth.uid() = player_id);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Units own" ON units FOR ALL USING (auth.uid() = player_id);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory own" ON inventory FOR ALL USING (auth.uid() = player_id);

ALTER TABLE party ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Party own" ON party FOR ALL USING (auth.uid() = player_id);

ALTER TABLE recruitment_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruitment own" ON recruitment_queue FOR ALL USING (auth.uid() = player_id);

ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config public read" ON game_configs FOR SELECT USING (true);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs public read" ON jobs FOR SELECT USING (true);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills public read" ON skills FOR SELECT USING (true);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards public read" ON cards FOR SELECT USING (true);

ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weapons public read" ON weapons FOR SELECT USING (true);
