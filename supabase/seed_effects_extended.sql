-- =============================================
-- Extended Effects Table
-- Run after seed_combos.sql
-- =============================================

-- =============================================
-- EXISTING EFFECTS (verify or add)
-- =============================================
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('apply_status', NULL, NULL, '{"status": "burn", "duration": 3}'::jsonb),
    ('apply_status', NULL, NULL, '{"status": "burn", "duration": 2, "stacks": 2}'::jsonb),
    ('explode', 50, NULL, '{"radius": 2}'::jsonb),
    ('reduce_cooldown', -1, NULL, NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- NEW EFFECT TYPES
-- =============================================

-- apply_status variations
INSERT INTO effects (type, value, duration, extra) VALUES 
    -- Burn variations
    ('apply_status', NULL, 3, '{"status": "burn", "damage_per_turn": 10}'::jsonb),
    ('apply_status', NULL, 5, '{"status": "burn", "stacks": 3, "duration": 4}'::jsonb),
    
    -- Poison variations
    ('apply_status', NULL, 3, '{"status": "poison", "damage_per_turn": 5}'::jsonb),
    ('apply_status', NULL, 4, '{"status": "poison", "stacks": 2, "duration": 3}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "poison", "can_stack": true, "max_stacks": 5}'::jsonb),
    
    -- Other debuffs
    ('apply_status', NULL, 2, '{"status": "stun", "duration": 1}'::jsonb),
    ('apply_status', NULL, 3, '{"status": "silence", "duration": 2}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "weakness", "atk_reduction": 0.3}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "vulnerability", "def_reduction": 0.3}'::jsonb),
    
    -- Buffs
    ('apply_status', NULL, 3, '{"status": "strength", "atk_boost": 0.2}'::jsonb),
    ('apply_status', NULL, 3, '{"status": "haste", "agi_boost": 0.3}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "regeneration", "heal_per_turn": 10}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "barrier", "shield_absorption": 50}'::jsonb)
ON CONFLICT DO NOTHING;

-- explode variations
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('explode', 30, NULL, '{"radius": 1}'::jsonb),
    ('explode', 50, NULL, '{"radius": 2}'::jsonb),
    ('explode', 75, NULL, '{"radius": 2}'::jsonb),
    ('explode', 100, NULL, '{"radius": 3}'::jsonb),
    ('explode', 150, NULL, '{"radius": 3, "ignore_def": true}'::jsonb),
    ('explode', NULL, NULL, '{"radius": 2, "scaling": "shield", "multiplier": 0.5}'::jsonb)
ON CONFLICT DO NOTHING;

-- chain_damage
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('chain_damage', 20, NULL, '{"max_targets": 3, "jump_range": 100, "damage_reduction": 0.5}'::jsonb),
    ('chain_damage', 30, NULL, '{"max_targets": 2, "jump_range": 150, "damage_reduction": 0.3}'::jsonb),
    ('chain_damage', 40, NULL, '{"max_targets": 4, "jump_range": 200, "damage_reduction": 0.4, "can_crit": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- gain_shield
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('gain_shield', 20, 2, '{"shield_type": "physical"}'::jsonb),
    ('gain_shield', 30, 2, '{"shield_type": "magical"}'::jsonb),
    ('gain_shield', 50, 3, '{"shield_type": "hybrid", "absorption": 0.5}'::jsonb),
    ('gain_shield', NULL, 2, '{"shield_type": "scaling", "scaling_stat": "def", "multiplier": 1.5}'::jsonb),
    ('gain_shield', NULL, 2, '{"shield_type": "scaling", "scaling_stat": "mdef", "multiplier": 1.5}'::jsonb)
ON CONFLICT DO NOTHING;

-- consume_status (trigger effects based on status removal)
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('consume_status', 10, NULL, '{"status": "poison", "damage_per_stack": 5}'::jsonb),
    ('consume_status', 20, NULL, '{"status": "burn", "damage_per_stack": 8}'::jsonb),
    ('consume_status', NULL, NULL, '{"status": "shield", "effect": "explode", "radius": 2}'::jsonb),
    ('consume_status', 15, NULL, '{"status": "buff", "heal_per_stack": 10}'::jsonb),
    ('consume_status', NULL, NULL, '{"status": "rage", "effect": "modify_stat", "stat": "atk", "multiplier": 1.5}'::jsonb)
ON CONFLICT DO NOTHING;

-- repeat_skill (skill casts itself again)
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('repeat_skill', 2, NULL, '{"chance": 0.5}'::jsonb),
    ('repeat_skill', 3, NULL, '{"chance": 0.3, "max_times": 2}'::jsonb),
    ('repeat_skill', NULL, NULL, '{"chance": 1.0, "max_times": 1, "target": "random"}'::jsonb),
    ('repeat_skill', 2, NULL, '{"chance": 0.25, "trigger": "on_kill"}'::jsonb)
ON CONFLICT DO NOTHING;

-- modify_stat (temporary stat changes)
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('modify_stat', 10, 2, '{"stat": "atk", "operation": "add", "value": 10}'::jsonb),
    ('modify_stat', 15, 2, '{"stat": "def", "operation": "add", "value": 5}'::jsonb),
    ('modify_stat', 20, 3, '{"stat": "matk", "operation": "multiply", "value": 1.2}'::jsonb),
    ('modify_stat', 25, 2, '{"stat": "agi", "operation": "multiply", "value": 1.3}'::jsonb),
    ('modify_stat', NULL, 1, '{"stat": "crit_chance", "operation": "add", "value": 15}'::jsonb),
    ('modify_stat', NULL, 2, '{"stat": "dodge", "operation": "add", "value": 10}'::jsonb),
    ('modify_stat', NULL, 2, '{"stat": "all", "operation": "multiply", "value": 0.9, "is_debuff": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- =============================================
-- Verify all effects
-- =============================================
SELECT 
    type,
    COUNT(*) as count,
    ARRAY_AGG(extra::text) as examples
FROM effects
GROUP BY type
ORDER BY type;