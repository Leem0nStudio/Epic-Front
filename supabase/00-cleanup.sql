-- CLEANUP SCRIPT - Drop all tables, functions, and data for fresh install
-- EXECUTE THIS FIRST before running schema.sql

BEGIN;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS player_daily_rewards CASCADE;
DROP TABLE IF EXISTS campaign_progress CASCADE;
DROP TABLE IF EXISTS gacha_state CASCADE;
DROP TABLE IF EXISTS recruitment_queue CASCADE;
DROP TABLE IF EXISTS party CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Drop skill system tables
DROP TABLE IF EXISTS job_skill_modules CASCADE;
DROP TABLE IF EXISTS skill_module_effects CASCADE;
DROP TABLE IF EXISTS skill_module_tags CASCADE;
DROP TABLE IF EXISTS skill_modules CASCADE;
DROP TABLE IF EXISTS effects CASCADE;
DROP TABLE IF EXISTS triggers CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Drop content tables
DROP TABLE IF EXISTS job_cores CASCADE;
DROP TABLE IF EXISTS weapons CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS game_configs CASCADE;

-- Drop functions (RPCs)
DROP FUNCTION IF EXISTS rpc_initialize_player(TEXT, JSONB[]) CASCADE;
DROP FUNCTION IF EXISTS rpc_pull_gacha(INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_buy_weapon(TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_equip_weapon(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS rpc_buy_skill(TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_equip_skill(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS rpc_update_party(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_start_campaign(TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_complete_campaign(TEXT, INTEGER, JSONB) CASCADE;
DROP FUNCTION IF EXISTS rpc_claim_daily_reward() CASCADE;
DROP FUNCTION IF EXISTS rpc_register_player(TEXT, JSONB[]) CASCADE;
DROP FUNCTION IF EXISTS rpc_get_player_data() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_units() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_inventory() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_party() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_gacha_state() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_campaign_progress() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_daily_rewards() CASCADE;

COMMIT;

SELECT '✅ Database cleaned successfully!' AS status;