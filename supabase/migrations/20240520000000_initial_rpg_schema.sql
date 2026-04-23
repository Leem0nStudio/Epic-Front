-- RPG System Schema for Supabase (Final Secure Version)

-- 1. Metadata & Versioning
CREATE TABLE IF NOT EXISTS game_data_versions (
    id SERIAL PRIMARY KEY,
    version_string TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Static Data (Definitions)
CREATE TABLE IF NOT EXISTS job_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier INTEGER NOT NULL,
    parent_job_id TEXT REFERENCES job_definitions(id),
    stat_modifiers JSONB NOT NULL,
    allowed_weapons TEXT[] NOT NULL,
    skills_unlocked JSONB NOT NULL,
    passive_effects TEXT[] NOT NULL,
    evolution_requirements JSONB NOT NULL,
    version_id INTEGER REFERENCES game_data_versions(id)
);

CREATE TABLE IF NOT EXISTS item_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    stats JSONB,
    special_effects TEXT[],
    config JSONB,
    version_id INTEGER REFERENCES game_data_versions(id)
);

-- 3. Player Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    currency BIGINT DEFAULT 0,
    premium_currency BIGINT DEFAULT 0,
    pulls_since_epic INTEGER DEFAULT 0,
    pulls_since_legendary INTEGER DEFAULT 0,
    party_size_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Units
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    base_stats JSONB NOT NULL,
    growth_rates JSONB NOT NULL,
    affinity TEXT NOT NULL,
    trait TEXT,
    current_job_id TEXT REFERENCES job_definitions(id),
    unlocked_jobs TEXT[] DEFAULT ARRAY['novice'],
    equipped_weapon_instance_id UUID,
    equipped_cards_instances_ids UUID[] DEFAULT ARRAY[]::UUID[],
    equipped_skills_instances_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_definition_id TEXT REFERENCES item_definitions(id),
    quantity INTEGER DEFAULT 1,
    custom_stats JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE units ADD CONSTRAINT fk_equipped_weapon FOREIGN KEY (equipped_weapon_instance_id) REFERENCES inventory_items(id) ON DELETE SET NULL;

-- 6. Party System
CREATE TABLE IF NOT EXISTS party_slots (
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    PRIMARY KEY (owner_id, slot_index)
);

-- 7. Recruitment System
CREATE TABLE IF NOT EXISTS recruitment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    generated_unit_data JSONB NOT NULL,
    available_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SECURE ATOMIC RPC FUNCTIONS
-- ==========================================

-- 1. Initialize Player (Atomic)
CREATE OR REPLACE FUNCTION rpc_initialize_player(
    p_username TEXT,
    p_novices JSONB[] -- Array of unit data
)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_novice JSONB;
    v_unit_id UUID;
    v_idx INTEGER := 0;
BEGIN
    -- Create Profile
    INSERT INTO profiles (id, username, currency, premium_currency)
    VALUES (v_user_id, p_username, 5000, 100);

    -- Create Units and Assign to Party
    FOREACH v_novice IN ARRAY p_novices LOOP
        INSERT INTO units (owner_id, name, base_stats, growth_rates, affinity, trait, current_job_id)
        VALUES (v_user_id, v_novice->>'name', (v_novice->'baseStats'), (v_novice->'growthRates'), v_novice->>'affinity', v_novice->>'trait', 'novice')
        RETURNING id INTO v_unit_id;

        INSERT INTO party_slots (owner_id, slot_index, unit_id)
        VALUES (v_user_id, v_idx, v_unit_id);

        v_idx := v_idx + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Pull Gacha (Secure & Atomic)
CREATE OR REPLACE FUNCTION rpc_pull_gacha(p_amount INTEGER)
RETURNS TABLE(item_id TEXT, item_name TEXT, item_rarity TEXT) AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_cost_per_pull INTEGER := 10;
    v_total_cost INTEGER := p_amount * v_cost_per_pull;
    v_balance BIGINT;
    v_p_epic INTEGER;
    v_p_leg INTEGER;
    v_active_version_id INTEGER;
    v_roll FLOAT;
    v_rarity TEXT;
    v_target_item_id TEXT;
    v_target_item_name TEXT;
