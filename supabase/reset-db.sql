-- =============================================
-- DATABASE RESET
-- ADVERTENCIA: Elimina TODAS las tablas y datos
-- Ejecutar solo en desarrollo
-- =============================================

BEGIN;

-- Eliminar tablas en orden inverso a las dependencias
DROP TABLE IF EXISTS player_daily_rewards CASCADE;
DROP TABLE IF EXISTS campaign_progress CASCADE;
DROP TABLE IF EXISTS recruitment_queue CASCADE;
DROP TABLE IF EXISTS party CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS gacha_state CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS job_cores CASCADE;
DROP TABLE IF EXISTS weapons CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS game_configs CASCADE;

-- Tablas del sistema de habilidades
DROP TABLE IF EXISTS job_skill_modules CASCADE;
DROP TABLE IF EXISTS modifiers CASCADE;
DROP TABLE IF EXISTS skill_module_effects CASCADE;
DROP TABLE IF EXISTS effects CASCADE;
DROP TABLE IF EXISTS triggers CASCADE;
DROP TABLE IF EXISTS skill_module_tags CASCADE;
DROP TABLE IF EXISTS skill_modules CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

COMMIT;

SELECT '✅ Database reset complete. Run full-master-migration.sql to recreate all tables.' as status;