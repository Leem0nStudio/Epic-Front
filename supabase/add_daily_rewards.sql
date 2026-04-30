-- Add player_daily_rewards table for daily login rewards
CREATE TABLE IF NOT EXISTS player_daily_rewards (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    streak INTEGER DEFAULT 0,
    last_claim_date DATE DEFAULT NULL
);

-- Enable RLS
ALTER TABLE player_daily_rewards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own daily rewards" 
    ON player_daily_rewards FOR SELECT 
    USING (auth.uid() = player_id);

CREATE POLICY "Users can update own daily rewards" 
    ON player_daily_rewards FOR UPDATE 
    USING (auth.uid() = player_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON player_daily_rewards TO authenticated;
