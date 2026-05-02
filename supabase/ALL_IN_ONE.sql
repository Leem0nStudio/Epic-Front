-- =====================================================
-- EPIC FRONT - COMPLETE DATABASE SETUP
-- Execute this entire file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- SECTION 1: SCHEMA (from 01-schema.sql)
-- =====================================================

-- Metadata & Config
CREATE TABLE IF NOT EXISTS game_configs (
    version TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs (static content)
CREATE TABLE IF NOT EXISTS jobs (
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

-- Skills (static content)
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    description TEXT,
    cooldown INTEGER DEFAULT 0,
    effect JSONB,
    scaling JSONB,
    rarity TEXT NOT NULL
);

-- Cards (static content)
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    effect_value JSONB,
    applicable_jobs TEXT[]
);

-- Weapons (static content)
CREATE TABLE IF NOT EXISTS weapons (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    stat_bonuses JSONB,
    special_effects JSONB
);

-- Job Cores (static content)
CREATE TABLE IF NOT EXISTS job_cores (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    unlocks_job_id TEXT REFERENCES jobs(id)
);

-- Tags (for skill system)
CREATE TABLE IF NOT EXISTS tags (
    name TEXT PRIMARY KEY
);

-- Triggers (for events)
CREATE TABLE IF NOT EXISTS triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    trigger_type TEXT NOT NULL,
    trigger_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials (static content)
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    drop_sources JSONB
);

-- =====================================================
-- SECTION 2: PLAYER DATA
-- =====================================================

-- Players
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    currency BIGINT DEFAULT 0,
    premium_currency BIGINT DEFAULT 0,
    energy INTEGER DEFAULT 20,
    max_energy INTEGER DEFAULT 20,
    level INTEGER DEFAULT 1,
    exp BIGINT DEFAULT 0,
    party_size_limit INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units (characters)
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    exp BIGINT DEFAULT 0,
    base_stats JSONB NOT NULL,
    growth_rates JSONB NOT NULL,
    affinity TEXT NOT NULL,
    trait TEXT,
    current_job_id TEXT REFERENCES jobs(id),
    sprite_id TEXT,
    icon_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Party
CREATE TABLE IF NOT EXISTS party (
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    PRIMARY KEY (player_id, slot_index)
);

-- Recruitment Queue (tavern)
CREATE TABLE IF NOT EXISTS recruitment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    slot_id TEXT NOT NULL,
    unit_data JSONB NOT NULL,
    refresh_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_player_item UNIQUE (player_id, item_id)
);

-- =====================================================
-- SECTION 3: CAMPAIGN & PROGRESSION
-- =====================================================

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    index_num INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    unlock_requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stages
CREATE TABLE IF NOT EXISTS stages (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    index_num INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    energy_cost INTEGER DEFAULT 5,
    enemies JSONB NOT NULL DEFAULT '[]'::jsonb,
    rewards JSONB NOT NULL DEFAULT '{"currency": 0, "exp": 0, "materials": []}',
    first_clear_rewards JSONB,
    star_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    unlock_requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Progress
CREATE TABLE IF NOT EXISTS campaign_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL REFERENCES stages(id),
    stars INTEGER DEFAULT 0,
    best_turns INTEGER,
    clear_count INTEGER DEFAULT 0,
    first_clear_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, stage_id)
);

-- =====================================================
-- SECTION 4: GACHA STATE
-- =====================================================

