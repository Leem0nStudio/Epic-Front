'use client';

export type AssetArchetype = 'melee' | 'magic' | 'ranged' | 'support' | 'neutral';

export class AssetService {
  private static SPRITE_BASE_URL = 'https://cdn.jsdelivr.net/gh/Leemonztuff/gameassets@main/Characters/';
  private static ICON_BASE_URL = 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/icons/';

  private static JOB_SPRITE_MAP: Record<string, string> = {
    'novice': 'novice_f.png',
    'swordman': 'F/1/swordman_.png',
    'mage': 'F/1/mage_.png',
    'archer': 'F/1/archer_.png',
    'acolyte': 'F/1/acolyte_.png',
    'merchant': 'F/1/merchant_.png',
    'thief': 'F/1/thief_.png',
    'knight': 'F/2-1/knight_.png',
    'wizard': 'F/2-1/wizard_.png',
    'priest': 'F/2-1/priest_.png',
    'blacksmith': 'F/2-1/blacksmith_.png',
    'assassin': 'F/2-1/assasin_.png', 'assasin': 'F/2-1/assasin_.png'
  };

  private static ARCHETYPE_SPRITE_MAP: Record<AssetArchetype, string[]> = {
    melee: ['F/1/swordman_.png', 'F/2-1/knight_.png'],
    magic: ['F/1/mage_.png', 'F/2-1/wizard_.png'],
    ranged: ['F/1/archer_.png', 'F/1/thief_.png', 'F/2-1/assasin_.png'],
    support: ['F/1/acolyte_.png', 'F/2-1/priest_.png'],
    neutral: ['novice_f.png']
  };

  private static JOB_ICON_MAP: Record<string, string> = {
    'novice': 'novice_1.jpeg',
    'swordman': 'swordman_1.jpeg',
    'knight': 'knight_1.jpeg',
    'wizard': 'wizard_1.jpeg',
    'priest': 'priest_1.jpeg',
    'hunter': 'hunter_1.jpeg',
    'assassin': 'assassin_1.jpeg',
    'blacksmith': 'blacksmith_1.jpeg',
    'alchemist': 'alchemist_1.jpeg',
    'sage': 'sage_1.jpeg',
    'monk': 'monk_1.jpeg',
    'rogue': 'rogue_1.jpeg',
    'bard': 'bard_1.jpeg',
    'dancer': 'dancer_1.jpeg',
    'crusader': 'crusader_1.jpeg',
    'mage': 'wizard_1.jpeg',
    'archer': 'hunter_1.jpeg',
    'acolyte': 'priest_1.jpeg',
    'merchant': 'blacksmith_1.jpeg',
    'thief': 'assassin_1.jpeg'
  };

  static getRandomSpriteId(archetype: AssetArchetype): string {
    const sprites = this.ARCHETYPE_SPRITE_MAP[archetype] || this.ARCHETYPE_SPRITE_MAP.neutral;
    return sprites[Math.floor(Math.random() * sprites.length)];
  }

  static getJobSpriteId(jobId: string): string {
    return this.JOB_SPRITE_MAP[jobId.toLowerCase()] || 'novice_f.png';
  }

  static getSpriteUrl(spriteId: string): string {
    if (!spriteId) return `${this.SPRITE_BASE_URL}novice_f.png`;
    if (spriteId.startsWith('http')) return spriteId;
    return `${this.SPRITE_BASE_URL}${spriteId}`;
  }

  static getJobIconId(jobId: string): string {
    return this.JOB_ICON_MAP[jobId.toLowerCase()] || 'novice_1.jpeg';
  }

  static getIconUrl(iconId: string): string {
    if (!iconId) return `${this.ICON_BASE_URL}novice_1.jpeg`;
    if (iconId.startsWith('http')) return iconId;
    return `${this.ICON_BASE_URL}${iconId}`;
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
