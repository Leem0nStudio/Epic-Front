# Gacha System - Epic RPG

## Purpose
Primary monetization and unit acquisition system. Players spend premium currency (gems) to recruit units and obtain gear.

## Pull Types
| Type | Cost | Guarantees | Pity System |
|------|------|------------|-------------|
| Single Pull | 100 gems | None | None |
| Multi Pull (10x) | 900 gems (10% off) | 1 guaranteed Rare+ | 50 pulls = guaranteed Epic |

## Rarities & Rates
| Rarity | Rate | Color | Examples |
|--------|------|-------|----------|
| Common | 60% | Gray | Novice units, basic weapons |
| Rare | 25% | Blue | Tier 1 job units, good weapons |
| Epic | 10% | Purple | Tier 2 job units, powerful gear |
| Legendary | 4% | Orange | Tier 3 job units, game-changing items |
| Mythic | 1% | Red | Tier 4 job units, exclusive cosmetics |

## Item Types
1. **Units**: Characters with jobs (Novice → Swordman → Knight → Paladin → Arch Paladin)
2. **Weapons**: Equipment with stat bonuses (swords, staves, bows, etc.)
3. **Cards**: Combat modifiers (stat boosts, skill modifiers)
4. **Skills**: Learnable abilities for units
5. **Job Cores**: Required for job evolution (Tier 2+)

## Job Core System
- **Purpose**: Gate job evolutions behind gacha RNG
- **Drop Rates**: Matches job tier (Tier 2 = Epic, Tier 3 = Legendary, Tier 4 = Mythic)
- **Cores in Gacha**: `core_knight`, `core_wizard`, `core_paladin`, `core_crusader`, `core_sage`, `core_archmage`, `core_arch_paladin`, `core_grand_archmage`

## Pity System Details
- **Epic Pity**: 50 pulls guarantee at least 1 Epic
- **Counter resets**: When hitting guaranteed tier or higher
- **Implementation**: `lib/rpg-system/gacha-logic.ts` → `calculatePullResults()`

## Monetization Balance
- Average player: ~500-1000 gems per week (from stages, dailies)
- 5-10 multi pulls per week for active players
- FTP players can still progress, but slower
