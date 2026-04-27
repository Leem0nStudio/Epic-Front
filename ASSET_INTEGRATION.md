# Asset Integration Guide

Esta guía explica cómo usar la nueva estructura de assets en el codebase.

## Estructura de Directorios

```
/public/assets/
├── sprites/          # Sprites de personajes (32x32 o 64x64 pixel art)
├── ui/              # Elementos de interfaz (botones, marcos, iconos)
├── bg/              # Fondos y capas paralax
└── items/           # Iconos de armas, cartas, habilidades, equipo
```

## Rutas de Acceso

El `AssetService` y `ASSET_PATHS` centralizan todas las rutas. **No hardcodes URLs directas**.

### ✅ Correcto - Usar AssetService

```typescript
import { AssetService } from '@/lib/services/asset-service';

// Sprites
const spriteUrl = AssetService.getSpriteUrl('novice_idle.png');
const attackSprite = AssetService.getSpriteWithState('warrior', 'attack');

// Iconos
const jobIcon = AssetService.getIconUrl('icon_warrior.png');
const currencyIcon = AssetService.getUIUrl('currency_gold');

// Fondos
const homeBackground = AssetService.getBgUrl('home');
const parallaxLayer = AssetService.getParallaxLayerUrl(1);

// Items
const weaponIcon = AssetService.getWeaponIconUrl('sword');
const skillIcon = AssetService.getSkillIconUrl('attack');
const cardUrl = AssetService.getCardUrl('card_001');
```

### ❌ Incorrecto - URLs hardcodeadas

```typescript
// NO HAGAS ESTO:
<img src="/assets/sprites/novice_idle.png" />
<div style={{ backgroundImage: "url('/assets/bg/home_bg.png')" }} />
```

## Métodos Disponibles

### Sprites

```typescript
// Obtener sprite de un trabajo
getSpriteUrl(spriteId: string): string
getSpriteWithState(jobId: string, state: 'idle' | 'attack' | 'hit' | 'dead' | 'walk'): string

// Mapeos automáticos
getJobSpriteId(jobId: string): string
getRandomSpriteId(archetype: AssetArchetype): string
```

### Iconos

```typescript
// Icons
getIconUrl(iconId: string): string
getJobIconId(jobId: string): string
getUIUrl(uiKey: string): string
```

### Fondos

```typescript
// Backgrounds y parallax
getBgUrl(bgKey: BackgroundKey | string): string
getParallaxLayerUrl(layer: 1 | 2 | 3): string

// Claves disponibles: 'home' | 'party' | 'gacha' | 'battle' | 'campaign' | 'tavern' | 'inventory'
```

### Items

```typescript
// Armas
getWeaponIconUrl(weaponId: string): string

// Habilidades
getSkillIconUrl(skillId: string): string

// Cartas
getCardUrl(cardId: string): string

// Equipo
getArmorIconUrl(armorId: string): string
getAccessoryIconUrl(accessoryId: string): string

// Genérico
getItemIconUrl(itemType: ItemType, itemId: string): string
```

## Ejemplos en Componentes

### Usando Sprites en Componentes React

```typescript
import { AssetService } from '@/lib/services/asset-service';

export function UnitCard({ unit }) {
  return (
    <div>
      <img 
        src={AssetService.getSpriteUrl(unit.sprite_id)} 
        alt={unit.name}
        style={{ imageRendering: 'pixelated' }}
      />
      <img 
        src={AssetService.getJobIconUrl(unit.job_id)} 
        alt="Job Icon"
      />
    </div>
  );
}
```

### Fondos en Componentes

```typescript
import { AssetService } from '@/lib/services/asset-service';

export function BattleView() {
  return (
    <div style={{ backgroundImage: `url('${AssetService.getBgUrl('battle')}')` }}>
      {/* Content */}
    </div>
  );
}
```

### Parallax Layers

```typescript
import { AssetService } from '@/lib/services/asset-service';

export function ParallaxBackground() {
  return (
    <div className="parallax-container">
      <img src={AssetService.getParallaxLayerUrl(1)} className="parallax-layer-1" />
      <img src={AssetService.getParallaxLayerUrl(2)} className="parallax-layer-2" />
      <img src={AssetService.getParallaxLayerUrl(3)} className="parallax-layer-3" />
    </div>
  );
}
```

### Items e Inventario

```typescript
import { AssetService } from '@/lib/services/asset-service';

export function InventoryItem({ item }) {
  return (
    <div>
      <img 
        src={AssetService.getItemIconUrl(item.type, item.id)} 
        alt={item.name}
      />
      <p>{item.name}</p>
    </div>
  );
}
```

## Convenciones de Nombres

### Sprites
- Formato: `{class}_{state}.png`
- Ejemplo: `warrior_idle.png`, `warrior_attack.png`
- Estados: `idle`, `attack`, `hit`, `dead`, `walk`

### Iconos
- Formato: `icon_{name}.png` o `{type}_{name}.png`
- Ejemplo: `icon_warrior.png`, `currency_gold_icon.png`

### Fondos
- Formato: `{screen}_bg.png` o `parallax_layer_{n}.png`
- Ejemplo: `home_bg.png`, `parallax_layer_1.png`

### Items
- Formato: `{type}_{name}.png` o `card_{id}.png`
- Ejemplo: `weapon_sword.png`, `skill_attack.png`, `card_001.png`

## Agregar Nuevos Assets

1. **Coloca los archivos en el directorio correcto** bajo `/public/assets/`

2. **Actualiza el mapa en AssetService** si es un nuevo tipo:
   ```typescript
   private static WEAPON_MAP: Record<string, string> = {
     'my_new_weapon': 'weapon_my_new_weapon.png',
   };
   ```

3. **Usa a través de AssetService**:
   ```typescript
   const url = AssetService.getWeaponIconUrl('my_new_weapon');
   ```

## Validación

El AssetService proporciona métodos de validación:

```typescript
if (AssetService.isValidBackground(bgKey)) {
  // Use background
}

if (AssetService.isValidWeapon(weaponId)) {
  // Use weapon
}
```

## Migración desde URLs Hardcodeadas

Si encuentras URLs hardcodeadas, reemplázalas:

**Antes:**
```typescript
<div style={{ backgroundImage: "url('/assets/backgrounds/homebg.png')" }}>
```

**Después:**
```typescript
<div style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')` }}>
```

## Notas Técnicas

- Los archivos PNG deben tener canal alfa para transparencia
- Optimiza imágenes antes de comprometer
- Usa resolución 2x para soporte en pantallas HD
- Mantén consistencia en la paleta de colores entre assets
- Los sprites en pixel art se renderizan mejor con `imageRendering: 'pixelated'`

## Referencia Rápida

| Tipo | Método | Ejemplo |
|------|--------|---------|
| Sprite | `getSpriteUrl()` | `getSpriteUrl('novice_idle.png')` |
| Sprite Estado | `getSpriteWithState()` | `getSpriteWithState('warrior', 'attack')` |
| Icono | `getIconUrl()` | `getIconUrl('icon_warrior.png')` |
| Fondo | `getBgUrl()` | `getBgUrl('home')` |
| Parallax | `getParallaxLayerUrl()` | `getParallaxLayerUrl(1)` |
| Arma | `getWeaponIconUrl()` | `getWeaponIconUrl('sword')` |
| Habilidad | `getSkillIconUrl()` | `getSkillIconUrl('attack')` |
| Carta | `getCardUrl()` | `getCardUrl('card_001')` |
