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
