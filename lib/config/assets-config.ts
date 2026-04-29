/**
 * Asset Configuration - Central registry for all game assets
 * 
 * This file documents the expected asset structure and provides
 * centralized configuration for the asset folder organization.
 */

export const ASSET_PATHS = {
  SPRITES: '/assets/sprites',
  UI: '/assets/ui',
  BG: '/assets/bg',
  ITEMS: '/assets/items',
} as const;

/**
 * Sprite Asset Expected Files
 * Character sprites in pixel art format (preferably 32x32 or 64x64)
 */
export const SPRITE_ASSETS = {
  CLASSES: {
    NOVICE: {
      idle: 'novice_idle.png',
      attack: 'novice_attack.png',
      hit: 'novice_hit.png',
      dead: 'novice_dead.png',
      walk: 'novice_walk.png',
    },
    WARRIOR: {
      idle: 'warrior_idle.png',
      attack: 'warrior_attack.png',
      hit: 'warrior_hit.png',
      dead: 'warrior_dead.png',
      walk: 'warrior_walk.png',
    },
    MAGE: {
      idle: 'mage_idle.png',
      attack: 'mage_attack.png',
      hit: 'mage_hit.png',
      dead: 'mage_dead.png',
      walk: 'mage_walk.png',
    },
    RANGER: {
      idle: 'ranger_idle.png',
      attack: 'ranger_attack.png',
      hit: 'ranger_hit.png',
      dead: 'ranger_dead.png',
      walk: 'ranger_walk.png',
    },
    PRIEST: {
      idle: 'priest_idle.png',
      attack: 'priest_attack.png',
      hit: 'priest_hit.png',
      dead: 'priest_dead.png',
      walk: 'priest_walk.png',
    },
    KNIGHT: {
      idle: 'knight_idle.png',
      attack: 'knight_attack.png',
      hit: 'knight_hit.png',
      dead: 'knight_dead.png',
      walk: 'knight_walk.png',
    },
    WIZARD: {
      idle: 'wizard_idle.png',
      attack: 'wizard_attack.png',
      hit: 'wizard_hit.png',
      dead: 'wizard_dead.png',
      walk: 'wizard_walk.png',
    },
  },
} as const;

/**
 * UI Assets Expected Files
 * Interface elements: buttons, frames, icons, panels
 */
export const UI_ASSETS = {
  ICONS: {
    JOB: {
      NOVICE: 'icon_novice.png',
      WARRIOR: 'icon_warrior.png',
      MAGE: 'icon_mage.png',
      RANGER: 'icon_ranger.png',
      PRIEST: 'icon_priest.png',
      KNIGHT: 'icon_knight.png',
      WIZARD: 'icon_wizard.png',
    },
    CURRENCY: {
      GOLD: 'currency_gold_icon.png',
      GEM: 'currency_gem_icon.png',
    },
    TAB: {
      PARTY: 'tab_icon_party.png',
      GUILD: 'tab_icon_guild.png',
    },
  },
  BUTTONS: {
    WORLD: 'world_button_base.png',
    // Add more buttons as needed
  },
  FRAMES: {
    // Button frames, panels, borders
  },
  PANELS: {
    // UI panels and backgrounds
  },
} as const;

/**
 * Background Assets Expected Files
 * Full backgrounds and parallax layers
 */
export const BG_ASSETS = {
  SCREENS: {
    HOME: 'home_bg.png',
    PARTY: 'battle_bg_party.png',
    GACHA: 'battle_bg_gacha.png',
    BATTLE: 'battle_scenic.png',
    CAMPAIGN: 'battle_bg_campaign.png',
    TAVERN: 'battle_bg_tavern.png',
    INVENTORY: 'battle_bg_inventory.png',
  },
  PARALLAX: {
    LAYER_1: 'parallax_layer_1.png', // Distant layer
    LAYER_2: 'parallax_layer_2.png', // Middle layer
    LAYER_3: 'parallax_layer_3.png', // Close layer
  },
} as const;

/**
 * Item Assets Expected Files
 * Weapons, cards, skills, equipment icons
 */
