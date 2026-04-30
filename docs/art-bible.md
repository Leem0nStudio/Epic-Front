# Art Bible — Epic-Front (Etherea)

*Version: 1.0 | Date: 2026-04-30 | Owner: Art Director*

---

## 1. Visual Identity & Pillars

Epic-Front (codenamed **Etherea**) is a fantasy RPG with a visual identity rooted in:

| Pillar | Description |
|--------|-------------|
| **Alchemy / Medieval Fantasy** | Gold accents, serif display fonts, ornate borders, magical particle effects |
| **Glassmorphism** | Frosted glass panels, blur backdrops, semi-transparent overlays |
| **Earthstone Frame** | 9-slice ornate borders for cards, panels, and buttons |
| **Dark Depth** | Deep navy/charcoal backgrounds with radial gradients and dramatic lighting |

---

## 2. Color Palette

### 2.1 Semantic Colors (Tailwind 4 @theme tokens)

```css
@theme {
  /* Surface & Backgrounds */
  --color-bg-deep: #020508;       /* Deepest dark — global app bg */
  --color-bg-panel: #0B1A2A;    /* Panel/navy blue — primary view bg */
  --color-bg-surface: #050A0F;   /* Dark gray — battle screen, cards */
  --color-bg-overlay: rgba(0, 0, 0, 0.6);

  /* Gold / Primary Accent */
  --color-gold: #F5C76B;
  --color-gold-muted: rgba(245, 199, 107, 0.4);
  --color-gold-dim: rgba(245, 199, 107, 0.1);

  /* Semantic Text */
  --color-text-primary: rgba(255, 255, 255, 0.9);
  --color-text-secondary: rgba(255, 255, 255, 0.6);  /* Minimum for body text (WCAG AA) */
  --color-text-tertiary: rgba(255, 255, 255, 0.3); /* Labels only, never body text */
  --color-text-disabled: rgba(255, 255, 255, 0.1);

  /* Rarity Colors */
  --color-rarity-common: #9CA3AF;
  --color-rarity-rare: #3B82F6;
  --color-rarity-super-rare: #D946EF;  /* SR */
  --color-rarity-ultra-rare: #F59E0B; /* UR */
  --color-rarity-mythic: #EF4444;    /* MR */

  /* Semantic States */
  --color-state-success: #10B981;
  --color-state-warning: #F59E0B;
  --color-state-error: #EF4444;
  --color-state-info: #3B82F6;

  /* Energy & Resources */
  --color-energy: #A855F7;
  --color-currency: #F5C76B;
  --color-premium: #22D3EE;

  /* Typography */
  --font-display: 'MedievalSharp', 'Georgia', serif;
  --font-stats: 'Montserrat', 'Arial', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 2.2 Rarity System (Unified)

| Tier | Code | Color | Display Name | Badge Stars |
|------|------|-------|-------------|-------------|
| C | Gray | `#9CA3AF` | Common | ★ |
| R | Blue | `#3B82F6` | Rare | ★★ |
| SR | Fuchsia | `#D946EF` | Super Rare | ★★★★ |
| UR | Gold | `#F59E0B` | Ultra Rare | ★★★★★ |
| MR | Red | `#EF4444` | Mythic Rare | ★★★★★★ |

**Rule:** All rarity references in code MUST use the `rarityColor()` or `rarityGlow()` utility, never hardcoded colors. (See Section 5.2)

---

## 3. Typography Scale

| Element | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| Display Headings (View titles) | MedievalSharp | `text-xl` (20px) | Black (900) | `tracking-widest` |
| Stat Values | Montserrat | `text-xs` (12px) | Bold (700) | `tracking-wide` |
| Body / Descriptions | Montserrat | `text-[9px]` min (12px min) | Medium (500) | `tracking-normal` |
| Labels / Badges | Montserrat | `text-[7px]` (9px) | Black (900) | `tracking-widest` uppercase |
| Buttons | Montserrat | `text-[10px]` (12px) | Black (900) | `tracking-wider` uppercase |

