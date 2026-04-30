# Job Evolution System - Epic RPG

## Overview
Units can evolve their jobs when they meet specific requirements. Each evolution unlocks better stats, new skills, and passive effects.

## Job Tree Structure
```
Novice (Tier 0)
├── Swordman (Tier 1, Lv10, 1000 gold)
│   └── Knight (Tier 2, Lv40, 5000 gold, core_knight)
│       ├── Paladin (Tier 3, Lv70, 15000 gold, core_paladin)
│       │   └── Arch Paladin (Tier 4, Lv90, 50000 gold, core_arch_paladin)
│       └── Crusader (Tier 3, Lv70, 15000 gold, core_crusader)
└── Mage (Tier 1, Lv10, 1000 gold)
    └── Wizard (Tier 2, Lv40, 5000 gold, core_wizard)
        ├── Sage (Tier 3, Lv70, 15000 gold, core_sage)
        │   └── Grand Archmage (Tier 4, Lv90, 50000 gold, core_grand_archmage)
        └── Archmage (Tier 3, Lv70, 15000 gold, core_archmage)
```

## Evolution Requirements
| Tier | Level | Currency | Job Core | Materials |
|------|-------|----------|----------|------------|
| 0→1 | 10 | 1,000 | None | None |
| 1→2 | 40 | 5,000 | Epic Core | None |
| 2→3 | 70 | 15,000 | Legendary Core | None |
| 3→4 | 90 | 50,000 | Mythic Core | None |

## Stat Progression Example (Swordman Path)
| Job | HP | ATK | DEF | MATK | MDEF | AGI |
|-----|----|----|-----|------|------|-----|
| Novice | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| Swordman | 1.2 | 1.15 | 1.1 | 0.8 | 0.9 | 1.0 |
| Knight | 1.5 | 1.4 | 1.3 | 0.7 | 0.8 | 1.1 |
| Paladin | 1.8 | 1.2 | 1.6 | 0.9 | 1.3 | 0.8 |
| Arch Paladin | 2.2 | 1.3 | 2.0 | 1.0 | 1.5 | 0.7 |

## Evolution Mechanics
- **Location**: `lib/rpg-system/evolution.ts` → `EvolutionService`
- **Database**: `supabase/functions.sql` → `rpc_evolve_unit()`
- **Validation**: All requirements checked server-side in RPC
- **Job Cores**: Obtained via gacha, stored in `inventory` table

## UI Flow
1. Player opens Unit Detail screen
2. Taps "Evolve" button
3. Shows evolution tree with requirements
4. "Evolve" button enabled when all met
5. Confirmation modal → Evolution animation → New job unlocked

## DB Schema
```sql
-- Evolution requirements stored in jobs.evolution_requirements JSONB
{
    "minLevel": 70,
    "currencyCost": 15000,
    "materials": [],
    "requiredJobCore": "core_paladin"
}
```
