import React from 'react';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  strokeWidth?: number;
  color?: string;
  className?: string;
  title?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export type IconComponent = React.FC<IconProps>;

/**
 * Standard size scale for GEN LABS icons
 * xs: 14px (inline telemetry, pill badges)
 * sm: 16px (compact button icons, micro controls)
 * md: 20px (default interface buttons, navigation links)
 * lg: 24px (standard toolbar, modal headers)
 * xl: 32px (hero feature callouts, empty states)
 */
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export function resolveIconSize(size?: number | string): number | string {
  if (size === undefined) return 20;
  if (typeof size === 'number') return size;
  if (size in ICON_SIZES) return ICON_SIZES[size as keyof typeof ICON_SIZES];
  return size;
}

/**
 * Common SVG wrapper applying GEN LABS laboratory instrument standards:
 * - 24x24 coordinate viewport
 * - Crisp stroke joins and rounded terminal caps
 * - Semantic currentColor by default
 * - Accessible title & aria attributes
 */
export function createGenIcon(
  displayName: string,
  paths: React.ReactNode,
  options?: {
    viewBox?: string;
    defaultStrokeWidth?: number;
    fill?: string;
  }
): React.FC<IconProps> {
  const viewBox = options?.viewBox || '0 0 24 24';
  const defaultStrokeWidth = options?.defaultStrokeWidth ?? 1.75;

  const Component: React.FC<IconProps> = ({
    size = 20,
    strokeWidth = defaultStrokeWidth,
    color = 'currentColor',
    className = '',
    title,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    ...rest
  }) => {
    const pixelSize = resolveIconSize(size);
    const isDecorative = ariaHidden !== undefined ? ariaHidden : !ariaLabel && !title;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={pixelSize}
        height={pixelSize}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={isDecorative ? true : undefined}
        aria-label={ariaLabel}
        role={isDecorative ? 'presentation' : 'img'}
        className={`inline-block shrink-0 select-none align-middle ${className}`}
        {...rest}
      >
        {title && <title>{title}</title>}
        {paths}
      </svg>
    );
  };

  Component.displayName = displayName;
  return Component;
}
