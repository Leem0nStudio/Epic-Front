'use client';

export type AssetArchetype = 'melee' | 'magic' | 'ranged' | 'support' | 'neutral';

export class AssetService {
  private static LOCAL_BASE = '/assets';
  
  private static SPRITE_PATH = `${this.LOCAL_BASE}/sprites`;
  private static UI_PATH = `${this.LOCAL_BASE}/ui`;
  private static BG_PATH = `${this.LOCAL_BASE}/bg`;
  private static ITEMS_PATH = `${this.LOCAL_BASE}/items`;

  private static JOB_SPRITE_MAP: Record<string, string> = {
    'novice': 'novice_idle.png',
    'swordman': 'warrior_idle.png',
    'mage': 'mage_idle.png',
    'ranger': 'ranger_idle.png',
    'archer': 'ranger_idle.png',
    'acolyte': 'priest_idle.png',
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

  private static JOB_ICON_MAP: Record<string, string> = {
    'novice': 'icon_novice.png',
    'swordman': 'icon_warrior.png',
    'mage': 'icon_mage.png',
    'ranger': 'icon_ranger.png',
    'archer': 'icon_ranger.png',
    'acolyte': 'icon_priest.png',
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
    if (spriteId.startsWith('http') || spriteId.startsWith('/')) {
      return spriteId;
    }
    return `${this.SPRITE_PATH}/${spriteId}`;
  }

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

  static getBgUrl(bgKey: string): string {
    return `${this.BG_PATH}/${bgKey}`;
  }

  static getAffinityArchetype(affinity: string): AssetArchetype {
    switch (affinity.toLowerCase()) {
      case 'physical': return 'melee';
      case 'magic': return 'magic';
      case 'ranged': return 'ranged';
      case 'support': return 'support';
      default: return 'neutral';
    }
  }
}