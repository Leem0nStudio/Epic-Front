import { AssetService } from './asset-service';
import { NINE_SLICE_CONFIG } from '@/lib/config/assets-config';

export class UIService {
  /**
   * Get panel sprite URL for 9-slice rendering
   * Available panels: panel-000, panel-007, panel-008, panel-009, panel-021
   */
  static getPanelUrl(panelId: string = 'panel-000'): string {
    return `/assets/ui/${panelId}.png`;
  }

  /**
   * Get border sprite URL for 9-slice rendering
   * Available borders: panel-border-000, panel-border-001, panel-border-002, panel-border-010, panel-border-029, panel-transparent-border-001
   */
  static getBorderUrl(borderId: string = 'panel-border-000'): string {
    return `/assets/ui/${borderId}.png`;
  }

  /**
   * Panel types for different UI elements
   */
  static PANELS = {
    default: 'panel-000',
    blue: 'panel-007',
    red: 'panel-008',
    green: 'panel-009',
    gold: 'panel-021',
  };

  static BORDERS = {
    default: 'panel-border-000',
    blue: 'panel-border-001',
    red: 'panel-border-002',
    thick: 'panel-border-010',
    fancy: 'panel-border-029',
    transparent: 'panel-transparent-border-001',
  };

  /**
   * Get 9-slice CSS properties for filled panels (panel-*.png)
   * Uses `fill` keyword to render center segment as background
   */
  static getPanelNineSliceStyle(panelId: string = 'panel-000'): React.CSSProperties {
    const panelConfig = NINE_SLICE_CONFIG.panels[panelId as keyof typeof NINE_SLICE_CONFIG.panels];
    const slice = panelConfig?.slice ?? NINE_SLICE_CONFIG.defaultSlice;
    const hasFill = panelConfig?.hasFill ?? true;

    return {
      borderImageSource: `url('${this.getPanelUrl(panelId)}')`,
      borderImageSlice: hasFill ? `${slice} fill` : `${slice}`,
      borderImageRepeat: 'round',
      borderWidth: `${slice}px`,
      borderStyle: 'solid',
      borderColor: 'transparent',
    };
  }

  /**
   * Get 9-slice CSS properties for border-only assets (panel-border-*.png)
   * No `fill` keyword → transparent center
   */
  static getBorderNineSliceStyle(borderId: string = 'panel-border-000'): React.CSSProperties {
    const borderConfig = NINE_SLICE_CONFIG.borders[borderId as keyof typeof NINE_SLICE_CONFIG.borders];
    const slice = borderConfig?.slice ?? NINE_SLICE_CONFIG.defaultSlice;
    const hasFill = borderConfig?.hasFill ?? false;

    return {
      borderImageSource: `url('${this.getBorderUrl(borderId)}')`,
      borderImageSlice: hasFill ? `${slice} fill` : `${slice}`,
      borderImageRepeat: 'round',
      borderWidth: `${slice}px`,
      borderStyle: 'solid',
      borderColor: 'transparent',
    };
  }

  /**
   * Get 9-slice style by panel variant (key of UIService.PANELS)
   */
  static getPanelStyleByVariant(variant: keyof typeof UIService.PANELS = 'default'): React.CSSProperties {
    const panelId = UIService.PANELS[variant];
    return this.getPanelNineSliceStyle(panelId);
  }

  /**
   * Get 9-slice style by border variant (key of UIService.BORDERS)
   */
  static getBorderStyleByVariant(variant: keyof typeof UIService.BORDERS = 'default'): React.CSSProperties {
    const borderId = UIService.BORDERS[variant];
    return this.getBorderNineSliceStyle(borderId);
  }

  /**
   * Get glassmorphism CSS properties
   */
  static getGlassStyle(opacity: number = 0.6, blur: number = 8): React.CSSProperties {
    return {
      backdropFilter: `blur(${blur}px)`,
      background: `rgba(10, 20, 40, ${opacity})`,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    };
  }
}