export const ITEM_ASSETS = {
  WEAPONS: {
    SWORD: 'weapon_sword.png',
    STAFF: 'weapon_staff.png',
    BOW: 'weapon_bow.png',
    HAMMER: 'weapon_hammer.png',
    SPEAR: 'weapon_spear.png',
    DAGGER: 'weapon_dagger.png',
  },
  CARDS: {
    FRAME: 'card_frame.png',
    // Card prefix: card_<id>.png
  },
  SKILLS: {
    ATTACK: 'skill_attack.png',
    DEFENSE: 'skill_defense.png',
    MAGIC: 'skill_magic.png',
    HEAL: 'skill_heal.png',
    BUFF: 'skill_buff.png',
    DEBUFF: 'skill_debuff.png',
  },
  ARMOR: {
    // armor_<id>.png
  },
  ACCESSORIES: {
    // accessory_<id>.png
  },
} as const;

/**
 * 9-Slice Configuration for Fantasy UI Assets
 * All panel/border assets are 96x96px → slice = 96/3 = 32px
 */
export const NINE_SLICE_CONFIG = {
  /** Default slice value for all UI assets */
  defaultSlice: 32,
  /** Filled panel assets (use `fill` keyword in border-image-slice) */
  panels: {
    'panel-000': { slice: 32, hasFill: true },
    'panel-007': { slice: 32, hasFill: true },
    'panel-008': { slice: 32, hasFill: true },
    'panel-009': { slice: 32, hasFill: true },
    'panel-021': { slice: 32, hasFill: true },
  },
  /** Border-only assets (transparent center, no `fill` keyword) */
  borders: {
    'panel-border-000': { slice: 32, hasFill: false },
    'panel-border-001': { slice: 32, hasFill: false },
    'panel-border-002': { slice: 32, hasFill: false },
    'panel-border-010': { slice: 32, hasFill: false },
    'panel-border-029': { slice: 32, hasFill: false },
    'panel-transparent-border-001': { slice: 32, hasFill: false },
  },
} as const;

/**
 * Rarity Configuration
 * Standard C/R/E/L/M rarity system for items, skills, and cards
 */
export const RARITY_COLORS = {
  C: '#9d9d9d', // Common - Gray
  R: '#0070dd', // Rare - Blue
  E: '#a335ee', // Epic - Purple
  L: '#ff8000', // Legendary - Gold
  M: '#ff0000', // Mythic - Red
} as const;

export type RarityCode = keyof typeof RARITY_COLORS;

/**
 * Maps human-readable rarity text to standard rarity codes
 * Handles legacy values like 'UR', 'SR', etc.
 */
export const RARITY_TEXT_TO_CODE: Record<string, RarityCode> = {
  // Standard text
  'common': 'C',
  'rare': 'R',
  'epic': 'E',
  'legendary': 'L',
  'mythic': 'M',
  // Legacy short codes
  'c': 'C',
  'r': 'R',
  'e': 'E',
  'l': 'L',
  'm': 'M',
  // Legacy long codes
  'ur': 'L', // Ultra Rare → Legendary
  'sr': 'E', // Super Rare → Epic
  'ssr': 'M', // Super Super Rare → Mythic
};

/**
 * Normalize any rarity input to a standard RarityCode
 */
export function getRarityCode(rarity: string | undefined | null): RarityCode {
  if (!rarity) return 'C';
  const normalized = rarity.toLowerCase().trim();
  return RARITY_TEXT_TO_CODE[normalized] || 'C';
}

/**
 * Asset Usage Examples
 * 
 * Sprites:
 *   const url = AssetService.getSpriteUrl('novice_idle.png');
 *   const url = AssetService.getSpriteWithState('novice', 'attack');
 * 
 * Icons:
 *   const url = AssetService.getJobIconUrl('warrior');
 *   const url = AssetService.getIconUrl('icon_warrior.png');
 * 
 * Backgrounds:
 *   const url = AssetService.getBgUrl('home');
 *   const url = AssetService.getParallaxLayerUrl(1);
 * 
 * Items:
 *   const url = AssetService.getWeaponIconUrl('sword');
 *   const url = AssetService.getSkillIconUrl('attack');
 *   const url = AssetService.getCardUrl('card_001');
 */
