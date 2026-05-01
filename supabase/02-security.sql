-- Epic RPG Database Security - RLS POLICIES ONLY
-- This file contains ONLY Row Level Security policies
-- Run this AFTER 01-schema.sql

-- =====================================================
-- SECTION 1: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cores ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE party ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_daily_rewards ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 2: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Players: Read own data
CREATE POLICY "Allow authenticated players read own data" ON players
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Players: Insert own data
CREATE POLICY "Allow authenticated players create own data" ON players
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Players: Update own data
CREATE POLICY "Allow authenticated players update own data" ON players
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Units: Read own units
CREATE POLICY "Allow authenticated players read own units" ON units
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Units: Insert own units
CREATE POLICY "Allow authenticated players insert own units" ON units
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- Units: Update own units
CREATE POLICY "Allow authenticated players update own units" ON units
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Inventory: Read own inventory
CREATE POLICY "Allow authenticated players read own inventory" ON inventory
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Inventory: Insert inventory
CREATE POLICY "Allow authenticated players insert inventory" ON inventory
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- Inventory: Update inventory
CREATE POLICY "Allow authenticated players update inventory" ON inventory
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Party: Read own party
CREATE POLICY "Allow authenticated players read own party" ON party
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Party: Insert party
CREATE POLICY "Allow authenticated players insert party" ON party
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- Party: Update party
CREATE POLICY "Allow authenticated players update party" ON party
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Recruitment Queue: Read own queue
CREATE POLICY "Allow authenticated players read own recruitment_queue" ON recruitment_queue
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Recruitment Queue: Insert queue entries
CREATE POLICY "Allow authenticated players insert recruitment_queue" ON recruitment_queue
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- Recruitment Queue: Update queue entries
CREATE POLICY "Allow authenticated players update recruitment_queue" ON recruitment_queue
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Gacha State: Read own gacha state
CREATE POLICY "Allow authenticated players read own gacha_state" ON gacha_state
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Gacha State: Insert gacha state
CREATE POLICY "Allow authenticated players insert gacha_state" ON gacha_state
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- Gacha State: Update gacha state
CREATE POLICY "Allow authenticated players update gacha_state" ON gacha_state
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Campaign Progress: Read own progress
CREATE POLICY "Allow authenticated players read own campaign_progress" ON campaign_progress
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Campaign Progress: Insert progress
CREATE POLICY "Allow authenticated players insert campaign_progress" ON campaign_progress
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- Campaign Progress: Update progress
CREATE POLICY "Allow authenticated players update campaign_progress" ON campaign_progress
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Daily Rewards: Read own rewards
CREATE POLICY "Allow authenticated players read own daily_rewards" ON player_daily_rewards
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Daily Rewards: Update own rewards
CREATE POLICY "Allow authenticated players update own daily_rewards" ON player_daily_rewards
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- Static Content: Read access for authenticated users (game configs, jobs, skills, cards, weapons, job_cores)
CREATE POLICY "Allow authenticated read game_configs" ON game_configs
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow read skills" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read cards" ON cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read weapons" ON weapons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read jobs" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read job_cores" ON job_cores FOR SELECT TO authenticated USING (true);

-- =====================================================
-- SECTION 3: DELETE POLICIES
-- =====================================================

-- Players: Delete own account
CREATE POLICY "Allow authenticated players delete own account" ON players
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

-- Units: Delete own units
CREATE POLICY "Allow authenticated players delete own units" ON units
    FOR DELETE TO authenticated
    USING (auth.uid() = player_id);

-- Inventory: Delete own items
CREATE POLICY "Allow authenticated players delete own inventory" ON inventory
    FOR DELETE TO authenticated
    USING (auth.uid() = player_id);

-- Party: Delete own party slots
CREATE POLICY "Allow authenticated players delete own party" ON party
    FOR DELETE TO authenticated
    USING (auth.uid() = player_id);

-- Recruitment: Delete own recruitment slots
CREATE POLICY "Allow authenticated players delete own recruitment" ON recruitment_queue
    FOR DELETE TO authenticated
    USING (auth.uid() = player_id);

-- Gacha: Delete own gacha state
CREATE POLICY "Allow authenticated players delete own gacha" ON gacha_state
    FOR DELETE TO authenticated
    USING (auth.uid() = player_id);

-- Campaign: Delete own progress
CREATE POLICY "Allow authenticated players delete own campaign" ON campaign_progress
    FOR DELETE TO authenticated
    USING (auth.uid() = player_id);

-- Daily Rewards: Delete own rewards
CREATE POLICY "Allow authenticated players delete own daily_rewards" ON player_daily_rewards
    FOR DELETE TO authenticated
    USING (auth.uid() = player_id);