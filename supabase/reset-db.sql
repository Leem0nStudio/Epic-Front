-- =============================================
-- DATABASE RESET - FULL CLEAN
-- ADVERTENCIA: Elimina TODAS las tablas y datos
-- =============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop todas las tablas
    FOR r IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name NOT LIKE 'pg_%' 
             AND table_name NOT LIKE '%_pkey' 
             LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || r.table_name || ' CASCADE';
    END LOOP;
    
    -- Drop todas las secuencias
    FOR r IN SELECT sequence_name FROM information_schema.sequences 
             WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || r.sequence_name || ' CASCADE';
    END LOOP;
END $$;

SELECT '✅ Database fully reset. Run full-master-migration.sql to recreate.' as status;