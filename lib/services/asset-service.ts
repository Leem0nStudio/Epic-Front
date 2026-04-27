export type AssetArchetype = 'melee' | 'magic' | 'ranged' | 'support' | 'neutral';

export class AssetService {
  private static SPRITE_BASE_URL = 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/';
  private static ICON_BASE_URL = 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/icons/';

    private static ARCHETYPE_MAP: Record<AssetArchetype, number[]> = {
    melee: [3, 4, 5, 6],
    magic: [9, 10, 11, 12],
    ranged: [15, 16, 17, 18],
    support: [13, 14],
    neutral: [1, 2]
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
    'crusader': 'crusader_1.jpeg'
  };

  static getRandomSpriteId(archetype: AssetArchetype): string {
    const ids = this.ARCHETYPE_MAP[archetype] || this.ARCHETYPE_MAP.neutral;
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    return `abbys_sprite_${randomId.toString().padStart(3, '0')}`;
  }

  static getSpriteUrl(spriteId: string): string {
    if (!spriteId) return `${this.SPRITE_BASE_URL}abbys_sprite_001.png`;
    return `${this.SPRITE_BASE_URL}${spriteId}.png`;
  }

  static getJobIconId(jobId: string): string {
    return this.JOB_ICON_MAP[jobId.toLowerCase()] || 'novice_1.jpeg';
  }

  static getIconUrl(iconId: string): string {
    if (!iconId) return `${this.ICON_BASE_URL}novice_1.jpeg`;
    // Handle both jpeg and png just in case, though repo seems to have jpeg for icons
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
