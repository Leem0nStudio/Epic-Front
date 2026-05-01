-- =============================================
-- Skill Effects Combos
-- Populates skill_module_effects with functional combos
-- Run after seed_skills.sql
-- =============================================

-- =============================================
-- ADD MORE TRIGGERS
-- =============================================
INSERT INTO triggers (name) VALUES 
    ('on_damage_taken')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ADD MORE TAGS
-- =============================================
INSERT INTO tags (name) VALUES 
    ('poison'),
    ('shield'),
    ('debuff'),
    ('self_buff')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ADD MORE EFFECTS
-- =============================================
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('apply_status', NULL, NULL, '{"status": "burn", "duration": 2, "stacks": 2}'::jsonb),
    ('apply_status', NULL, NULL, '{"status": "poison", "duration": 3}'::jsonb),
    ('apply_status', NULL, NULL, '{"status": "shield", "duration": 2, "shield_value": 20}'::jsonb),
    ('apply_status', NULL, NULL, '{"status": "adrenaline", "duration": 1}'::jsonb),
    ('explode', 30, NULL, '{"radius": 1}'::jsonb),
    ('explode', 100, NULL, '{"radius": 2}'::jsonb),
    ('reduce_cooldown', -2, NULL, NULL),
    ('damage_per_stack', 5, NULL, '{"status": "poison"}'::jsonb),
    ('apply_shield', 25, NULL, NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- ADD MORE SKILLS
-- =============================================
INSERT INTO skill_modules (id, name, description, base_power, cooldown) VALUES 
    (gen_random_uuid(), 'Venom Strike', 'Attack with poisonous edge', 12, 2),
    (gen_random_uuid(), 'Venom Burst', 'Explode poison for massive damage', 25, 4),
    (gen_random_uuid(), 'Adrenaline Slash', 'Critical hits boost speed', 18, 3),
    (gen_random_uuid(), 'Shield Bash', 'Attack that grants shield', 10, 2),
    (gen_random_uuid(), 'Shield Wall', 'Reflect damage when hit', 15, 3),
    (gen_random_uuid(), 'Flame Nova', 'Fire explosion on critical', 30, 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- ADD SKILL TAGS
-- =============================================
INSERT INTO skill_module_tags (skill_id, tag_id)
SELECT sm.id, t.id
FROM skill_modules sm
CROSS JOIN tags t
WHERE (sm.name = 'Venom Strike' AND t.name = 'poison')
   OR (sm.name = 'Venom Strike' AND t.name = 'debuff')
   OR (sm.name = 'Venom Burst' AND t.name = 'poison')
   OR (sm.name = 'Venom Burst' AND t.name = 'aoe')
   OR (sm.name = 'Adrenaline Slash' AND t.name = 'crit')
   OR (sm.name = 'Adrenaline Slash' AND t.name = 'self_buff')
   OR (sm.name = 'Shield Bash' AND t.name = 'shield')
   OR (sm.name = 'Shield Wall' AND t.name = 'shield')
   OR (sm.name = 'Flame Nova' AND t.name = 'burn')
   OR (sm.name = 'Flame Nova' AND t.name = 'aoe')
ON CONFLICT DO NOTHING;

-- =============================================
-- COMBO 1: Critical Burn (Fire Hit)
-- on_crit → apply burn (2 stacks)
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    2
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_crit'
JOIN effects ef ON ef.type = 'apply_status' AND ef.extra->>'status' = 'burn'
WHERE sm.name = 'Fire Hit'
AND NOT EXISTS (
    SELECT 1 FROM skill_module_effects se
    JOIN effects e ON se.effect_id = e.id
    WHERE se.skill_id = sm.id 
    AND e.type = 'apply_status' 
    AND e.extra->>'status' = 'burn'
    AND se.trigger_id = tr.id
);

-- =============================================
-- COMBO 2: Flame Burst (Fire Hit)
-- on_hit con burn >= 3 → explode
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{"target_has_status": "burn", "target_status_count": 3}'::jsonb,
    3
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 30
WHERE sm.name = 'Fire Hit';

-- =============================================
-- COMBO 3: Venom Touch (Venom Strike)
-- on_hit → apply poison
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'apply_status' AND ef.extra->>'status' = 'poison'
WHERE sm.name = 'Venom Strike';

-- =============================================
-- COMBO 4: Venom Explosion (Venom Burst)
-- on_skill_use → consume poison → daño por stack
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{"source_has_status": "poison"}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_skill_use'
JOIN effects ef ON ef.type = 'damage_per_stack'
WHERE sm.name = 'Venom Burst';

-- =============================================
-- COMBO 5: Adrenaline Rush (Adrenaline Slash)
-- on_crit → reduce cooldown
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_crit'
JOIN effects ef ON ef.type = 'reduce_cooldown'
WHERE sm.name = 'Adrenaline Slash';

-- =============================================
-- COMBO 6: Chain Slash (Chain Strike)
-- on_hit → damage to additional target
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    1
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 30
WHERE sm.name = 'Chain Strike';

-- =============================================
-- COMBO 7: Shield Gain (Shield Bash)
-- on_hit → gain shield
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'apply_shield'
WHERE sm.name = 'Shield Bash';

-- =============================================
-- COMBO 8: Shield Burst (Shield Wall)
-- on_damage_taken → explode based on shield
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{"source_has_status": "shield"}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_damage_taken'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 100
WHERE sm.name = 'Shield Wall';

-- =============================================
-- Bonus: Flame Nova (new skill)
-- on_crit → explode + on_hit with burn >= 2 → extra explode
-- =============================================
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{}'::jsonb,
    0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_crit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 100
WHERE sm.name = 'Flame Nova';

INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT 
    sm.id,
    tr.id,
    ef.id,
    '{"target_has_status": "burn", "target_status_count": 2}'::jsonb,
    1
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 30
WHERE sm.name = 'Flame Nova';

-- =============================================
-- Verify: Show all skill effects
-- =============================================
SELECT 
    sm.name as skill,
    tr.name as trigger,
    ef.type as effect_type,
    ef.extra as effect_extra,
    sme.condition
FROM skill_module_effects sme
JOIN skill_modules sm ON sme.skill_id = sm.id
JOIN triggers tr ON sme.trigger_id = tr.id
JOIN effects ef ON sme.effect_id = ef.id
ORDER BY sm.name, sme.order_index;