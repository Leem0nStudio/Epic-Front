/**
 * Utility to manage and resolve game assets (PNGs, Icons, Backgrounds).
 * Provides fallbacks for missing assets.
 */

const ASSET_BASE_PATH = 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO';

export const ASSETS = {
    UI: {
        BUTTON_PRIMARY: '/assets/ui/btn_primary.png',
        BUTTON_SECONDARY: '/assets/ui/btn_secondary.png',
        FRAME_GOLD: '/assets/ui/frame_gold.png',
        SLOT_EMPTY: '/assets/ui/slot_empty.png',
    },
    BACKGROUNDS: {
        HOME: '/assets/backgrounds/home_bg.png',
        BATTLE: '/assets/backgrounds/battle_bg.png',
        GACHA: '/assets/backgrounds/gacha_bg.png',
        MAP: '/assets/backgrounds/map_bg.png',
    },
    ICONS: {
        ZENY: '/assets/icons/zeny.png',
        GEM: '/assets/icons/gem.png',
        ENERGY: '/assets/icons/energy.png',
        EXP: '/assets/icons/exp.png',
    }
};

export class AssetHelper {
    /**
     * Resolves a sprite URL for a specific job or unit.
     */
    static getUnitSprite(jobId: string, _affinity?: string): string {
        // Mapping common jobs to known placeholder sprites
        const mapping: Record<string, string> = {
            'novice': `${ASSET_BASE_PATH}/abbys_sprite_001.png`,
            'swordman': `${ASSET_BASE_PATH}/abbys_sprite_001.png`,
            'knight': `${ASSET_BASE_PATH}/abbys_sprite_001.png`,
            'mage': `${ASSET_BASE_PATH}/abbys_sprite_001.png`,
        };

        return mapping[jobId.toLowerCase()] || `${ASSET_BASE_PATH}/abbys_sprite_001.png`;
    }

    /**
     * Resolves an icon URL for an item type or ID.
     */
    static getItemIcon(itemId: string, type: string): string {
        // Fallback logic for various types
        if (type === 'weapon') return '/assets/icons/wpn_fallback.png';
        if (type === 'card') return '/assets/icons/card_fallback.png';
        if (type === 'skill') return '/assets/icons/skill_fallback.png';
        if (type === 'material') return '/assets/icons/mat_fallback.png';

        return '/assets/icons/item_fallback.png';
    }

    /**
     * Resolves a thumbnail for a campaign stage.
     */
    static getStageThumbnail(stageId: string): string {
        return `/assets/backgrounds/stages/${stageId}.png`;
    }
}
