-- =============================================
-- Modifiers System Migration
-- Run after migration_skills_system.sql
-- =============================================

-- =============================================
-- MODIFIERS (cards that modify skill behavior)
-- =============================================
CREATE TABLE IF NOT EXISTS modifiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    applies_to_tag text NOT NULL,
    effect jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_modifiers_tag ON modifiers(applies_to_tag);

-- =============================================
-- SEED DATA
-- =============================================
INSERT INTO modifiers (name, description, applies_to_tag, effect) VALUES 
    ('Criticando Llamas', 'Habilidades de fire pueden críticos', 'burn', 
     '{"allow_crit": true, "crit_chance_bonus": 20}'::jsonb),
    ('Cadena Dorada', 'Habilidades chain tienen 50% más daño', 'chain', 
     '{"damage_multiplier": 1.5}'::jsonb),
    ('Explosión Potenciada', 'Explode causa 100% más daño', 'aoe', 
     '{"damage_multiplier": 2.0}'::jsonb),
    ('Quema Profunda', 'Burn dura 2 turnos más', 'burn', 
     '{"extend_duration": 2}'::jsonb),
    ('Encadenamiento Crítico', 'Chain puede críticar', 'chain', 
     '{"allow_crit": true}'::jsonb)
ON CONFLICT DO NOTHING;