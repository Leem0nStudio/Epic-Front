-- CLEANUP SCRIPT - Full database reset for fresh install
-- EXECUTE THIS FIRST before running any other SQL files
-- WARNING: This will delete ALL data, tables, and functions

BEGIN;

-- =====================================================
-- DROP ALL TABLES (in reverse dependency order)
-- =====================================================

-- Daily rewards system
DROP TABLE IF EXISTS player_daily_rewards CASCADE;

-- Campaign system
DROP TABLE IF EXISTS campaign_progress CASCADE;

-- Gacha system
DROP TABLE IF EXISTS gacha_state CASCADE;

-- Recruitment/Tavern
DROP TABLE IF EXISTS recruitment_queue CASCADE;

-- Party system
DROP TABLE IF EXISTS party CASCADE;

-- Inventory system
DROP TABLE IF EXISTS inventory CASCADE;

-- Player units
DROP TABLE IF EXISTS units CASCADE;

-- Player profile
DROP TABLE IF EXISTS players CASCADE;

-- Job skill modules
DROP TABLE IF EXISTS job_skill_modules CASCADE;
DROP TABLE IF EXISTS skill_module_effects CASCADE;
DROP TABLE IF EXISTS skill_module_tags CASCADE;
DROP TABLE IF EXISTS skill_modules CASCADE;

-- Core effects system
DROP TABLE IF EXISTS effects CASCADE;
DROP TABLE IF EXISTS triggers CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Static content
DROP TABLE IF EXISTS job_cores CASCADE;
DROP TABLE IF EXISTS weapons CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS game_configs CASCADE;

-- =====================================================
-- DROP ALL FUNCTIONS (RPCs)
-- =====================================================

DROP FUNCTION IF EXISTS rpc_initialize_player(TEXT, JSONB[]) CASCADE;
DROP FUNCTION IF EXISTS rpc_add_starter_inventory() CASCADE;
DROP FUNCTION IF EXISTS rpc_pull_gacha(INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_evolve_unit(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_regen_energy() CASCADE;
DROP FUNCTION IF EXISTS rpc_deduct_energy(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_refill_energy_with_gems(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_complete_stage(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS rpc_award_unit_exp(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_learn_skill(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS rpc_equip_skill(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS rpc_add_currency(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_claim_daily_reward(UUID) CASCADE;
DROP FUNCTION IF EXISTS rpc_train_unit(UUID, INTEGER) CASCADE;

-- Additional functions from 03-functions (legacy)
DROP FUNCTION IF EXISTS rpc_buy_weapon(TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_equip_weapon(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS rpc_buy_skill(TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_update_party(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_start_campaign(TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_complete_campaign(TEXT, INTEGER, JSONB) CASCADE;
DROP FUNCTION IF EXISTS rpc_register_player(TEXT, JSONB[]) CASCADE;
DROP FUNCTION IF EXISTS rpc_get_player_data() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_units() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_inventory() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_party() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_gacha_state() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_campaign_progress() CASCADE;
DROP FUNCTION IF EXISTS rpc_get_daily_rewards() CASCADE;

COMMIT;

SELECT '✅ Full database reset complete - ready for fresh install!' AS status;