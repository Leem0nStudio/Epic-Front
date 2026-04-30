# Supabase Database Setup Guide

## Overview
The database schema for Epic RPG is organized into 3 main files for production use.

## Setup Instructions

Execute files in this order in the Supabase SQL Editor:

### 1. **schema.sql** (Tables & Policies)
Creates all database tables, Row Level Security policies, constraints, and indexes.
- Game configs, jobs, skills, cards, weapons, job cores
- Player data tables (players, units, inventory, party, etc.)
- RLS policies for data protection (SELECT, INSERT, UPDATE, DELETE)
- CHECK constraints for data integrity (energy >= 0, level >= 1, etc.)
- Composite indexes for query performance
- Foreign key: units.current_job_id → jobs(id)

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
- 10 Job Cores (unlockable job items)

### 4. **cleanup.sql** (Reset Database)
Drops all functions, views, and tables.
Use only when you need to completely reset the database.

## File Organization

```
supabase/
├── 01-schema.sql       # Tables + RLS policies + constraints + indexes
├── 02-functions.sql    # RPCs & stored procedures
├── 03-seed.sql        # Initial game data
├── 04-cleanup.sql     # Complete database reset
└── README.md          # This file
```

## Deprecated Files (Do Not Use)
The following files have been consolidated and should not be executed:
- `add_daily_rewards.sql` → Moved to 01-schema.sql
- `epic_schema.sql` → Split into 01-schema.sql & 02-functions.sql
- `rls_policies.sql` → Moved to 01-schema.sql
- `fix_resource_systems.sql` → Moved to 02-functions.sql
- `epic_seed.sql` → Renamed to 03-seed.sql
- `epic_cleanup.sql` → Renamed to 04-cleanup.sql
- `schema-additions.sql` → Experimental (not required for base game)

## Quick Start

1. Open Supabase SQL Editor
2. Copy and run **01-schema.sql**
3. Copy and run **02-functions.sql**
4. Copy and run **03-seed.sql**
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
- **recruitment_queue** - Users can only manage their own recruitment slots

Static content tables (jobs, skills, cards, weapons) are readable by all authenticated users.

## Data Integrity Features

- **CHECK constraints**: Prevents negative values (energy, currency, level, exp, quantity)
- **Foreign keys**: Ensures units.current_job_id references valid jobs
- **Composite indexes**: Optimizes frequent queries (player + level, player + item_type, etc.)
- **DELETE policies**: Users can delete their own data

## Important Notes

- All functions use `SECURITY DEFINER` to ensure proper data access
- Energy regenerates every 6 minutes
- Daily rewards track consecutive login streaks
- Units level up through battle participation
- Gacha system has pity mechanics (50 pulls = guaranteed legendary)
