-- =============================================
-- Job Skills Integration Migration
-- Links jobs to modular skill system
-- =============================================

-- =============================================
-- JOB_SKILL_MODULES (base skills per job)
-- =============================================
CREATE TABLE IF NOT EXISTS job_skill_modules (
    job_id text NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_module_id uuid NOT NULL REFERENCES skill_modules(id) ON DELETE CASCADE,
    slot_index integer NOT NULL DEFAULT 0,
    is_passive boolean NOT NULL DEFAULT false,
    PRIMARY KEY (job_id, skill_module_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_job_skill_modules_job ON job_skill_modules(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skill_modules_skill ON job_skill_modules(skill_module_id);

-- =============================================
-- SEED DATA (example job skill assignments)
-- =============================================

-- Warrior gets Basic Attack + Fire Hit
INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'warrior', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Basic Attack'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'warrior', sm.id, 1, false
FROM skill_modules sm WHERE sm.name = 'Fire Hit'
ON CONFLICT DO NOTHING;

-- Rogue gets Basic Attack + Chain Strike
INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'rogue', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Basic Attack'
ON CONFLICT DO NOTHING;

INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'rogue', sm.id, 1, false
FROM skill_modules sm WHERE sm.name = 'Chain Strike'
ON CONFLICT DO NOTHING;

-- Mage gets Fire Hit (starter)
INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'mage', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Fire Hit'
ON CONFLICT DO NOTHING;

-- Priest gets Basic Attack (can add heal later)
INSERT INTO job_skill_modules (job_id, skill_module_id, slot_index, is_passive) 
SELECT 'priest', sm.id, 0, false
FROM skill_modules sm WHERE sm.name = 'Basic Attack'
ON CONFLICT DO NOTHING;