-- Epic RPG Database Cleanup Script
-- This script removes all data, functions and table structures
-- Use this to reset the database completely

-- =====================================================
-- SECTION 1: DROP FUNCTIONS & RPCs
-- =====================================================

DROP FUNCTION IF EXISTS rpc_initialize_player(TEXT, JSONB[]) CASCADE;
DROP FUNCTION IF EXISTS rpc_pull_gacha(INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_evolve_unit(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_add_currency(BIGINT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_reset_player_data() CASCADE;
DROP FUNCTION IF EXISTS rpc_complete_stage(TEXT, INTEGER, INTEGER, JSONB, UUID[]) CASCADE;
DROP FUNCTION IF EXISTS rpc_complete_stage(TEXT, INTEGER, INTEGER, JSONB) CASCADE;
DROP FUNCTION IF EXISTS rpc_learn_skill(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS rpc_equip_skill(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS rpc_unequip_item(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS rpc_regen_energy() CASCADE;
DROP FUNCTION IF EXISTS rpc_deduct_energy(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_refill_energy_with_gems(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS rpc_award_unit_exp(UUID, INTEGER) CASCADE;

-- =====================================================
-- SECTION 2: DROP VIEWS
-- =====================================================

DROP VIEW IF EXISTS unit_progress CASCADE;

-- =====================================================
-- SECTION 3: DROP PLAYER TABLES (in reverse dependency order)
-- =====================================================

DROP TABLE IF EXISTS campaign_progress CASCADE;
DROP TABLE IF EXISTS recruitment_queue CASCADE;
DROP TABLE IF EXISTS party CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS gacha_state CASCADE;
DROP TABLE IF EXISTS player_daily_rewards CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- =====================================================
-- SECTION 4: DROP STATIC CONTENT TABLES
-- =====================================================

DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS weapons CASCADE;
DROP TABLE IF EXISTS job_cores CASCADE;
DROP TABLE IF EXISTS game_configs CASCADE;

-- =====================================================
-- SECTION 5: DROP LEGACY TABLES
-- =====================================================

DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS item_definitions CASCADE;
DROP TABLE IF EXISTS job_definitions CASCADE;
DROP TABLE IF EXISTS game_data_versions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS party_slots CASCADE;
DROP TABLE IF EXISTS recruitment_slots CASCADE;
