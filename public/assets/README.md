# Assets Directory

Estructura de recursos gráficos para el juego Epic RPG.

## Directorios

### `/ui/`
Elementos de interfaz como botones, marcos, iconos personalizados y componentes visuales de la UI.

**Recursos esperados:**
- Botones para navegación y acciones
- Marcos y bordes decorativos
- Iconos de estado, recursos y símbolos del juego
- Paneles y fondos para elementos de interfaz

---

### `/sprites/`
Sprites de personajes (Novice, Warrior, Mage, Ranger) en diferentes estados (idle, attack, etc.).

**Recursos esperados:**
- Sprites de cada clase (Novice, Warrior, Mage, Ranger)
- Estados: idle, attack, hit, die, walk
- Resolución: Pixel art (preferible 32x32 a 64x64)
- Personajes enemigos y jefes

---

### `/bg/`
Fondos para la pantalla home y capas paralax para efectos de profundidad en batalla.

**Recursos esperados:**
- Fondo principal de home
- Fondos de batalla (diferentes escenarios)
- Capas de parallax (mínimo 3 capas)
- Efectos visuales de ambiente

---

### `/items/`
Iconos de armas, cartas, habilidades y objetos del inventario.

**Recursos esperados:**
- Iconos de armas (espada, bastón, arco, martillo, etc.)
- Iconos de cartas de habilidad
- Iconos de equipamiento (armadura, accesorios)
- Marcos y decoraciones de items

---

## Convenciones de nombres

- Use guiones bajos para separar palabras: `weapon_sword.png`
- Prefijos por tipo: `icon_`, `bg_`, `sprite_`, `weapon_`, `card_`, `skill_`, `armor_`
- Sufijos por estado: `_idle`, `_attack`, `_hit`, `_dead`
- Números para variantes: `parallax_layer_1.png`, `weapon_sword_v2.png`

---

## Notas técnicas

- Formato principal: PNG con canal alfa para transparencia
- Optimización: Comprimir sin perder calidad
- Resolución: Escalable, preferiblemente 2x para soporte a pantallas HD
- Paleta de colores: Consistente a través de todos los assets
