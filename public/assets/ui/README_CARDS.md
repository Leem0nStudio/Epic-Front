# Enemy Card Images

Place the following card images in this folder (`/public/assets/ui/`):

## Required Card Images:
- `card_zombie.png` - Card image for Zombie enemy
- `card_goblin.png` - Card image for Goblin enemy  
- `card_baphomet.png` - Card image for Baphomet enemy

## How to Create Card Images:
1. Use the sprite images from `/public/assets/sprites/`
2. Create a card frame (recommended size: 300x400px)
3. Add enemy name, stats, and description
4. Export as PNG with transparency

## Card Button Location:
When players tap on enemies during battle, a card button (🃏 icon) appears next to the enemy name. Clicking it opens a modal displaying the enemy card.

## Code Implementation:
- Modal Component: `/components/ui/EnemyCardModal.tsx`
- Integration: `/components/views/BattleScreenView.tsx`
- Asset Service: `/lib/services/asset-service.ts` (method: `getEnemyCardUrl()`)

## Default Behavior:
If card images are not found, the system will fallback to `/assets/ui/icon_novice.png`.
