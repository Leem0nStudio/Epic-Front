-- Cleanup Script: Deletes everything related to the RPG system

-- 1. Drop Policies (Optional if dropping tables, but cleaner)
DROP POLICY IF EXISTS "Profiles are private" ON profiles;
DROP POLICY IF EXISTS "Units are private" ON units;
DROP POLICY IF EXISTS "Inventory is private" ON inventory_items;
DROP POLICY IF EXISTS "Party is private" ON party_slots;
DROP POLICY IF EXISTS "Recruitment is private" ON recruitment_slots;

-- 2. Drop Functions/RPCs
DROP FUNCTION IF EXISTS rpc_initialize_player(TEXT, JSONB[]);
DROP FUNCTION IF EXISTS rpc_pull_gacha(INTEGER);
DROP FUNCTION IF EXISTS rpc_evolve_unit(UUID, TEXT);

-- 3. Drop Tables (in reverse order of dependencies)
DROP TABLE IF EXISTS recruitment_slots;
DROP TABLE IF EXISTS party_slots;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS profiles CASCADE; -- Profiles linked to auth.users
DROP TABLE IF EXISTS item_definitions;
DROP TABLE IF EXISTS job_definitions;
DROP TABLE IF EXISTS game_data_versions;
