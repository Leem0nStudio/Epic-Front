-- Cleanup Script: Deletes everything related to the RPG system (Fixed Dependency Order)

-- 1. Drop Functions/RPCs
DROP FUNCTION IF EXISTS rpc_initialize_player(TEXT, JSONB[]);
DROP FUNCTION IF EXISTS rpc_pull_gacha(INTEGER);
DROP FUNCTION IF EXISTS rpc_evolve_unit(UUID, TEXT);

-- 2. Drop Tables (in correct dependency order)
DROP TABLE IF EXISTS party_slots;
DROP TABLE IF EXISTS recruitment_slots;
-- Drop units first because inventory_items depends on it via FK (equipped_weapon_instance_id)
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS item_definitions CASCADE;
DROP TABLE IF EXISTS job_definitions CASCADE;
DROP TABLE IF EXISTS game_data_versions CASCADE;