BEGIN
    -- 1. Check currency & Pity
    SELECT premium_currency, pulls_since_epic, pulls_since_legendary
    INTO v_balance, v_p_epic, v_p_leg
    FROM profiles WHERE id = v_user_id;

    IF v_balance < v_total_cost THEN
        RAISE EXCEPTION 'Insufficient currency';
    END IF;

    SELECT id INTO v_active_version_id FROM game_data_versions WHERE is_active = true LIMIT 1;

    -- Loop for pulls
    FOR i IN 1..p_amount LOOP
        v_p_epic := v_p_epic + 1;
        v_p_leg := v_p_leg + 1;

        v_roll := random();
        IF v_p_leg >= 80 OR v_roll < 0.03 THEN v_rarity := 'legendary'; v_p_leg := 0; v_p_epic := 0;
        ELSIF v_p_epic >= 10 OR v_roll < 0.15 THEN v_rarity := 'epic'; v_p_epic := 0;
        ELSIF v_roll < 0.40 THEN v_rarity := 'rare';
        ELSE v_rarity := 'common';
        END IF;

        -- Select random item from DB pool for that rarity
        SELECT id, name INTO v_target_item_id, v_target_item_name
        FROM item_definitions
        WHERE rarity = v_rarity AND version_id = v_active_version_id
        ORDER BY random() LIMIT 1;

        -- Grant item
        INSERT INTO inventory_items (owner_id, item_definition_id) VALUES (v_user_id, v_target_item_id);

        item_id := v_target_item_id;
        item_name := v_target_item_name;
        item_rarity := v_rarity;
        RETURN NEXT;
    END LOOP;

    -- Update Profile
    UPDATE profiles SET
        premium_currency = premium_currency - v_total_cost,
        pulls_since_epic = v_p_epic,
        pulls_since_legendary = v_p_leg
    WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Evolve Unit (Secure & Atomic)
CREATE OR REPLACE FUNCTION rpc_evolve_unit(p_unit_id UUID, p_target_job_id TEXT)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_current_job_id TEXT;
    v_level INTEGER;
    v_reqs JSONB;
    v_parent_job_id TEXT;
    v_cost BIGINT;
BEGIN
    v_user_id := auth.uid();

    -- 1. Get current unit status
    SELECT current_job_id, level INTO v_current_job_id, v_level FROM units WHERE id = p_unit_id AND owner_id = v_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Unit not found or unauthorized'; END IF;

    -- 2. Get target job requirements
    SELECT evolution_requirements, parent_job_id INTO v_reqs, v_parent_job_id FROM job_definitions WHERE id = p_target_job_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Target job not found'; END IF;

    -- 3. Validation: Correct parent job
    IF v_current_job_id IS DISTINCT FROM v_parent_job_id THEN
        RAISE EXCEPTION 'Incorrect evolution path. Expected parent: %', v_parent_job_id;
    END IF;

    -- 4. Validation: Level
    IF v_level < (v_reqs->>'minLevel')::INTEGER THEN
        RAISE EXCEPTION 'Level too low. Requires level %', v_reqs->>'minLevel';
    END IF;

    v_cost := (v_reqs->>'currencyCost')::BIGINT;

    -- 5. Validation & Deduction: Currency
    UPDATE profiles SET currency = currency - v_cost WHERE id = v_user_id AND currency >= v_cost;
    IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient currency'; END IF;

    -- 6. Update Unit
    UPDATE units SET
        current_job_id = p_target_job_id,
        unlocked_jobs = ARRAY(SELECT DISTINCT UNNEST(array_append(unlocked_jobs, p_target_job_id)))
    WHERE id = p_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are private" ON profiles FOR ALL USING (auth.uid() = id);
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Units are private" ON units FOR ALL USING (auth.uid() = owner_id);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory is private" ON inventory_items FOR ALL USING (auth.uid() = owner_id);
ALTER TABLE party_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Party is private" ON party_slots FOR ALL USING (auth.uid() = owner_id);
ALTER TABLE recruitment_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruitment is private" ON recruitment_slots FOR ALL USING (auth.uid() = owner_id);
