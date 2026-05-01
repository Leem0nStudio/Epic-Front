-- =============================================
-- Modular Skill System Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- TAGS (skill categories/traits)
-- =============================================
CREATE TABLE IF NOT EXISTS tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- =============================================
-- SKILL_MODULES (modular skill definitions)
-- =============================================
CREATE TABLE IF NOT EXISTS skill_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    base_power numeric NOT NULL DEFAULT 0,
    cooldown numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- SKILL_MODULE_TAGS (many-to-many)
-- =============================================
CREATE TABLE IF NOT EXISTS skill_module_tags (
    skill_id uuid NOT NULL REFERENCES skill_modules(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, tag_id)
);

-- =============================================
-- TRIGGERS (when effects activate)
-- =============================================
CREATE TABLE IF NOT EXISTS triggers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- Common trigger examples:
-- INSERT INTO triggers (id, name) VALUES 
--   (gen_random_uuid(), 'on_cast'),
--   (gen_random_uuid(), 'on_hit'),
--   (gen_random_uuid(), 'on_kill'),
--   (gen_random_uuid(), 'on_death'),
--   (gen_random_uuid(), 'turn_start'),
--   (gen_random_uuid(), 'turn_end');

-- =============================================
-- EFFECTS (what happens)
-- =============================================
CREATE TABLE IF NOT EXISTS effects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    value numeric,
    duration numeric,
    extra jsonb DEFAULT '{}'::jsonb
);

-- Effect types could include:
-- damage, heal, buff, debuff, shield, drain, transform, summon, etc.

-- =============================================
-- SKILL_MODULE_EFFECTS (links skills to effects with triggers)
-- =============================================
CREATE TABLE IF NOT EXISTS skill_module_effects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id uuid NOT NULL REFERENCES skill_modules(id) ON DELETE CASCADE,
    trigger_id uuid NOT NULL REFERENCES triggers(id) ON DELETE CASCADE,
    effect_id uuid NOT NULL REFERENCES effects(id) ON DELETE CASCADE,
    condition jsonb DEFAULT '{}'::jsonb,
    order_index integer NOT NULL DEFAULT 0
);

-- =============================================
-- INDEXES (optional, for performance)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_skill_module_tags_skill_id ON skill_module_tags(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_module_tags_tag_id ON skill_module_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_skill_module_effects_skill_id ON skill_module_effects(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_module_effects_trigger_id ON skill_module_effects(trigger_id);
CREATE INDEX IF NOT EXISTS idx_effects_type ON effects(type);

-- =============================================
-- SEED DATA (example triggers)
-- =============================================
INSERT INTO triggers (id, name) VALUES 
    (gen_random_uuid(), 'on_cast'),
    (gen_random_uuid(), 'on_hit'),
    (gen_random_uuid(), 'on_kill'),
    (gen_random_uuid(), 'on_death'),
    (gen_random_uuid(), 'turn_start'),
    (gen_random_uuid(), 'turn_end')
ON CONFLICT (name) DO NOTHING;