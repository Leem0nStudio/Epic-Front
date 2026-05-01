-- =============================================
-- FULL MASTER MIGRATION - Complete Game Database
-- Ejecutar EN ORDEN en SQL Editor de Supabase
-- =============================================

-- =============================================
-- PARTE 1: SCHEMA BASE (01-schema.sql)
-- =============================================

-- SECTION 1: METADATA & CONFIG
CREATE TABLE IF NOT EXISTS game_configs (
    version TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SECTION 2: STATIC DATA (Content)
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

CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    effect_value JSONB,
    applicable_jobs TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS weapons (
    id TEXT PRIMARY KEY,
    version TEXT REFERENCES game_configs(version),
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    stats JSONB NOT NULL,
    skills JSONB,
    price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS job_cores (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id),
    name TEXT NOT NULL,
    description TEXT,
    stats JSONB NOT NULL,
    cost INTEGER NOT NULL
);

-- SECTION 3: PLAYER DATA
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    currency INTEGER DEFAULT 1000,
    energy INTEGER DEFAULT 100,
    max_energy INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    current_job_id TEXT REFERENCES jobs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gacha_state (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    pity_counter INTEGER DEFAULT 0,
    last_guaranteed TIMESTAMP WITH TIME ZONE,
    banner_id TEXT,
    PRIMARY KEY (player_id)
);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    current_job_id TEXT REFERENCES jobs(id),
    base_stats JSONB NOT NULL,
    current_stats JSONB NOT NULL,
    equipment JSONB DEFAULT '{}'::jsonb,
    sprite_id TEXT,
    icon_id TEXT,
    position INTEGER,
    is_in_party BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    equipped_to_unit_id UUID REFERENCES units(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS party (
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    PRIMARY KEY (player_id, slot_index)
);

CREATE TABLE IF NOT EXISTS recruitment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES jobs(id),
    rarity TEXT NOT NULL,
    refresh_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_progress (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    campaign_id TEXT NOT NULL,
    stage INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (player_id, campaign_id)
);

CREATE TABLE IF NOT EXISTS player_daily_rewards (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (player_id, day)
);

-- =============================================
-- PARTE 2: SEEDS BASE (03-seed.sql)
-- =============================================

-- Game Config
INSERT INTO game_configs (version, is_active, config_data)
VALUES ('1.0.0', true, '{"party_size_limit": 4, "max_unit_level": 99, "energy_regen_rate": 60, "description": "Official Launch"}')
ON CONFLICT (version) DO UPDATE SET is_active = EXCLUDED.is_active;

-- Jobs
INSERT INTO jobs (id, version, name, tier, parent_job_id, stat_modifiers, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements)
VALUES
('novice', '1.0.0', 'Novice', 0, NULL, 
 '{"hp": 1.0, "atk": 1.0, "def": 1.0, "matk": 1.0, "mdef": 1.0, "agi": 1.0}', 
 '{"dagger", "sword"}', 
 '[{"id": "basic_attack", "name": "Ataque Básico", "type": "active", "powerMod": 1.0, "cooldown": 0}]', 
 '{}', 
 '{"minLevel": 1, "currencyCost": 0, "materials": []}'),

('swordman', '1.0.0', 'Swordman', 1, 'novice', 
 '{"hp": 1.2, "atk": 1.15, "def": 1.1, "matk": 0.8, "mdef": 0.9, "agi": 1.0}', 
 '{"sword", "dagger"}', 
 '[{"id": "bash", "name": "Bash", "type": "active", "powerMod": 1.5, "cooldown": 1}]', 
 '{"HP Recovery+10%"}', 
 '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),

('warrior', '1.0.0', 'Warrior', 2, 'swordman', 
 '{"hp": 1.5, "atk": 1.3, "def": 1.4, "matk": 0.7, "mdef": 1.0, "agi": 0.9}', 
 '{"sword"}', 
 '[{"id": "bowling_bash", "name": "Bowling Bash", "type": "active", "powerMod": 3.0, "cooldown": 3}]', 
 '{"Spear Mastery"}', 
 '{"minLevel": 40, "currencyCost": 5000, "materials": [], "requiredJobCore": "core_knight"}'),

('mage', '1.0.0', 'Mage', 1, 'novice', 
 '{"hp": 0.8, "atk": 0.7, "def": 0.8, "matk": 1.4, "mdef": 1.3, "agi": 0.9}', 
 '{"staff", "dagger"}', 
 '[{"id": "fire_bolt", "name": "Fire Bolt", "type": "active", "powerMod": 1.8, "cooldown": 1}]', 
 '{}', 
 '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),

('wizard', '1.0.0', 'Wizard', 2, 'mage',
 '{"hp": 0.7, "atk": 0.6, "def": 0.7, "matk": 1.8, "mdef": 1.5, "agi": 0.8}',
 '{"staff"}',
 '[{"id": "meteor", "name": "Meteor", "type": "active", "powerMod": 4.0, "cooldown": 5}]',
 '{"Fire Mastery"}',
 '{"minLevel": 40, "currencyCost": 5000, "materials": []}'),

('rogue', '1.0.0', 'Rogue', 1, 'novice',
 '{"hp": 0.9, "atk": 1.2, "def": 0.9, "matk": 0.9, "mdef": 0.8, "agi": 1.4}',
 '{"dagger", "bow"}',
 '[{"id": "backstab", "name": "Backstab", "type": "active", "powerMod": 2.0, "cooldown": 2}]',
 '{}',
 '{"minLevel": 10, "currencyCost": 1000, "materials": []}'),

('priest', '1.0.0', 'Priest', 1, 'novice',
 '{"hp": 1.0, "atk": 0.6, "def": 1.0, "matk": 1.2, "mdef": 1.3, "agi": 1.0}',
 '{"staff", "dagger"}',
 '[{"id": "heal", "name": "Heal", "type": "active", "powerMod": 1.5, "cooldown": 3}]',
 '{}',
 '{"minLevel": 10, "currencyCost": 1000, "materials": []}')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PARTE 3: SISTEMA DE HABILIDADES MODULAR
-- (de master-migration.sql)
-- =============================================

-- TAGS
CREATE TABLE IF NOT EXISTS tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- SKILL_MODULES
CREATE TABLE IF NOT EXISTS skill_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    base_power numeric NOT NULL DEFAULT 0,
    cooldown numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- SKILL_MODULE_TAGS
CREATE TABLE IF NOT EXISTS skill_module_tags (
    skill_id uuid NOT NULL REFERENCES skill_modules(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, tag_id)
);

-- TRIGGERS
CREATE TABLE IF NOT EXISTS triggers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- EFFECTS
CREATE TABLE IF NOT EXISTS effects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    value numeric,
    duration numeric,
    extra jsonb DEFAULT '{}'::jsonb
);

-- SKILL_MODULE_EFFECTS
CREATE TABLE IF NOT EXISTS skill_module_effects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id uuid NOT NULL REFERENCES skill_modules(id) ON DELETE CASCADE,
    trigger_id uuid NOT NULL REFERENCES triggers(id) ON DELETE CASCADE,
    effect_id uuid NOT NULL REFERENCES effects(id) ON DELETE CASCADE,
    condition jsonb DEFAULT '{}'::jsonb,
    order_index integer NOT NULL DEFAULT 0
);

-- MODIFIERS
CREATE TABLE IF NOT EXISTS modifiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    applies_to_tag text NOT NULL,
    effect jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- JOB_SKILL_MODULES
CREATE TABLE IF NOT EXISTS job_skill_modules (
    job_id text NOT NULL,
    skill_module_id uuid NOT NULL REFERENCES skill_modules(id) ON DELETE CASCADE,
    slot_index integer NOT NULL DEFAULT 0,
    is_passive boolean NOT NULL DEFAULT false,
    PRIMARY KEY (job_id, skill_module_id)
);

-- Add FK for job_id if jobs table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'jobs' AND table_schema = 'public'
    ) THEN
        ALTER TABLE job_skill_modules 
        ADD CONSTRAINT job_skill_modules_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_skill_module_tags_skill_id ON skill_module_tags(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_module_tags_tag_id ON skill_module_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_skill_module_effects_skill_id ON skill_module_effects(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_module_effects_trigger_id ON skill_module_effects(trigger_id);
CREATE INDEX IF NOT EXISTS idx_effects_type ON effects(type);
CREATE INDEX IF NOT EXISTS idx_modifiers_tag ON modifiers(applies_to_tag);
CREATE INDEX IF NOT EXISTS idx_job_skill_modules_job ON job_skill_modules(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skill_modules_skill ON job_skill_modules(skill_module_id);

-- =============================================
-- SEEDS: TRIGGERS
-- =============================================
INSERT INTO triggers (id, name) VALUES 
    (gen_random_uuid(), 'on_hit'),
    (gen_random_uuid(), 'on_crit'),
    (gen_random_uuid(), 'on_kill'),
    (gen_random_uuid(), 'on_skill_use'),
    (gen_random_uuid(), 'on_damage_taken'),
    (gen_random_uuid(), 'on_death'),
    (gen_random_uuid(), 'turn_start'),
    (gen_random_uuid(), 'turn_end')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEEDS: TAGS
-- =============================================
INSERT INTO tags (name) VALUES 
    ('burn'), ('poison'), ('crit'), ('aoe'), ('chain'), ('shield'), ('debuff'), ('self_buff')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEEDS: EFFECTS
-- =============================================
INSERT INTO effects (type, value, duration, extra) VALUES 
    ('apply_status', NULL, 3, '{"status": "burn", "duration": 3}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "burn", "duration": 2, "stacks": 2}'::jsonb),
    ('apply_status', NULL, 3, '{"status": "poison", "duration": 3}'::jsonb),
    ('apply_status', NULL, 4, '{"status": "poison", "stacks": 2, "duration": 3}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "stun", "duration": 1}'::jsonb),
    ('apply_status', NULL, 2, '{"status": "shield", "duration": 2, "shield_value": 20}'::jsonb),
    ('apply_status', NULL, 1, '{"status": "adrenaline", "duration": 1}'::jsonb),
    ('explode', 30, NULL, '{"radius": 1}'::jsonb),
    ('explode', 50, NULL, '{"radius": 2}'::jsonb),
    ('explode', 75, NULL, '{"radius": 2}'::jsonb),
    ('explode', 100, NULL, '{"radius": 3}'::jsonb),
    ('reduce_cooldown', -1, NULL, NULL),
    ('reduce_cooldown', -2, NULL, NULL),
    ('damage_per_stack', 5, NULL, '{"status": "poison"}'::jsonb),
    ('damage_per_stack', 8, NULL, '{"status": "burn"}'::jsonb),
    ('apply_shield', 20, 2, NULL),
    ('apply_shield', 25, 2, '{"shield_type": "magical"}'::jsonb),
    ('apply_shield', 50, 3, '{"shield_type": "hybrid", "absorption": 0.5}'::jsonb),
    ('chain_damage', 20, NULL, '{"max_targets": 3, "jump_range": 100, "damage_reduction": 0.5}'::jsonb),
    ('consume_status', 10, NULL, '{"status": "poison", "damage_per_stack": 5}'::jsonb),
    ('consume_status', 20, NULL, '{"status": "burn", "damage_per_stack": 8}'::jsonb),
    ('repeat_skill', 2, NULL, '{"chance": 0.5}'::jsonb),
    ('modify_stat', 10, 2, '{"stat": "atk", "operation": "add", "value": 10}'::jsonb),
    ('modify_stat', 15, 2, '{"stat": "def", "operation": "add", "value": 5}'::jsonb),
    ('modify_stat', NULL, 1, '{"stat": "crit_chance", "operation": "add", "value": 15}'::jsonb)
ON CONFLICT DO NOTHING;

-- =============================================
-- SEEDS: SKILLS
-- =============================================
WITH new_skills AS (
    SELECT * FROM (
        VALUES
            (gen_random_uuid(), 'Basic Attack', 'A basic melee attack', 10, 0),
            (gen_random_uuid(), 'Fire Hit', 'Strike with fire, applies burn', 15, 2),
            (gen_random_uuid(), 'Chain Strike', 'Chain attack that hits multiple targets', 20, 3),
            (gen_random_uuid(), 'Venom Strike', 'Attack with poisonous edge', 12, 2),
            (gen_random_uuid(), 'Venom Burst', 'Explode poison for massive damage', 25, 4),
            (gen_random_uuid(), 'Adrenaline Slash', 'Critical hits boost speed', 18, 3),
            (gen_random_uuid(), 'Shield Bash', 'Attack that grants shield', 10, 2),
            (gen_random_uuid(), 'Shield Wall', 'Reflect damage when hit', 15, 3),
            (gen_random_uuid(), 'Flame Nova', 'Fire explosion on critical', 30, 4)
    ) AS s(id, name, description, base_power, cooldown)
)
INSERT INTO skill_modules (id, name, description, base_power, cooldown)
SELECT id, name, description, base_power, cooldown FROM new_skills
ON CONFLICT DO NOTHING;

-- =============================================
-- SEEDS: SKILL TAGS
-- =============================================
INSERT INTO skill_module_tags (skill_id, tag_id)
SELECT sm.id, t.id
FROM skill_modules sm
CROSS JOIN tags t
WHERE (sm.name = 'Fire Hit' AND t.name = 'burn')
   OR (sm.name = 'Chain Strike' AND t.name IN ('chain', 'aoe'))
   OR (sm.name = 'Venom Strike' AND t.name IN ('poison', 'debuff'))
   OR (sm.name = 'Venom Burst' AND t.name IN ('poison', 'aoe'))
   OR (sm.name = 'Adrenaline Slash' AND t.name IN ('crit', 'self_buff'))
   OR (sm.name = 'Shield Bash' AND t.name = 'shield')
   OR (sm.name = 'Shield Wall' AND t.name = 'shield')
   OR (sm.name = 'Flame Nova' AND t.name IN ('burn', 'aoe'))
ON CONFLICT DO NOTHING;

-- =============================================
-- SEEDS: MODIFIERS
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
    ('Veneno Potenciado', 'Poison causa más daño', 'poison',
     '{"damage_multiplier": 1.8, "extend_duration": 2, "modify_value": 30}'::jsonb),
    ('Escudo Reforzado', 'Shield absorbe más', 'shield',
     '{"damage_multiplier": 1.5}'::jsonb),
    ('Crítico Maestro', 'Aumenta chance de crítico', 'crit',
     '{"allow_crit": true, "crit_chance_bonus": 40, "damage_multiplier": 2.0, "duplicate_on_crit": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- =============================================
-- SEEDS: SKILL EFFECTS (COMBOS)
-- =============================================

-- Fire Hit: on_hit applies burn
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'apply_status' AND ef.extra->>'status' = 'burn'
WHERE sm.name = 'Fire Hit';

-- Fire Hit: on_crit applies burn (2 stacks)
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 2
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_crit'
JOIN effects ef ON ef.type = 'apply_status' AND (ef.extra->>'stacks')::numeric = 2
WHERE sm.name = 'Fire Hit'
AND NOT EXISTS (
    SELECT 1 FROM skill_module_effects se
    JOIN effects e ON se.effect_id = e.id
    WHERE se.skill_id = sm.id AND e.type = 'apply_status' AND e.extra->>'status' = 'burn' AND se.trigger_id = tr.id
);

-- Fire Hit: on_hit + burn>=3 = explode
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{"target_has_status": "burn", "target_status_count": 3}'::jsonb, 3
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 50
WHERE sm.name = 'Fire Hit';

-- Chain Strike: on_kill reduces cooldown
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_kill'
JOIN effects ef ON ef.type = 'reduce_cooldown' AND ef.value = -1
WHERE sm.name = 'Chain Strike';

-- Chain Strike: on_hit extra damage
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 1
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 30
WHERE sm.name = 'Chain Strike';

-- Venom Strike: on_hit applies poison
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'apply_status' AND ef.extra->>'status' = 'poison'
WHERE sm.name = 'Venom Strike';

-- Venom Strike: on_hit applies poison stack
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 1
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'apply_status' AND (ef.extra->>'stacks')::numeric = 2
WHERE sm.name = 'Venom Strike';

-- Venom Burst: on_hit damage per stack
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{"target_has_status": "poison"}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'damage_per_stack' AND ef.value = 12
WHERE sm.name = 'Venom Burst';

-- Adrenaline Slash: on_crit reduces cooldown
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_crit'
JOIN effects ef ON ef.type = 'reduce_cooldown' AND ef.value = -2
WHERE sm.name = 'Adrenaline Slash';

-- Shield Bash: on_hit gains shield
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'apply_shield' AND ef.value = 20
WHERE sm.name = 'Shield Bash';

-- Shield Wall: on_damage_taken explodes shield
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{"source_has_status": "shield"}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_damage_taken'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 100
WHERE sm.name = 'Shield Wall';

-- Flame Nova: on_crit explode
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{}'::jsonb, 0
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_crit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 100
WHERE sm.name = 'Flame Nova';

-- Flame Nova: on_hit + burn>=2 = extra explode
INSERT INTO skill_module_effects (skill_id, trigger_id, effect_id, condition, order_index)
SELECT sm.id, tr.id, ef.id, '{"target_has_status": "burn", "target_status_count": 2}'::jsonb, 1
FROM skill_modules sm
JOIN triggers tr ON tr.name = 'on_hit'
JOIN effects ef ON ef.type = 'explode' AND ef.value = 30
WHERE sm.name = 'Flame Nova';

-- =============================================
-- SEEDS: JOB SKILLS
-- =============================================

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'warrior', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Basic Attack'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'warrior', sm.id, 1, false
FROM skill_modules sm WHERE sm.name = 'Fire Hit'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'rogue', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Basic Attack'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'rogue', sm.id, 1, false
FROM skill_modules sm WHERE sm.name = 'Chain Strike'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'mage', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Fire Hit'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'mage', sm.id, 1, false
FROM skill_modules sm WHERE sm.name = 'Flame Nova'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'priest', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Basic Attack'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'priest', sm.id, 1, false
FROM skill_modules sm WHERE sm.name = 'Shield Bash'
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED: TEST PLAYER (for development)
-- =============================================
INSERT INTO players (id, username, currency, energy, max_energy, level, experience, current_job_id)
VALUES ('7e71e36c-2e63-446e-bec5-cf96125b3fa8', 'TestPlayer', 10000, 100, 100, 10, 500, 'novice')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

INSERT INTO gacha_state (player_id) 
VALUES ('7e71e36c-2e63-446e-bec5-cf96125b3fa8')
ON CONFLICT (player_id) DO NOTHING;

-- =============================================
-- RPC FUNCTIONS (from 02-functions.sql)
-- =============================================

-- Energy Regeneration
CREATE OR REPLACE FUNCTION rpc_regen_energy()
RETURNS void AS $$
BEGIN
    UPDATE players 
    SET energy = LEAST(max_energy, energy + 10),
        last_energy_regen = NOW()
    WHERE energy < max_energy;
END;
$$ LANGUAGE plpgsql;

-- Initialize Player (simplified for testing)
CREATE OR REPLACE FUNCTION rpc_initialize_player(p_player_id UUID, p_username TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO players (id, username, energy, max_energy, currency, level) 
    VALUES (p_player_id, p_username, 100, 100, 1000, 1)
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

    INSERT INTO gacha_state (player_id) 
    VALUES (p_player_id)
    ON CONFLICT (player_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Add currency
CREATE OR REPLACE FUNCTION rpc_add_currency(p_player_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE players SET currency = currency + p_amount WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- Add energy
CREATE OR REPLACE FUNCTION rpc_add_energy(p_player_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE players 
    SET energy = LEAST(max_energy, energy + p_amount) 
    WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT '=== MIGRATION COMPLETE ===' as status;

SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT LIKE '%pg_%'
ORDER BY table_name;

SELECT 'Functions created:' as info;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';