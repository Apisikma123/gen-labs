import React from 'react';

export interface GenLabsLogoProps extends React.SVGAttributes<SVGElement> {
  variant?: 'symbol' | 'horizontal' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showSubtitle?: boolean;
  theme?: 'auto' | 'light' | 'dark';
}

const SIZE_MAP = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 42,
  xl: 56,
};

/**
 * GEN LABS — Official Brand Logo Component
 * Instrument-grade isometric test cell with phosphor telemetry core.
 */
export function GenLabsLogo({
  variant = 'symbol',
  size = 'md',
  showSubtitle = false,
  theme = 'auto',
  className = '',
  ...props
}: GenLabsLogoProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 32;

  // Authentic 3D Isometric Test Cell Colors (Pale Bone facets in canonical dark laboratory ground)
  const topFacetColor = '#E6ECE8';
  const rightFacetColor = '#CAD5CD';
  const leftFacetColor = '#9CB0A2';
  const coreColor = '#4B8F8C'; // Phosphor Sage Telemetry Core

  const renderFacets = () => (
    <>
      {/* Top Facet (Illuminated) */}
      <polygon
        points="128,36 204,80 152,110 128,96 104,110 52,80"
        fill={topFacetColor}
      />
      {/* Right Facet (Midtone) */}
      <polygon
        points="207.69,174 131.69,218 131.69,158 152.48,146 152.48,118 207.69,126"
        fill={rightFacetColor}
      />
      {/* Left Facet (Shadow) */}
      <polygon
        points="48.31,174 48.31,86 103.52,118 103.52,146 124.31,158 124.31,218"
        fill={leftFacetColor}
      />
      {/* Central Reaction Core: Precision Diamond Reticle */}
      <polygon points="128,118 138,128 128,138 118,128" fill={coreColor} />
    </>
  );

  // Symbol only
  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 256 256"
        width={pixelSize}
        height={pixelSize}
        role="img"
        aria-label="GEN LABS"
        className={`inline-block shrink-0 align-middle ${className}`}
        {...props}
      >
        <title>GEN LABS</title>
        {renderFacets()}
      </svg>
    );
  }

  // Horizontal Lockup
  if (variant === 'horizontal') {
    const height = pixelSize;

    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        {/* Symbol */}
        <svg
          viewBox="0 0 256 256"
          width={height}
          height={height}
          role="img"
          aria-hidden="true"
          className="shrink-0"
        >
          {renderFacets()}
        </svg>

        {/* Wordmark */}
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight font-heading font-extrabold text-[var(--color-text)] text-[1.125em]">
            <span>GEN</span>
            <span className="mx-[3px]"> </span>
            <span>LABS</span>
          </div>
          {showSubtitle && (
            <span className="font-mono text-[0.45em] tracking-[0.2em] uppercase font-bold text-[var(--color-text-tertiary,#8ED3CF)] mt-0.5">
              UNIVERSAL SIMULATION PLATFORM
            </span>
          )}
        </div>
      </div>
    );
  }

  // Stacked Lockup
  return (
    <div className={`inline-flex flex-col items-center text-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 256 256"
        width={pixelSize}
        height={pixelSize}
        role="img"
        aria-hidden="true"
        className="shrink-0"
      >
        {renderFacets()}
      </svg>
      <div className="flex flex-col items-center leading-tight">
        <div className="flex items-center tracking-tight font-heading font-extrabold text-[var(--color-text)] text-[1.1em]">
          <span>GEN</span>
          <span className="mx-[3px]"> </span>
          <span>LABS</span>
        </div>
        {showSubtitle && (
          <span className="font-mono text-[0.45em] tracking-[0.2em] uppercase font-bold text-[var(--color-text-tertiary,#8ED3CF)] mt-1">
            UNIVERSAL SIMULATION PLATFORM
          </span>
        )}
      </div>
    </div>
  );
}

export default GenLabsLogo;