-- Gacha State (pity tracking)
CREATE TABLE IF NOT EXISTS gacha_state (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    pulls_since_epic INTEGER DEFAULT 0,
    pulls_since_legendary INTEGER DEFAULT 0,
    total_pulls INTEGER DEFAULT 0,
    last_pull_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SECTION 5: CONSTRAINTS & INDEXES
-- =====================================================

ALTER TABLE inventory ADD CONSTRAINT chk_inventory_quantity CHECK (quantity > 0);

CREATE INDEX IF NOT EXISTS idx_units_player ON units(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player_type ON inventory(player_id, item_type);
CREATE INDEX IF NOT EXISTS idx_recruitment_player ON recruitment_queue(player_id);
CREATE INDEX IF NOT EXISTS idx_campaign_progress_player ON campaign_progress(player_id);

-- =====================================================
-- SECTION 6: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cores ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE party ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_state ENABLE ROW LEVEL SECURITY;

-- Allow read for static tables
CREATE POLICY "Allow read game_configs" ON game_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read jobs" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read skills" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read cards" ON cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read weapons" ON weapons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read job_cores" ON job_cores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read materials" ON materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read tags" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read triggers" ON triggers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read chapters" ON chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read stages" ON stages FOR SELECT TO authenticated USING (true);

-- Allow authenticated users full access to their data
CREATE POLICY "Allow authenticated players" ON players FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow authenticated units" ON units FOR ALL TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "Allow authenticated party" ON party FOR ALL TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "Allow authenticated recruitment" ON recruitment_queue FOR ALL TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "Allow authenticated inventory" ON inventory FOR ALL TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "Allow authenticated campaign" ON campaign_progress FOR ALL TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "Allow authenticated gacha" ON gacha_state FOR ALL TO authenticated USING (auth.uid() = player_id);

-- Grants
GRANT SELECT ON game_configs TO authenticated;
GRANT SELECT ON jobs TO authenticated;
GRANT SELECT ON skills TO authenticated;
GRANT SELECT ON cards TO authenticated;
GRANT SELECT ON weapons TO authenticated;
GRANT SELECT ON job_cores TO authenticated;
GRANT SELECT ON materials TO authenticated;
GRANT SELECT ON tags TO authenticated;
GRANT SELECT ON triggers TO authenticated;
GRANT SELECT ON chapters TO authenticated;
GRANT SELECT ON stages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON players TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON units TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON party TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON recruitment_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON campaign_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gacha_state TO authenticated;

-- =====================================================
-- Create critical tables if they don't exist (for incremental setup)
-- =====================================================

DO $$
BEGIN
    -- Players table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'players') THEN
        CREATE TABLE players (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username TEXT NOT NULL,
            currency BIGINT DEFAULT 0,
            premium_currency BIGINT DEFAULT 0,
            energy INTEGER DEFAULT 20,
            max_energy INTEGER DEFAULT 20,
            level INTEGER DEFAULT 1,
            exp BIGINT DEFAULT 0,
            party_size_limit INTEGER DEFAULT 5,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Units table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'units') THEN
        CREATE TABLE units (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            exp BIGINT DEFAULT 0,
            base_stats JSONB NOT NULL,
            growth_rates JSONB NOT NULL,
            affinity TEXT NOT NULL,
            trait TEXT,
            current_job_id TEXT,
            sprite_id TEXT,
            icon_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Inventory table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory') THEN
        CREATE TABLE inventory (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
            item_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT unique_player_item UNIQUE (player_id, item_id)
        );
    END IF;
    
    -- Party table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'party') THEN
        CREATE TABLE party (
            player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
            slot_index INTEGER NOT NULL,
            unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
            PRIMARY KEY (player_id, slot_index)
        );
    END IF;
    
    -- Gacha state table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gacha_state') THEN
        CREATE TABLE gacha_state (
            player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
            pulls_since_epic INTEGER DEFAULT 0,
            pulls_since_legendary INTEGER DEFAULT 0,
            total_pulls INTEGER DEFAULT 0,
            last_pull_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END $$;

-- =====================================================
-- SECTION 7: DATA (SEED)
-- =====================================================

-- Game Config
INSERT INTO game_configs (version, is_active, config_data)
VALUES ('1.0.0', true, '{"description": "Official Launch"}')
ON CONFLICT (version) DO UPDATE SET is_active = EXCLUDED.is_active;

-- Jobs (skills_unlocked and evolution_requirements are JSONB, not text[])
INSERT INTO jobs (id, version, name, tier, parent_job_id, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements)
VALUES
('novice', '1.0.0', 'Novice', 0, NULL, '{"hp": 100, "atk": 10, "def": 5, "matk": 10, "mdef": 5, "agi": 10}', '{}'::text[], '[]'::jsonb, '{}'::text[], '{}'),
('swordman', '1.0.0', 'Swordman', 1, 'novice', '{"hp": 150, "atk": 20, "def": 15, "matk": 5, "mdef": 5, "agi": 10}', ARRAY['sword','axe'], '[{"id":"basic_sword","level":1}]', '{}'::text[], '{"level":10,"items":[]}'),
('knight', '1.0.0', 'Knight', 2, 'swordman', '{"hp": 250, "atk": 30, "def": 30, "matk": 5, "mdef": 10, "agi": 10}', ARRAY['sword','axe','shield'], '[{"id":"shield_bash","level":1},{"id":"parry","level":5}]', ARRAY['defense_up'], '{"level":30,"items":["core_knight"]}'),
('warrior', '1.0.0', 'Warrior', 2, 'swordman', '{"hp": 200, "atk": 45, "def": 15, "matk": 5, "mdef": 5, "agi": 15}', ARRAY['sword','axe'], '[{"id":"berserk","level":1},{"id":"whirlwind","level":5}]', ARRAY['atk_up'], '{"level":30,"items":["core_warrior"]}'),
('mage', '1.0.0', 'Mage', 1, 'novice', '{"hp": 80, "atk": 5, "def": 5, "matk": 25, "mdef": 15, "agi": 15}', ARRAY['staff','rod'], '[{"id":"fire_bolt","level":1}]', '{}'::text[], '{"level":10,"items":[]}'),
('wizard', '1.0.0', 'Wizard', 2, 'mage', '{"hp": 100, "atk": 5, "def": 5, "matk": 40, "mdef": 25, "agi": 20}', ARRAY['staff','rod'], '[{"id":"meteor","level":1},{"id":"ice_spike","level":5}]', ARRAY['matk_up'], '{"level":30,"items":["core_wizard"]}'),
('priest', '1.0.0', 'Priest', 1, 'novice', '{"hp": 100, "atk": 5, "def": 10, "matk": 20, "mdef": 20, "agi": 10}', ARRAY['staff'], '[{"id":"heal","level":1}]', '{}'::text[], '{"level":10,"items":[]}'),
('acolyte', '1.0.0', 'Acolyte', 2, 'priest', '{"hp": 120, "atk": 5, "def": 15, "matk": 30, "mdef": 30, "agi": 15}', ARRAY['staff'], '[{"id":"blessing","level":1},{"id":"rejuvenate","level":5}]', ARRAY['heal_up'], '{"level":30,"items":["core_priest"]}')
ON CONFLICT (id) DO NOTHING;

-- Skills
INSERT INTO skills (id, version, name, description, cooldown, effect, scaling, rarity)
VALUES
('skill_heal', '1.0.0', 'Curar', 'Restaura HP', 2, '{"heal": 2.5}', '{"stat": "matk", "mult": 2.5}', 'rare'),
('skill_meteor', '1.0.0', 'Meteoro', 'Daño masivo', 4, '{"damage": 4.0}', '{"stat": "matk", "mult": 4.0}', 'epic'),
('skill_fire_bolt', '1.0.0', 'Fire Bolt', 'Daño de fuego', 1, '{"damage": 2.0, "scaling": "matk"}', '{"stat": "matk", "mult": 2.0}', 'common'),
('skill_ice_spike', '1.0.0', 'Ice Spike', 'Daño de hielo + lento', 3, '{"damage": 2.5, "scaling": "matk", "status": "slow", "chance": 0.5}', '{"stat": "matk", "mult": 2.5}', 'rare'),
('skill_shadow_strike', '1.0.0', 'Shadow Strike', 'Daño oscuro crítico', 3, '{"damage": 3.5, "scaling": "atk"}', '{"stat": "atk", "mult": 3.5}', 'epic'),
('skill_thunder', '1.0.0', 'Thunder', 'Daño de rayo a todos', 5, '{"damage": 2.0, "scaling": "matk", "target": "all_enemies"}', '{"stat": "matk", "mult": 2.0}', 'epic'),
('skill_poison_blast', '1.0.0', 'Poison Blast', 'Daño poison', 2, '{"damage": 1.5, "scaling": "matk", "status": "poison", "chance": 0.7}', '{"stat": "matk", "mult": 1.5}', 'rare'),
('skill_shield_bash', '1.0.0', 'Shield Bash', 'Daño + aturdir', 3, '{"damage": 2.0, "scaling": "atk", "status": "stun", "chance": 0.3}', '{"stat": "atk", "mult": 2.0}', 'rare'),
('skill_blessing', '1.0.0', 'Blessing', 'Buff de ataque', 4, '{"buff": "atk", "multiplier": 1.3, "duration": 3}', '{"stat": "matk", "mult": 0}', 'rare'),
('skill_rejuvenate', '1.0.0', 'Rejuvenate', 'Cura continua', 5, '{"dot": "heal", "power": 1.0, "duration": 3, "scaling": "matk"}', '{"stat": "matk", "mult": 1.0}', 'epic'),
('skill_fireball', '1.0.0', 'Bola de Fuego', 'Lanza una bola de fuego al enemigo', 2, '{"type": "damage", "power": 1.5}', '{"stat": "matk", "mult": 1.5}', 'rare')
ON CONFLICT (id) DO NOTHING;

-- Cards
INSERT INTO cards (id, version, name, rarity, effect_type, effect_value, applicable_jobs)
VALUES
('card_goblin', '1.0.0', 'Goblin Card', 'common', 'statBoost', '{"atk": 0.10}', '{"ALL"}'),
('card_zombie', '1.0.0', 'Zombie Card', 'common', 'statBoost', '{"hp": 0.15}', '{"ALL"}'),
('card_baphomet', '1.0.0', 'Baphomet Card', 'legendary', 'skillModifier', '{"all_skill_mult": 1.5}', '{"ALL"}'),
('card_power_up', '1.0.0', 'Poderío', 'common', 'damage', '{"power": 1.2}', '{"ALL"}'),
('card_light_heal', '1.0.0', 'Luz Curativa', 'epic', 'heal', '{"power": 2.0, "chance": 0.3}', '{"ALL"}')
ON CONFLICT (id) DO NOTHING;

-- Weapons
INSERT INTO weapons (id, version, name, weapon_type, rarity, stat_bonuses, special_effects)
VALUES
('wpn_blade', '1.0.0', 'Iron Blade', 'sword', 'common', '{"atk": 50, "def": 5}', '{}'),
('wpn_wand', '1.0.0', 'Apprentice Wand', 'staff', 'common', '{"matk": 60, "mdef": 10}', '{}'),
('wpn_murasame', '1.0.0', 'Murasame', 'sword', 'epic', '{"atk": 250, "agi": 40}', '{"bleed": 0.25}'),
('weapon_wooden_sword', '1.0.0', 'Espada de Madera', 'sword', 'common', '{"atk": 5}', NULL)
ON CONFLICT (id) DO NOTHING;

-- Job Cores (only referencing jobs that exist: swordman, mage, priest and their tier 2)
INSERT INTO job_cores (id, version, name, rarity, unlocks_job_id)
VALUES
('core_knight', '1.0.0', 'Knight Core', 'epic', 'knight'),
('core_wizard', '1.0.0', 'Wizard Core', 'epic', 'wizard'),
('core_paladin', '1.0.0', 'Paladin Core', 'legendary', NULL),
('core_crusader', '1.0.0', 'Crusader Core', 'legendary', NULL),
('core_sage', '1.0.0', 'Sage Core', 'legendary', NULL),
('core_archmage', '1.0.0', 'Archmage Core', 'legendary', NULL),
('core_arch_paladin', '1.0.0', 'Arch Paladin Core', 'mythic', NULL),
('core_grand_archmage', '1.0.0', 'Grand Archmage Core', 'mythic', NULL)
ON CONFLICT (id) DO NOTHING;

-- Tags
INSERT INTO tags (name) VALUES
('burn'), ('poison'), ('freeze'), ('stun'), ('sleep'),
('crit'), ('aoe'), ('chain'), ('heal'), ('shield'),
('buff'), ('debuff'), ('dot'), ('hot'), ('special')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 8: CHAPTERS & STAGES (CAMPAIGN)
-- =====================================================

-- Create tables if they don't exist (wrap in DO to avoid errors)
DO $$
BEGIN
    -- Chapters
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chapters') THEN
        CREATE TABLE chapters (
            id TEXT PRIMARY KEY,
            index_num INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            unlock_requirements JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Stages (create only if not exists, with all columns)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stages') THEN
        CREATE TABLE stages (
            id TEXT PRIMARY KEY,
            chapter_id TEXT NOT NULL,
            index_num INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            energy_cost INTEGER DEFAULT 5,
            enemies JSONB NOT NULL DEFAULT '[]'::jsonb,
            rewards JSONB NOT NULL DEFAULT '{"currency": 0, "exp": 0, "materials": []}',
            first_clear_rewards JSONB,
            star_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
            unlock_requirements JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Add enemies column if missing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stages' AND column_name = 'enemies') THEN
            ALTER TABLE stages ADD COLUMN enemies JSONB NOT NULL DEFAULT '[]'::jsonb;
        END IF;
    END IF;
END $$;

-- Add rewards column if missing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stages' AND column_name = 'rewards') THEN
            ALTER TABLE stages ADD COLUMN rewards JSONB NOT NULL DEFAULT '{"currency": 0, "exp": 0, "materials": []}';
        END IF;
    END IF;
END $$;

-- Add star_conditions column if missing  
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stages' AND column_name = 'star_conditions') THEN
            ALTER TABLE stages ADD COLUMN star_conditions JSONB NOT NULL DEFAULT '[]'::jsonb;
        END IF;
    END IF;
END $$;

INSERT INTO chapters (id, index_num, name, description) VALUES
('chapter_1', 1, 'Praderas del Destino', 'El comienzo de tu aventura.'),
('chapter_2', 2, 'Bosque Encantado', 'Un bosque misterioso lleno de magia.'),
('chapter_3', 3, 'Montañas Heladas', 'Las montañas más altas del reino.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stages (id, chapter_id, index_num, name, description, energy_cost, enemies, rewards, star_conditions) VALUES
('stage_1_1', 'chapter_1', 1, 'El Camino Real', 'Un sendero tranquilo.', 5, 
'[{"id":"slime_1","name":"Limo Débil","level":1,"position":0,"skillIds":["basic_attack"]},{"id":"slime_2","name":"Limo Débil","level":1,"position":1,"skillIds":["basic_attack"]}]',
'{"currency": 100, "exp": 50, "materials": []}',
'[{"type":"win","description":"Completa la etapa"},{"type":"no_deaths","description":"Sin bajas"}]'::jsonb),

('stage_1_2', 'chapter_1', 2, 'Bosque Susurrante', 'Los árboles guardan secretos.', 5,
'[{"id":"bat_1","name":"Murciélago","level":2,"position":0,"skillIds":["basic_attack"]},{"id":"slime_2","name":"Limo Pegajoso","level":2,"position":1,"skillIds":["debuff_slow"]}]',
'{"currency": 150, "exp": 80, "materials": []}',
'[{"type":"win","description":"Completa la etapa"},{"type":"no_deaths","description":"Sin bajas"}]'::jsonb),

('stage_1_3', 'chapter_1', 3, 'Ruinas de la Atalaya', 'Ecos de batallas pasadas.', 5,
'[{"id":"skeleton_1","name":"Esqueleto Guerrero","level":3,"position":0,"skillIds":["basic_attack","taunt"]},{"id":"skeleton_2","name":"Esqueleto Guerrero","level":3,"position":2,"skillIds":["basic_attack","taunt"]}]',
'{"currency": 200, "exp": 120, "materials": []}',
'[{"type":"win","description":"Limpia las ruinas"},{"type":"no_deaths","description":"Sin bajas"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SECTION 9: FUNCTIONS (RPC)
-- =====================================================

-- Player Initialization with starter items
CREATE OR REPLACE FUNCTION rpc_initialize_player(p_username TEXT, p_novices JSONB[])
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_novice JSONB;
    v_unit_id UUID;
    v_idx INTEGER := 0;
BEGIN
    INSERT INTO players (id, username, energy, max_energy, currency, premium_currency)
    VALUES (v_user_id, p_username, 30, 30, 1000, 50)
    ON CONFLICT (id) DO UPDATE SET 
        username = EXCLUDED.username,
        energy = EXCLUDED.energy,
        max_energy = EXCLUDED.max_energy;

    INSERT INTO gacha_state (player_id)
    VALUES (v_user_id)
    ON CONFLICT (player_id) DO NOTHING;

    DELETE FROM party WHERE player_id = v_user_id;
    DELETE FROM units WHERE player_id = v_user_id;
    DELETE FROM inventory WHERE player_id = v_user_id;

    FOREACH v_novice IN ARRAY p_novices LOOP
        INSERT INTO units (player_id, name, base_stats, growth_rates, affinity, trait, current_job_id, sprite_id, icon_id)
        VALUES (v_user_id, v_novice->>'name', (v_novice->'baseStats'), (v_novice->'growthRates'),
                v_novice->>'affinity', v_novice->>'trait', 'novice', v_novice->>'spriteId', v_novice->>'iconId')
        RETURNING id INTO v_unit_id;

        INSERT INTO party (player_id, slot_index, unit_id)
        VALUES (v_user_id, v_idx, v_unit_id);

        v_idx := v_idx + 1;
    END LOOP;

    INSERT INTO inventory (player_id, item_id, item_type, quantity)
    VALUES 
        (v_user_id, 'weapon_wooden_sword', 'weapon', 1),
        (v_user_id, 'card_power_up', 'card', 2),
        (v_user_id, 'skill_fireball', 'skill', 1),
        (v_user_id, 'card_light_heal', 'card', 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add starter inventory if empty
CREATE OR REPLACE FUNCTION rpc_add_starter_inventory()
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM inventory WHERE player_id = v_user_id) THEN
        INSERT INTO inventory (player_id, item_id, item_type, quantity)
        VALUES 
            (v_user_id, 'weapon_wooden_sword', 'weapon', 1),
            (v_user_id, 'card_power_up', 'card', 2),
            (v_user_id, 'skill_fireball', 'skill', 1),
            (v_user_id, 'card_light_heal', 'card', 1);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gacha Pull
CREATE OR REPLACE FUNCTION rpc_pull_gacha(p_amount INTEGER, p_currency_type TEXT)
RETURNS TABLE(res_item_id TEXT, res_item_name TEXT, res_item_rarity TEXT, res_item_type TEXT) AS $$
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

    IF v_balance < v_total_cost THEN
        RAISE EXCEPTION 'Moneda insuficiente';
    END IF;

    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    SELECT pulls_since_epic, pulls_since_legendary INTO v_p_epic, v_p_leg
    FROM gacha_state WHERE player_id = v_user_id;

    FOR i IN 1..p_amount LOOP
        v_p_epic := v_p_epic + 1;
        v_p_leg := v_p_leg + 1;
        v_roll := random();

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

        IF v_target_type = 'card' THEN
            SELECT id, name INTO v_target_id, v_target_name
            FROM cards WHERE rarity = v_rarity AND version = v_active_version
            ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'weapon' THEN
            SELECT id, name INTO v_target_id, v_target_name
            FROM weapons WHERE rarity = v_rarity AND version = v_active_version
            ORDER BY random() LIMIT 1;
        ELSIF v_target_type = 'skill' THEN
            SELECT id, name INTO v_target_id, v_target_name
            FROM skills WHERE rarity = v_rarity AND version = v_active_version
            ORDER BY random() LIMIT 1;
        ELSE
            SELECT id, name INTO v_target_id, v_target_name
            FROM job_cores WHERE rarity = v_rarity AND version = v_active_version
            ORDER BY random() LIMIT 1;
        END IF;

        IF v_target_id IS NOT NULL THEN
            INSERT INTO inventory (player_id, item_id, item_type)
            VALUES (v_user_id, v_target_id, v_target_type)
            ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = inventory.quantity + 1;

            res_item_id := v_target_id;
            res_item_name := v_target_name;
            res_item_rarity := v_rarity;
            res_item_type := v_target_type;
            RETURN NEXT;
        END IF;
    END LOOP;

    IF p_currency_type = 'premium' THEN
        UPDATE players SET premium_currency = premium_currency - v_total_cost WHERE id = v_user_id;
    ELSE
        UPDATE players SET currency = currency - v_total_cost WHERE id = v_user_id;
    END IF;

    UPDATE gacha_state SET 
        pulls_since_epic = v_p_epic,
        pulls_since_legendary = v_p_leg,
        total_pulls = total_pulls + p_amount,
        last_pull_at = NOW()
    WHERE player_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Energy Regen
CREATE OR REPLACE FUNCTION rpc_regen_energy()
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_max_energy INTEGER;
BEGIN
    SELECT max_energy INTO v_max_energy FROM players WHERE id = v_user_id;
    
    UPDATE players 
    SET energy = LEAST(energy + 1, COALESCE(v_max_energy, 20)),
        updated_at = NOW()
    WHERE id = v_user_id AND energy < COALESCE(v_max_energy, 20);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

SELECT '=== VERIFICATION ===' as status;
SELECT 'Tables created:' as check_name, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'Jobs:' as check_name, COUNT(*) as count FROM jobs;
SELECT 'Skills:' as check_name, COUNT(*) as count FROM skills;
SELECT 'Cards:' as check_name, COUNT(*) as count FROM cards;
SELECT 'Weapons:' as check_name, COUNT(*) as count FROM weapons;
SELECT 'Chapters:' as check_name, COUNT(*) as count FROM chapters;
SELECT 'Stages:' as check_name, COUNT(*) as count FROM stages;
SELECT 'Functions:' as check_name, COUNT(*) as count FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND prokind = 'f';

SELECT '✅ DATABASE READY!' as final_status;