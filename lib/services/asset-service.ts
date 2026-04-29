'use client';

export type AssetArchetype = 'melee' | 'magic' | 'ranged' | 'support' | 'neutral';
export type ItemType = 'weapon' | 'card' | 'skill' | 'armor' | 'accessory';
export type BackgroundKey = 'home' | 'party' | 'gacha' | 'battle' | 'campaign' | 'tavern' | 'inventory';

export class AssetService {
  private static LOCAL_BASE = '/assets';
  
  private static SPRITE_PATH = `${this.LOCAL_BASE}/sprites`;
  private static UI_PATH = `${this.LOCAL_BASE}/ui`;
  private static BG_PATH = `${this.LOCAL_BASE}/bg`;
  private static ITEMS_PATH = `${this.LOCAL_BASE}/items`;

  // Sprite mappings
  private static JOB_SPRITE_MAP: Record<string, string> = {
    'novice': 'novice_idle.png',
    'swordman': 'swordsman_idle.png',
    'mage': 'mage_idle.png',
    'ranger': 'ranger_idle.png',
    'archer': 'archer_idle.png',
    'acolyte': 'acolyte_idle.png',
    'knight': 'knight_idle.png',
    'wizard': 'wizard_idle.png',
    'priest': 'priest_idle.png'
  };

  private static ARCHETYPE_SPRITE_MAP: Record<AssetArchetype, string> = {
    melee: 'warrior_idle.png',
    magic: 'mage_idle.png',
    ranged: 'ranger_idle.png',
    support: 'priest_idle.png',
    neutral: 'novice_idle.png'
  };

  // UI Icon mappings
  private static JOB_ICON_MAP: Record<string, string> = {
    'novice': 'icon_novice.png',
    'swordman': 'icon_swordsman.png',
    'mage': 'icon_mage.png',
    'ranger': 'icon_ranger.png',
    'archer': 'icon_archer.png',
    'acolyte': 'icon_acolyte.png',
    'knight': 'icon_knight.png',
    'wizard': 'icon_wizard.png',
    'priest': 'icon_priest.png'
  };

  private static UI_ICON_MAP: Record<string, string> = {
    'currency_gold': 'currency_gold_icon.png',
    'currency_gem': 'currency_gem_icon.png',
    'tab_party': 'tab_icon_party.png',
    'tab_guild': 'tab_icon_guild.png',
    'world': 'world_button_base.png'
  };

  // Background mappings
  private static BACKGROUND_MAP: Record<BackgroundKey, string> = {
    'home': 'home_bg.png',
    'party': 'battle_bg_party.png',
    'gacha': 'battle_bg_gacha.png',
    'battle': 'battle_scenic.png',
    'campaign': 'battle_bg_campaign.png',
    'tavern': 'battle_bg_tavern.png',
    'inventory': 'battle_bg_inventory.png'
  };

  // Weapon icons
  private static WEAPON_MAP: Record<string, string> = {
    'sword': 'weapon_sword.png',
    'staff': 'weapon_staff.png',
    'bow': 'weapon_bow.png',
    'hammer': 'weapon_hammer.png',
    'spear': 'weapon_spear.png',
    'dagger': 'weapon_dagger.png'
  };

  // Skill icons
  private static SKILL_MAP: Record<string, string> = {
    'attack': 'skill_attack.png',
    'defense': 'skill_defense.png',
    'magic': 'skill_magic.png',
    'heal': 'skill_heal.png',
    'buff': 'skill_buff.png',
    'debuff': 'skill_debuff.png'
  };

  // Sprite state suffixes
  private static SPRITE_STATES = ['idle', 'attack', 'hit', 'dead', 'walk'] as const;

  // Sprite getters
  static getRandomSpriteId(archetype: AssetArchetype): string {
    return this.ARCHETYPE_SPRITE_MAP[archetype] || this.ARCHETYPE_SPRITE_MAP.neutral;
  }

  static getJobSpriteId(jobId: string): string {
    const spriteName = this.JOB_SPRITE_MAP[jobId.toLowerCase()];
    if (spriteName) return spriteName;
    return this.getRandomSpriteId('neutral');
  }

