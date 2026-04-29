// Sprite Atlas Configuration
// 64x64.png: 1024x8768px = 16 columns × 137 rows = 2192 total sprites
// Each sprite is 64x64 pixels

export const ATLAS_CONFIG = {
  spriteSize: 64,
  columns: 16,
  rows: 137,
  totalSprites: 2192,
  imagePath: '/assets/ui/64x64.png',
} as const;

// Sprite index mappings (row-major order: index = row * 16 + col)
// Adjust these indices based on the actual sprite sheet layout
export const SPRITE_INDEX = {
  // Row 0 (indices 0-15) - Job Icons
  icon_novice: 0,
  icon_swordman: 1,
  icon_mage: 2,
  icon_ranger: 3,
  icon_archer: 4,
  icon_acolyte: 5,
  icon_knight: 6,
  icon_wizard: 7,
  icon_priest: 8,
  
  // Row 1 (indices 16-31) - Weapons
  weapon_sword: 16,
  weapon_axe: 17,
  weapon_spear: 18,
  weapon_bow: 19,
  weapon_staff: 20,
  weapon_dagger: 21,
  weapon_hammer: 22,
  weapon_mace: 23,
  
  // Row 2 (indices 32-47) - Armor
  armor_helmet: 32,
  armor_chest: 33,
  armor_boots: 34,
  armor_gloves: 35,
  armor_shield: 36,
  
  // Row 3 (indices 48-63) - Accessories
  accessory_ring: 48,
  accessory_necklace: 49,
  accessory_bracelet: 50,
  accessory_earring: 51,
  
  // Row 4 (indices 64-79) - Consumables/Items
  item_potion_hp: 64,
  item_potion_mp: 65,
  item_potion_exp: 66,
  item_potion_str: 67,
  item_potion_int: 68,
  
  // Row 5 (indices 80-95) - Resources
  resource_gold: 80,
  resource_gem: 81,
  resource_ore: 82,
  resource_wood: 83,
  resource_herb: 84,
  resource_crystal: 85,
  
  // Row 6 (indices 96-111) - UI Elements
  ui_arrow_left: 96,
  ui_arrow_right: 97,
  ui_arrow_up: 98,
  ui_arrow_down: 99,
  ui_close: 100,
  ui_settings: 101,
  ui_plus: 102,
  ui_minus: 103,
  ui_check: 104,
  ui_cross: 105,
  
  // Row 7 (indices 112-127) - Skill Icons
  skill_fire: 112,
  skill_ice: 113,
  skill_lightning: 114,
  skill_heal: 115,
  skill_buff: 116,
  skill_debuff: 117,
  skill_attack: 118,
  skill_defense: 119,
  
  // Row 8 (indices 128-143) - Card Frames/Rarities
  card_common: 128,
  card_rare: 129,
  card_epic: 130,
  card_legendary: 131,
  card_mythic: 132,
  card_frame: 133,
  
  // Row 9+ (indices 144+) - Individual Cards
  card_001: 144,
  card_002: 145,
  card_003: 146,
} as const;

export type SpriteKey = keyof typeof SPRITE_INDEX;

export function getSpriteIndex(key: SpriteKey): number {
  return SPRITE_INDEX[key];
}

// Helper to get sprite index by item type and ID
export function getSpriteIndexForItem(itemType: string, itemId: string): number | null {
  const key = `${itemType}_${itemId}`;
  const index = SPRITE_INDEX[key as SpriteKey];
  return index !== undefined ? index : null;
}
