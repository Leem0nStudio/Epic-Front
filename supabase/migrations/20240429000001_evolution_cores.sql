-- Update Evolution RPC to support Job Cores
CREATE OR REPLACE FUNCTION rpc_evolve_unit(p_unit_id UUID, p_target_job_id TEXT)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_active_version TEXT;
    v_current_job_id TEXT;
    v_level INTEGER;
    v_reqs JSONB;
    v_parent_job_id TEXT;
    v_cost BIGINT;
    v_materials JSONB;
    v_material JSONB;
    v_core_id TEXT;
BEGIN
    SELECT version INTO v_active_version FROM game_configs WHERE is_active = true LIMIT 1;
    SELECT current_job_id, level INTO v_current_job_id, v_level FROM units WHERE id = p_unit_id AND player_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'Unidad no encontrada'; END IF;

    SELECT evolution_requirements, parent_job_id INTO v_reqs, v_parent_job_id
    FROM jobs WHERE id = p_target_job_id AND version = v_active_version;

    IF v_current_job_id IS DISTINCT FROM v_parent_job_id THEN RAISE EXCEPTION 'Ruta de evolución incorrecta'; END IF;
    IF v_level < (v_reqs->>'minLevel')::INTEGER THEN RAISE EXCEPTION 'Nivel insuficiente'; END IF;

    v_cost := (v_reqs->>'currencyCost')::BIGINT;
    v_materials := v_reqs->'materials';
    v_core_id := v_reqs->>'requiredJobCore';

    -- 1. Deduct Currency
    UPDATE players SET currency = currency - v_cost WHERE id = v_user_id AND currency >= v_cost;
    IF NOT FOUND THEN RAISE EXCEPTION 'Zeny insuficiente'; END IF;

    -- 2. Deduct Materials
    IF v_materials IS NOT NULL AND jsonb_array_length(v_materials) > 0 THEN
        FOR v_material IN SELECT * FROM jsonb_array_elements(v_materials) LOOP
            UPDATE inventory SET quantity = quantity - (v_material->>'amount')::INTEGER
            WHERE player_id = v_user_id AND item_id = v_material->>'itemId' AND quantity >= (v_material->>'amount')::INTEGER;
            IF NOT FOUND THEN RAISE EXCEPTION 'Materiales faltantes'; END IF;
        END LOOP;
    END IF;

    -- 3. Deduct Job Core if required
    IF v_core_id IS NOT NULL THEN
        UPDATE inventory SET quantity = quantity - 1
        WHERE player_id = v_user_id AND item_id = v_core_id AND quantity >= 1;
        IF NOT FOUND THEN RAISE EXCEPTION 'Se requiere el núcleo de trabajo: %', v_core_id; END IF;
    END IF;

    -- Cleanup
    DELETE FROM inventory WHERE quantity <= 0;

    -- 4. Finalize Evolution
    UPDATE units SET
        current_job_id = p_target_job_id,
        unlocked_jobs = array_append(unlocked_jobs, p_target_job_id)
    WHERE id = p_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
