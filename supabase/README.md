# Supabase Database Setup Guide

## Overview
The database schema for Epic RPG has been consolidated into 4 main files for better maintainability.

## Setup Instructions

Execute files in this order in the Supabase SQL Editor:

### 1. **schema.sql** (Tables & Policies)
Creates all database tables and Row Level Security policies.
- Game configs, jobs, skills, cards, weapons, job cores
- Player data tables (players, units, inventory, party, etc.)
- RLS policies for data protection

### 2. **functions.sql** (RPCs & Procedures)
Creates all stored procedures and RPC functions.
- Player initialization
- Gacha system
- Unit evolution
- Energy system
- Campaign & battle logic
- Unit progression and skills
- Currency management

### 3. **seed.sql** (Initial Data)
Populates the database with initial game content.
- Game config (v1.0.0)
- 5 Jobs (Novice, Swordman, Knight, Mage, Wizard)
- 10 Skills (spells, attacks, buffs)
- 3 Cards (character boost cards)
- 3 Weapons (sword, staff, etc.)
- 2 Job Cores (unlockable job items)

### 4. **cleanup.sql** (Reset Database)
Drops all functions, views, and tables.
Use only when you need to completely reset the database.

## File Organization

```
supabase/
├── schema.sql          # Tables + RLS policies
├── functions.sql       # RPCs & stored procedures
├── seed.sql            # Initial game data
└── cleanup.sql         # Complete database reset
```

## Deprecated Files (Do Not Use)
The following files have been consolidated and should not be executed:
- `add_daily_rewards.sql` → Moved to schema.sql
- `epic_schema.sql` → Split into schema.sql & functions.sql
- `rls_policies.sql` → Moved to schema.sql
- `fix_resource_systems.sql` → Moved to functions.sql
- `epic_seed.sql` → Renamed to seed.sql
- `epic_cleanup.sql` → Renamed to cleanup.sql
- `Epic_cleanup.sql` → Renamed to cleanup.sql

## Quick Start

1. Open Supabase SQL Editor
2. Copy and run **schema.sql**
3. Copy and run **functions.sql**
4. Copy and run **seed.sql**
5. Done! Your database is ready

## RLS Policy Details

All player-scoped tables are protected with RLS policies:
- **players** - Users can only access their own player account
- **units** - Users can only access their own units
- **inventory** - Users can only access their own inventory
- **party** - Users can only manage their own party
- **gacha_state** - Users can only see their own gacha state
- **campaign_progress** - Users can only see their own progress
- **player_daily_rewards** - Users can only access their own daily rewards

Static content tables (jobs, skills, cards, weapons) are readable by all authenticated users.

## Important Notes

- All functions use `SECURITY DEFINER` to ensure proper data access
- Energy regenerates every 6 minutes
- Daily rewards track consecutive login streaks
- Units level up through battle participation
- Gacha system has pity mechanics (50 pulls = guaranteed legendary)
