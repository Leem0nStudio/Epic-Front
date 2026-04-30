# Energy System - Epic RPG

## Purpose
Energy gates battle frequency to control pacing and encourage strategic decisions about which stages to tackle.

## Parameters
| Parameter | Value | Notes |
|-----------|-------|-------|
| Max Energy | 30 | Increased from 20 to allow more play |
| Regen Rate | 1 per 4 minutes | Decreased from 6 min for faster pacing |
| Gem Refill Cost | 30 gems | Decreased from 50 for better economy |
| Full Regen Time | 2 hours | 30 energy × 4 min = 120 min |

## Energy Costs by Stage
| Stage Type | Energy Cost | Notes |
|------------|-------------|-------|
| Normal (1-1 to 1-5) | 5-7 | Reduced by ~30% from original |
| EX Stages | 8-12 | Challenging, better rewards |
| Future: Hard Mode | 10-15 | Planned for later update |

## Regen Mechanics
- **Location**: `supabase/functions.sql` → `rpc_regen_energy()`
- **Tick interval**: 4 minutes (configurable via `v_tick_interval`)
- **Energy per tick**: 1 (configurable via `v_energy_per_tick`)
- **Trigger**: Called automatically when `rpc_deduct_energy()` is called

## Refill Options
1. **Natural Regen**: Wait 4 minutes per energy
2. **Level Up**: Full energy refill on player level up
3. **Gem Refill**: 30 gems for full refill (`rpc_refill_energy_with_gems()`)

## Economy Balance
- Average stage: 6 energy
- Play session: 5 stages = 30 energy = ~15-30 minutes of content
- Regen wait: 2 hours for full tank
- Gem refill: ~3-5 stages worth of gems earned per session
