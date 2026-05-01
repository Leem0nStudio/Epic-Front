-- =============================================
-- Seed Data for Modular Skill System
-- Run after migration_skills_system.sql
-- =============================================

-- =============================================
-- TRIGGERS
-- =============================================
INSERT INTO triggers (id, name) VALUES 
    (gen_random_uuid(), 'on_hit'),
    (gen_random_uuid(), 'on_crit'),
    (gen_random_uuid(), 'on_kill'),
    (gen_random_uuid(), 'on_skill_use')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- TAGS
-- =============================================
INSERT INTO tags (name) VALUES 
    ('burn'),
    ('crit'),
    ('aoe'),
    ('chain')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- EFFECTS
-- =============================================
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('apply_status', NULL, NULL, '{"status": "burn", "duration": 3}'::jsonb),
    ('explode', 50, NULL, '{"radius": 2}'::jsonb),
    ('reduce_cooldown', -1, NULL, NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- SKILLS
-- =============================================
WITH new_skills AS (
    SELECT * FROM (
        VALUES
            (gen_random_uuid(), 'Basic Attack', 'A basic melee attack', 10, 0),
            (gen_random_uuid(), 'Fire Hit', 'Strike with fire, applies burn', 15, 2),
            (gen_random_uuid(), 'Chain Strike', 'Chain attack that hits multiple targets', 20, 3)
    ) AS s(id, name, description, base_power, cooldown)
)
INSERT INTO skill_modules (id, name, description, base_power, cooldown)
SELECT id, name, description, base_power, cooldown FROM new_skills;

-- =============================================
-- SKILL TAGS
-- =============================================
INSERT INTO skill_module_tags (skill_id, tag_id)
SELECT sm.id, t.id
FROM skill_modules sm
CROSS JOIN tags t
WHERE (sm.name = 'Fire Hit' AND t.name = 'burn')
   OR (sm.name = 'Chain Strike' AND t.name = 'chain')
   OR (sm.name = 'Chain Strike' AND t.name = 'aoe');

-- =============================================
-- SKILL EFFECTS (combo system)
-- =============================================

-- Fire Hit: on_hit applies burn
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'apply_status' AND ef.extra->>'status' = 'burn'
WHERE sm.name = 'Fire Hit';

-- Chain Strike: on_kill reduces own cooldown
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_kill'
JOIN effects ef ON ef.type = 'reduce_cooldown'
WHERE sm.name = 'Chain Strike';

-- Fire Hit COMBO: on_crit + target has 3+ burn = explode
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{"target_has_status": "burn", "target_status_count": 3}'::jsonb,
    1
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_crit'
JOIN effects ef ON ef.type = 'explode'
WHERE sm.name = 'Fire Hit';