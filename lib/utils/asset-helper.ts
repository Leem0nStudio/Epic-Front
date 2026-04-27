import { AssetService } from '../services/asset-service';

export class AssetHelper {
    static getUnitSprite(spriteId?: string, jobId?: string): string {
        if (spriteId) {
            return AssetService.getSpriteUrl(spriteId);
        }
        return AssetService.getSpriteUrl(AssetService.getJobSpriteId(jobId || 'novice'));
    }

    static getJobIcon(jobId: string, iconId?: string): string {
        if (iconId && iconId !== 'novice_icon' && !iconId.endsWith('.jpeg')) {
            return AssetService.getIconUrl(iconId);
        }
        return AssetService.getIconUrl(AssetService.getJobIconId(jobId));
    }

    static getItemIcon(itemId: string, type: string): string {
        return '/assets/icons/item_fallback.png';
    }

    static getStageThumbnail(stageId: string): string {
        return `/assets/backgrounds/stages/${stageId}.png`;
    }
}