**Accessibility Note:** No text smaller than `text-[9px]` (12px) is allowed for readable content. Labels may use `text-[7px]` only for non-critical UI.

---

## 4. Spacing & Layout Scale

| Token | Tailwind Class | Value |
|-------|----------------|-------|
| `--space-panel-padding` | `p-2.5` | 10px |
| `--space-gap-sm` | `gap-1` | 4px |
| `--space-gap-md` | `gap-3` | 12px |
| `--space-gap-lg` | `gap-5` | 20px |
| `--space-border-width` | `border-2` | 2px |

**Touch Targets:** Minimum 44×44px (WCAG 2.5.5) — `min-w-[44px] min-h-[44px]`

---

## 5. Component Visual Language

### 5.1 Panels & Cards

- **Standard Panel:** `bg-bg-panel/60` + `border-gold-muted` + `rounded-xl`
- **Glass Panel:** `backdrop-blur-xl` + `bg-white/5` + `border-white/10`
- **Earthstone Frame:** Use `NineSlicePanel` component with `type="border"` + `variant="fancy"`

### 5.2 Rarity Glow (Unified Utility)

All components must use this shared utility (to be created in `lib/config/rarity.ts`):

```typescript
export const RARITY_COLORS: Record<string, string> = {
  'C':  'text-rarity-common',
  'R':  'text-rarity-rare', 
  'SR': 'text-rarity-super-rare',
  'UR': 'text-rarity-ultra-rare',
  'MR': 'text-rarity-mythic',
};

export const rarityGlow = (rarity: string) => {
  return RARITY_COLORS[rarity?.toUpperCase()] || 'text-rarity-common';
};
```

### 5.3 Buttons

| Variant | Background | Border | Text | Use Case |
|----------|-------------|--------|------|----------|
| `primary` | `gold` | `gold-muted` | Black | Main CTAs (Battle, Continue) |
| `secondary` | `bg-panel` | `white/10` | `text-primary` | Navigation, back buttons |
| `ghost` | Transparent | `white/20` | `text-secondary` | Icon buttons, tertiary actions |
| `danger` | `state-error` | `state-error/40` | White | Destructive actions |
| `action` | `bg-surface` | `gold/30` | `text-gold` | In-battle skill buttons |

---

## 6. Motion Design Guidelines

### 6.1 Standard Tokens

```css
@theme {
  --motion-duration-fast: 0.15s;
  --motion-duration-normal: 0.3s;
  --motion-duration-slow: 0.5s;
  --motion-spring-gentle: { type: 'spring', damping: 15, stiffness: 200 };
  --motion-ease-standard: [0.4, 0, 0.2, 1];
}
```

### 6.2 Standard Patterns

| Interaction | Motion Spec |
|-------------|-------------|
| Hover (buttons) | `whileHover: { scale: 1.05 }` @ `duration-fast` |
| Tap/Click | `whileTap: { scale: 0.95 }` |
| View Transition | `opacity: 0→1` @ `duration-normal` |
| Damage Numbers | `type: 'spring', damping: 10` + y offset |
| Burst Activation | `scale: 0.5→2, opacity: 0→1` @ 0.8s |
| Particle Effects | Infinite `opacity: [0.4,1,0.4]` @ 1.5s |

### 6.3 Reduced Motion (Accessibility)

Always wrap infinite animations in a `prefers-reduced-motion` check:

```typescript
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In motion components:
animate={shouldAnimate ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
```

---

## 7. Background Treatment Standards

