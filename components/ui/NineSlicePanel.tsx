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
  /** CSS color string to tint the border/panel using overlay with mix-blend-mode */
  tintColor?: string;
  /** Rarity level for automatic border coloring (C/R/E/L/M). Overrides tintColor if both provided. */
  rarity?: RarityCode | string;
  /** Tint intensity (0-1). Controls overlay opacity. @default 0.3 */
  tintIntensity?: number;

  // Glassmorphism prop
  /** Enable glassmorphism effect with backdrop-filter blur */
  glassmorphism?: boolean;

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
  tintIntensity = 0.3,
  // Glassmorphism prop
  glassmorphism = false,
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

  // Resolve tint color from rarity or direct prop
  const resolvedTintColor = rarity 
    ? RARITY_COLORS[getRarityCode(rarity)]
    : tintColor;

  // Build glassmorphism style
  const glassmorphismStyle: React.CSSProperties = glassmorphism 
    ? UIService.getGlassStyle() 
    : {};

  // Merge with custom styles
  const mergedStyle: React.CSSProperties = {
    position: 'relative', // Ensure positioning for tint overlay
    ...nineSliceStyle,
    ...glassmorphismStyle,
    ...style,
  };

  // Build props
  const props: any = {
    className,
    style: mergedStyle,
    ...rest,
  };

  if (onClick) {
    props.onClick = onClick;
  }

  // Render with or without tint overlay
  if (resolvedTintColor) {
    return React.createElement(
      Component,
      props,
      <>
        {/* Tint overlay with mix-blend-mode for border-image compatibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: resolvedTintColor,
            mixBlendMode: 'multiply',
            opacity: tintIntensity,
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        />
        {children}
      </>
    );
  }

  // Use createElement to handle both string and component 'as' props
  return React.createElement(Component, props, children);
}
