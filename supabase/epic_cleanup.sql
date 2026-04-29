-- epic_cleanup.sql
-- Consolidated cleanup script for the RPG system
-- Run this FIRST if you need to reset the database

-- 1. Drop Functions/RPCs
DROP FUNCTION IF EXISTS rpc_initialize_player(TEXT, JSONB[]);
DROP FUNCTION IF EXISTS rpc_pull_gacha(INTEGER, TEXT);
DROP FUNCTION IF EXISTS rpc_evolve_unit(UUID, TEXT);
DROP FUNCTION IF EXISTS rpc_add_currency(BIGINT, BIGINT);
DROP FUNCTION IF EXISTS rpc_reset_player_data();
DROP FUNCTION IF EXISTS rpc_complete_stage(TEXT, INTEGER, INTEGER, JSONB);
DROP FUNCTION IF EXISTS rpc_learn_skill(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS rpc_equip_skill(UUID, UUID);
DROP FUNCTION IF EXISTS rpc_initialize_player(TEXT, JSONB[]);
DROP FUNCTION IF EXISTS rpc_unequip_item(UUID, UUID, TEXT);

-- 2. Drop Tables (in reverse dependency order)
DROP TABLE IF EXISTS campaign_progress CASCADE;
DROP TABLE IF EXISTS recruitment_queue CASCADE;
DROP TABLE IF EXISTS party CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS gacha_state CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- 3. Drop Static Tables
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS weapons CASCADE;
DROP TABLE IF EXISTS job_cores CASCADE;
DROP TABLE IF EXISTS game_configs CASCADE;

-- 4. Legacy Cleanup
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS item_definitions CASCADE;
DROP TABLE IF EXISTS job_definitions CASCADE;
DROP TABLE IF EXISTS game_data_versions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS party_slots CASCADE;
DROP TABLE IF EXISTS recruitment_slots CASCADE;