| View | Background | Overlay |
|------|-------------|---------|
| **Global App** | `bg-bg-deep` (#020508) | N/A |
| **Home / RPGHomeView** | `bg-bg-panel` + `bg-[url('/assets/bg/home.jpg')]` | `linear-gradient(#0B1A2A/60, transparent, #020508/90)` |
| **Battle / BattleScreenView** | `bg-bg-surface` + `bg-[url('/assets/bg/battle_scenic.png')]` | `radial-gradient(circle, transparent 20%, #050A0F 100%)` |
| **Inventory / Gacha / Party** | `bg-bg-panel` | `view-overlay` class |
| **Auth / Login** | `bg-bg-deep` | N/A |

**Rule:** Never mix multiple background depths within the same view. Choose ONE: `bg-deep`, `bg-panel`, or `bg-surface`.

---

## 8. Asset Naming Convention

**MANDATORY FORMAT:** `[category]_[name]_[variant]_[size].[ext]`

| Category | Examples |
|----------|---------|
| `ui` | `ui_icon_mage_64.png`, `ui_panel_border_000_256.png` |
| `sprite` | `sprite_wizard_idle_64.png`, `sprite_knight_attack_128.png` |
| `bg` | `bg_home_1920.jpg`, `bg_battle_scenic_1920.jpg` |
| `card` | `card_zombie_256.png` |
| `icon` | `icon_archer_64.png`, `icon_sword_32.png` |

**Rules:**
1. All lowercase filenames
2. No spaces (use underscores)
3. Size in pixels (64, 128, 256, etc.)
4. No duplicate files in `/bg/` and `/backgrounds/` — use `/bg/` only

---

## 9. Visual State Communication

| State | Color | Additional Visual |
|-------|-------|-------------------|
| **Low Health (<25% HP)** | HP bar turns `state-error` + `animate-pulse` | Optional red vignette on sprite |
| **Quest Complete** | `state-success` + shimmer animation | "COMPLETED" badge |
| **Error** | `state-error` + `bg-state-error/10` border | Red left-border accent |
| **Victory** | `gold` + star particles | Confetti/shimmer overlay |
| **Burst Ready (≥100%)** | `text-yellow-300` + border-gold pulse | "ULTRA!" flash on activate |
| **Disabled** | `text-disabled` + `opacity-40` | No hover/tap feedback |

---

## 10. Accessibility Standards

### 10.1 Contrast Minimums

| Element | Minimum Contrast Ratio | Tailwind Class |
|---------|----------------------|----------------|
| Body text | 4.5:1 (WCAG AA) | `text-white/90` minimum |
| Large text (18pt+) | 3:1 (WCAG AA) | `text-white/70` minimum |
| UI Labels | 3:1 | `text-white/60` minimum |
| Disabled | N/A | `text-white/10` maximum |

### 10.2 Focus States

All interactive elements MUST have:
```css
*:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(245, 199, 107, 0.3);
}
```

### 10.3 Colorblind Support

Always pair color with a secondary indicator:
- Rarity: Add "(UR)" text next to glow in UnitCards
- HP Bars: Add pixel patterns or icons in addition to red/green
- Active states: Add border + icon, not just color change

---

## 11. File Structure for Art Assets

```
public/assets/
├── ui/               # Icons, panels, buttons (follow naming convention)
├── sprites/          # Character sprites (idle, attack, hurt variants)
├── bg/               # Background images (NO backgrounds/ folder!)
├── cards/            # Card artwork for units/enemies
└── icons/            # Small icons for stats, skills, items
```

**Forbidden:** Duplicate folders (`/bg/` AND `/backgrounds/`), mixed case filenames, spaces in filenames.

---

## 12. Review Checklist for New Assets

Before committing new art assets, verify:
- [ ] Filename follows `[category]_[name]_[variant]_[size].[ext]`
- [ ] All characters are lowercase
- [ ] No special characters (only a-z, 0-9, _, .)
- [ ] Size is included (e.g., `_64.png`)
- [ ] Placed in the correct subdirectory
- [ ] Optimized for web (< 200KB for sprites, < 500KB for backgrounds)
- [ ] Has both light and dark theme variants (if applicable)

---

*This Art Bible is the single source of truth for all visual decisions in Epic-Front.  
Any deviation must be proposed and approved by the Art Director.*
