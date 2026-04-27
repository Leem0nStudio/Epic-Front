-- RLS Policies for Epic RPG Game
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily to create policies
ALTER TABLE game_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE party DISABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE weapons DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_cores DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS, add these policies:

-- Allow authenticated users to read their own player data
CREATE POLICY "Allow authenticated players read own data" ON players
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Allow authenticated users to read their own units
CREATE POLICY "Allow authenticated players read own units" ON units
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Allow authenticated users to read their own inventory
CREATE POLICY "Allow authenticated players read own inventory" ON inventory
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Allow authenticated users to read their own party
CREATE POLICY "Allow authenticated players read own party" ON party
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Allow authenticated users to read their own recruitment queue
CREATE POLICY "Allow authenticated players read own recruitment_queue" ON recruitment_queue
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Allow authenticated users to read their own gacha state
CREATE POLICY "Allow authenticated players read own gacha_state" ON gacha_state
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Allow authenticated users to read their own campaign progress
CREATE POLICY "Allow authenticated players read own campaign_progress" ON campaign_progress
    FOR SELECT TO authenticated
    USING (auth.uid() = player_id);

-- Allow authenticated users to read game config (public data)
CREATE POLICY "Allow authenticated read game_configs" ON game_configs
    FOR SELECT TO authenticated
    USING (true);

-- Allow anonymous/authenticated to read static content (skills, cards, weapons, jobs)
CREATE POLICY "Allow read skills" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read cards" ON cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read weapons" ON weapons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read jobs" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read job_cores" ON job_cores FOR SELECT TO authenticated USING (true);