  static getSpriteUrl(spriteId: string): string {
    if (!spriteId) {
      return `${this.SPRITE_PATH}/novice_idle.png`;
    }

    const normalized = spriteId.toLowerCase();
    if (normalized === 'novice' || normalized === 'novice_idle') {
      return `${this.SPRITE_PATH}/novice_idle.png`;
    }

    if (spriteId.startsWith('http') || spriteId.startsWith('/')) {
      return spriteId;
    }

    const fileName = spriteId.endsWith('.png') ? spriteId : `${spriteId}.png`;
    return `${this.SPRITE_PATH}/${fileName}`;
  }

  static getSpriteWithState(jobId: string, state: 'idle' | 'attack' | 'hit' | 'dead' | 'walk' = 'idle'): string {
    const baseName = this.JOB_SPRITE_MAP[jobId.toLowerCase()] || 'novice_idle.png';
    const fileName = baseName.replace('_idle.png', `_${state}.png`);
    return `${this.SPRITE_PATH}/${fileName}`;
  }

  // Icon getters
  static getJobIconId(jobId: string): string {
    const iconName = this.JOB_ICON_MAP[jobId.toLowerCase()];
    if (iconName) return iconName;
    return 'icon_novice.png';
  }

  static getIconUrl(iconId: string): string {
    if (!iconId) {
      return `${this.UI_PATH}/icon_novice.png`;
    }
    if (iconId.startsWith('http') || iconId.startsWith('/')) {
      return iconId;
    }
    return `${this.UI_PATH}/${iconId}`;
  }

  static getUIUrl(uiKey: string): string {
    const fileName = this.UI_ICON_MAP[uiKey];
    if (fileName) return `${this.UI_PATH}/${fileName}`;
    return '';
  }

  // Background getters
  static getBgUrl(bgKey: BackgroundKey | string): string {
    const fileName = this.BACKGROUND_MAP[bgKey as BackgroundKey] || bgKey;
    if (fileName.startsWith('http') || fileName.startsWith('/')) {
      return fileName;
    }
    return `${this.BG_PATH}/${fileName}`;
  }

  // Item getters
  static getWeaponIconUrl(weaponId: string): string {
    const fileName = this.WEAPON_MAP[weaponId.toLowerCase()] || 'weapon_sword.png';
    return `${this.ITEMS_PATH}/${fileName}`;
  }

  static getSkillIconUrl(skillId: string): string {
    const fileName = this.SKILL_MAP[skillId.toLowerCase()] || 'skill_attack.png';
    return `${this.ITEMS_PATH}/${fileName}`;
  }

  static getCardUrl(cardId: string): string {
    return `${this.ITEMS_PATH}/card_${cardId}.png`;
  }

  static getArmorIconUrl(armorId: string): string {
    return `${this.ITEMS_PATH}/armor_${armorId}.png`;
  }

  static getAccessoryIconUrl(accessoryId: string): string {
    return `${this.ITEMS_PATH}/accessory_${accessoryId}.png`;
  }

  static getItemIconUrl(itemType: ItemType, itemId: string): string {
    switch (itemType) {
      case 'weapon':
        return this.getWeaponIconUrl(itemId);
      case 'skill':
        return this.getSkillIconUrl(itemId);
      case 'card':
        return this.getCardUrl(itemId);
      case 'armor':
        return this.getArmorIconUrl(itemId);
      case 'accessory':
        return this.getAccessoryIconUrl(itemId);
      default:
        return `${this.ITEMS_PATH}/card_frame.png`;
    }
  }

  static getParallaxLayerUrl(layer: 1 | 2 | 3): string {
    return `${this.BG_PATH}/parallax_layer_${layer}.png`;
  }

  // Utility methods
  static getAffinityArchetype(affinity: string): AssetArchetype {
    switch (affinity.toLowerCase()) {
      case 'physical': return 'melee';
      case 'magic': return 'magic';
      case 'ranged': return 'ranged';
      case 'support': return 'support';
      default: return 'neutral';
    }
  }

  static isValidBackground(bgKey: string): boolean {
    return Object.keys(this.BACKGROUND_MAP).includes(bgKey);
  }

  static isValidWeapon(weaponId: string): boolean {
    return Object.keys(this.WEAPON_MAP).includes(weaponId.toLowerCase());
  }

  static isValidSkill(skillId: string): boolean {
    return Object.keys(this.SKILL_MAP).includes(skillId.toLowerCase());
  }
}