import React from 'react';
import { UIService } from '@/lib/services/ui-service';
import { RARITY_COLORS, getRarityCode, type RarityCode } from '@/lib/config/assets-config';

export interface NineSlicePanelProps {
  /** 'panel' for filled panels (panel-*.png), 'border' for border-only (panel-border-*.png) */
  type: 'panel' | 'border';
  /** Variant key from UIService.PANELS (if type='panel') or UIService.BORDERS (if type='border') */
  variant?: string;
  /** Direct asset ID (overrides variant if provided) */
  assetId?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  /** 
   * HTML element or motion component to render (default: 'div')
   * Can be a string like 'div', 'span', or a motion component like motion.div
   */
  as?: any;

  // Tinting props
  /** CSS color string to tint the border/panel using CSS filter */
  tintColor?: string;
  /** Rarity level for automatic border coloring (C/R/E/L/M). Overrides tintColor if both provided. */
  rarity?: RarityCode | string;
  /** Tint intensity (0-1). Controls color visibility. @default 0.5 */
  tintIntensity?: number;

  // Glassmorphism prop
  /** Enable glassmorphism effect with backdrop-filter blur */
  glassmorphism?: boolean;

  // Visual Alchemy props
  /** Enable Earthstone-style ornate frame (heavy ornamental borders) */
  earthstoneFrame?: boolean;
  /** Glass variant: 'frosted' (readable) or 'crystal' (immersive) */
  glassVariant?: 'frosted' | 'crystal';

  /** Additional props to pass to the rendered component (e.g., motion props) */
  [key: string]: any;
}

export function NineSlicePanel({
  type,
  variant = 'default',
  assetId,
  children,
  className = '',
  style,
  onClick,
  as: Component = 'div',
  // Tinting props
  tintColor,
  rarity,
  tintIntensity = 0.5,
  // Glassmorphism prop
  glassmorphism = false,
  // Visual Alchemy props
  earthstoneFrame = false,
  glassVariant = 'frosted',
  ...rest
}: NineSlicePanelProps) {
  // Resolve asset ID
  let resolvedAssetId: string;
  if (assetId) {
    resolvedAssetId = assetId;
  } else {
    if (type === 'panel') {
      resolvedAssetId = UIService.PANELS[variant as keyof typeof UIService.PANELS] || UIService.PANELS.default;
    } else {
      resolvedAssetId = UIService.BORDERS[variant as keyof typeof UIService.BORDERS] || UIService.BORDERS.default;
    }
  }

  // Get 9-slice styles
  const nineSliceStyle = type === 'panel' 
    ? UIService.getPanelNineSliceStyle(resolvedAssetId)
    : UIService.getBorderNineSliceStyle(resolvedAssetId);
  
  // Override border widths to make them thinner (more compact)
  if (type === 'border') {
    const sliceValue = nineSliceStyle.borderImageSlice as number;
    if (sliceValue && sliceValue > 16) {
      // Reduce slice value for thinner borders
      nineSliceStyle.borderImageSlice = Math.round(sliceValue / 2);
    }
  }

  // Resolve tint color from rarity or direct prop
  const resolvedTintColor = rarity 
    ? RARITY_COLORS[getRarityCode(rarity)]
    : tintColor;

  // Build glassmorphism style
  const glassmorphismStyle: React.CSSProperties = glassmorphism 
    ? UIService.getGlassStyle() 
    : {};

  // Visual Alchemy: Earthstone frame + Glass variants
  let earthstoneFrameStyle: React.CSSProperties = {};
  let glassVariantStyle: React.CSSProperties = {};
  
  if (earthstoneFrame) {
    earthstoneFrameStyle = {
      border: `2px solid rgba(245, 199, 107, ${tintIntensity || 0.3})`,
      boxShadow: `
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 2px 8px rgba(0, 0, 0, 0.3)
      `.trim(),
    };
  }

  if (glassVariant === 'frosted') {
    glassVariantStyle = {
      backgroundColor: 'rgba(11, 26, 42, 0.6)',
      backdropFilter: 'blur(20px) saturate(120%)',
      WebkitBackdropFilter: 'blur(20px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    };
  } else if (glassVariant === 'crystal') {
    glassVariantStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
    };
  }

  // Merge with custom styles
  const mergedStyle: React.CSSProperties = {
    position: 'relative',
    ...nineSliceStyle,
    ...earthstoneFrameStyle,
    ...glassVariantStyle,
    ...glassmorphismStyle,
    ...style,
  };

  // Apply tinting using CSS filter for hue rotation + saturation
  // This works directly on the border-image
  if (resolvedTintColor && type === 'border') {
    // Calculate hue-rotate from the color
    // For simplicity, apply a semi-transparent background color that shows through
    const alpha = Math.round(tintIntensity * 255).toString(16).padStart(2, '0');
    
    // Use a pseudo-element approach: add a colored background div inside
    // The border-image will render on top, and the color will show through transparent areas
    mergedStyle.backgroundColor = `${resolvedTintColor}${alpha}`;
  }

  // Build props
  const props: any = {
    className,
    style: mergedStyle,
    ...rest,
  };

  if (onClick) {
    props.onClick = onClick;
  }

  // If we have a tint color and it's a border type, we need to add an overlay
  if (resolvedTintColor && type === 'border') {
    return React.createElement(
      Component,
      props,
      <>
        <div 
          style={{
            position: 'absolute',
            inset: '32px', // Same as border width
            backgroundColor: `${resolvedTintColor}${Math.round(tintIntensity * 128).toString(16).padStart(2, '0')}`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </>
    );
  }

  // Use createElement to handle both string and component 'as' props
  return React.createElement(Component, props, children);
}
