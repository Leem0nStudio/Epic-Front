-- =====================================================
-- EPIC RPG: SCHEMA ADDITIONS (Fase 1)
-- Enemy templates + Stages tables (Ragnarok-style data-driven)
-- =====================================================

-- =====================================================
-- SECTION: ENEMY TEMPLATES (Ragnarok mob_db.yml style)
-- =====================================================

CREATE TABLE IF NOT EXISTS enemy_templates (
    id TEXT PRIMARY KEY, -- ej: 'slime_1', 'knight_40'
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    base_level INTEGER NOT NULL,
    base_hp INTEGER NOT NULL,
    base_atk INTEGER NOT NULL,
    base_def INTEGER NOT NULL,
    base_matk INTEGER NOT NULL,
    base_mdef INTEGER NOT NULL,
    base_agi INTEGER NOT NULL,
    growth_factor FLOAT DEFAULT 1.05, -- 5% growth per level difference
    skill_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    elemental_type TEXT DEFAULT 'neutral',
    race TEXT DEFAULT 'demihuman',
    size TEXT DEFAULT 'medium'
);

-- =====================================================
-- SECTION: STAGES (Migrated from campaign-data.ts)
-- =====================================================

CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY, -- ej: 'chapter_1'
    version TEXT REFERENCES game_configs(version),
    index_num INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS stages (
    id TEXT PRIMARY KEY, -- ej: 'stage_1_1'
    chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
    index_num INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    energy_cost INTEGER DEFAULT 5,
    enemy_template_ids TEXT[] DEFAULT ARRAY[]::TEXT[], -- Refs to enemy_templates
    enemy_positions INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    rewards_currency INTEGER DEFAULT 100,
    rewards_exp INTEGER DEFAULT 50,
    rewards_materials JSONB DEFAULT '[]'::JSONB,
    first_clear_currency INTEGER,
    first_clear_premium INTEGER,
    first_clear_exp INTEGER,
    first_clear_materials JSONB DEFAULT '[]'::JSONB,
    star_conditions JSONB DEFAULT '[]'::JSONB,
    unlock_stage_id TEXT REFERENCES stages(id),
    min_player_level INTEGER DEFAULT 1
);

-- =====================================================
-- SECTION: STAGE REWARDS (Optional normalized table)
-- =====================================================

CREATE TABLE IF NOT EXISTS stage_rewards (
    stage_id TEXT REFERENCES stages(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL, -- 'normal' | 'first_clear'
    currency INTEGER DEFAULT 0,
    premium_currency INTEGER DEFAULT 0,
    exp INTEGER DEFAULT 0,
    materials JSONB DEFAULT '[]'::JSONB,
    PRIMARY KEY (stage_id, reward_type)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE enemy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_rewards ENABLE ROW LEVEL SECURITY;

-- Polcies: Read-only for authenticated users
CREATE POLICY "Allow authenticated read enemy_templates" ON enemy_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read chapters" ON chapters
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read stages" ON stages
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read stage_rewards" ON stage_rewards
    FOR SELECT TO authenticated USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_stages_chapter ON stages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_stages_unlock ON stages(unlock_stage_id);
CREATE INDEX IF NOT EXISTS idx_enemy_templates_level ON enemy_templates(base_level);
