# Guía de Assets para Home Screen

Para agilizar la subida de recursos al repositorio y mantener la coherencia visual, se han creado los siguientes directorios en `public/assets/`. Aquí tienes la lista de archivos recomendados:

## Directorios Creados
- `/public/assets/ui/`: Elementos de interfaz (marcos, botones, iconos personalizados).
- `/public/assets/sprites/`: Sprites de personajes (Novice, Warrior, Mage, etc.).
- `/public/assets/bg/`: Fondos para la home y capas de parallax.
- `/public/assets/items/`: Iconos de armas, cartas y habilidades.

## Lista de Archivos Necesarios (Recomendado)

### 1. Personajes (Sprites Pixel-Art)
- `novice_idle.png`: Sprite base para el trabajo inicial.
- `warrior_idle.png`, `mage_idle.png`, `ranger_idle.png`: Sprites para evoluciones Tier 1.
- *Nota: Asegurar que los sprites tengan el pivote en la base (pies).*

### 2. Interfaz (UI)
- `currency_gold_icon.png`: Icono de moneda de oro (18x18px o superior).
- `currency_gem_icon.png`: Icono de gemas (18x18px o superior).
- `tab_icon_party.png`, `tab_icon_guild.png`, `tab_icon_nexo.png`: Iconos para el menú inferior.
- `world_button_base.png`: Textura base para el botón de Mundo (72x72px).

### 3. Fondos y Efectos
- `home_bg_main.jpg`: Fondo principal (sugerido: 1080x1920px para móvil).
- `parallax_layer_far.png`: Capa lejana del fondo (nubes, montañas distantes).
- `parallax_layer_mid.png`: Capa media (estructuras, vegetación).
- `floor_shadow_pedestal.png`: Textura para el pedestal (opcional, actualmente generado por CSS).

## Instrucciones de Implementación
El componente `RPGHomeView.tsx` ya está configurado para buscar sprites dinámicamente usando el `AssetHelper`. Asegúrate de nombrar los archivos siguiendo el `current_job_id` de la base de datos (ej. `novice.png`).
