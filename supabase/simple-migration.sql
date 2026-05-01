-- =============================================
-- SIMPLE MIGRATION - Only essential tables
-- =============================================

-- Players table (CRITICAL - this is what's missing)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    currency INTEGER DEFAULT 1000,
    energy INTEGER DEFAULT 100,
    max_energy INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    current_job_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gacha state
CREATE TABLE IF NOT EXISTS gacha_state (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    pity_counter INTEGER DEFAULT 0,
    last_guaranteed TIMESTAMP WITH TIME ZONE,
    banner_id TEXT,
    PRIMARY KEY (player_id)
);

-- Jobs (static data)
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    version TEXT,
    name TEXT NOT NULL,
    tier INTEGER NOT NULL,
    parent_job_id TEXT,
    stat_modifiers JSONB NOT NULL,
    allowed_weapons TEXT[] NOT NULL,
    skills_unlocked JSONB NOT NULL,
    passive_effects TEXT[] NOT NULL,
    evolution_requirements JSONB NOT NULL
);

-- Game configs
CREATE TABLE IF NOT EXISTS game_configs (
    version TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERT TEST PLAYER
INSERT INTO players (id, username, currency, energy, max_energy, level, experience, current_job_id)
VALUES ('7e71e36c-2e63-446e-bec5-cf96125b3fa8', 'TestPlayer', 10000, 100, 100, 10, 500, 'novice')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

-- INSERT TEST JOB
INSERT INTO jobs (id, version, name, tier, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements)
VALUES ('novice', '1.0.0', 'Novice', 0, 
'{"hp": 1.0, "atk": 1.0, "def": 1.0, "matk": 1.0, "mdef": 1.0, "agi": 1.0}',
'{"dagger", "sword"}',
'[{"id": "basic_attack", "name": "Basic Attack", "type": "active", "powerMod": 1.0, "cooldown": 0}]',
'{}',
'{"minLevel": 1}')
ON CONFLICT (id) DO NOTHING;

-- INSERT CONFIG
INSERT INTO game_configs (version, is_active, config_data)
VALUES ('1.0.0', true, '{"party_size_limit": 4, "max_unit_level": 99, "energy_regen_rate": 60}')
ON CONFLICT (version) DO UPDATE SET is_active = EXCLUDED.is_active;

-- RPC: initialize_player
CREATE OR REPLACE FUNCTION rpc_initialize_player(p_player_id UUID, p_username TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO players (id, username, energy, max_energy, currency, level, current_job_id) 
    VALUES (p_player_id, p_username, 100, 100, 1000, 1, 'novice')
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

    INSERT INTO gacha_state (player_id) 
    VALUES (p_player_id)
    ON CONFLICT (player_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Verify
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;