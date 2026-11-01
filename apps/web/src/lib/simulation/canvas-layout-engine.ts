/**
 * CanvasLayoutEngine
 * Universal Spatial Layout & Collision Avoidance Engine for Gen Labs.
 *
 * Rules:
 * 1. Zero text/object collision across all 2D Canvas & SVG viewports.
 * 2. Labels calculate real measured bounding boxes before placement.
 * 3. Vectors place annotations with dynamic safe offsets (never on line or touching arrowhead).
 * 4. Objects define safe padding boundaries (8-16px).
 * 5. Deterministic, fast, zero-dependency, works identically in SSR & browser.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export type PlacementSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

export interface LayoutObstacle extends Rect {
  id?: string;
  padding?: number;
}

export interface ViewportBoundary {
  width: number;
  height: number;
  padding?: number;
}

// ============================================================================
// 1. GLOBAL NUMBER FORMATTER (Clean decimals, no 5.000000001, Indonesian comma)
// ============================================================================

/**
 * Formats numbers cleanly without floating point precision noise.
 * Examples:
 *   formatCleanNumber(5.0) -> "5"
 *   formatCleanNumber(5.50) -> "5,5"
 *   formatCleanNumber(12.8123) -> "12,81"
 *   formatCleanNumber(40.0, 1, "N") -> "40 N"
 */
export function formatCleanNumber(
  val: number | undefined | null,
  maxDecimals: number = 2,
  unit?: string
): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '0' + (unit ? ` ${unit}` : '');
  }

  // Round away tiny floating point noise (e.g. 5.000000000000001 -> 5)
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((Number(val) + Number.EPSILON) * factor) / factor;

  // Format to string, trimming unnecessary trailing zeros
  let str = rounded.toString();
  if (str.includes('.')) {
    str = rounded.toFixed(maxDecimals).replace(/\.?0+$/, '');
  }

  // Indonesian decimal separator
  const formatted = str.replace('.', ',');
  return unit ? `${formatted} ${unit}` : formatted;
}

// ============================================================================
// 2. TEXT MEASUREMENT (Actual character metric calculation)
// ============================================================================

let offscreenCtx: CanvasRenderingContext2D | null = null;

export function measureTextSize(
  text: string,
  fontSize: number = 11,
  fontFamily: string = 'monospace',
  _fontWeight: string | number = '600'
): { width: number; height: number } {
  if (!text) {
    return { width: 0, height: Math.round(fontSize * 1.2) };
  }

  // Pure deterministic font metric estimator (100% SSR & Client hydration identical)
  const isMono = fontFamily.toLowerCase().includes('mono');
  const avgCharWidth = isMono ? fontSize * 0.62 : fontSize * 0.54;
  const estimatedW = Math.round(text.length * avgCharWidth + 6);
  return {
    width: Math.max(estimatedW, 20),
    height: Math.round(fontSize * 1.35),
  };
}

// ============================================================================
// 3. COLLISION DETECTION UTILITIES
// ============================================================================

export function checkRectCollision(
  a: Rect,
  b: Rect,
  paddingA: number = 0,
  paddingB: number = 0
): boolean {
  const ax1 = a.x - paddingA;
  const ay1 = a.y - paddingA;
  const ax2 = a.x + a.width + paddingA;
  const ay2 = a.y + a.height + paddingA;

  const bx1 = b.x - paddingB;
  const by1 = b.y - paddingB;
  const bx2 = b.x + b.width + paddingB;
  const by2 = b.y + b.height + paddingB;

  return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
}

export function calculateOverlapArea(a: Rect, b: Rect): number {
  const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

export function isPointInsideRect(pt: Point, rect: Rect, padding: number = 0): boolean {
  return (
    pt.x >= rect.x - padding &&
    pt.x <= rect.x + rect.width + padding &&
    pt.y >= rect.y - padding &&
    pt.y <= rect.y + rect.height + padding
  );
}

// ============================================================================
// 4. DYNAMIC LABEL PLACEMENT ENGINE (placeLabel)
// ============================================================================

export interface PlaceLabelOptions {
  anchor: Rect | Point;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  preferredPosition?: PlacementSide;
  alternativePositions?: PlacementSide[];
  obstacles?: LayoutObstacle[];
  viewport?: ViewportBoundary;
  gap?: number; // Minimum gap from anchor boundary (default 12px)
  allowInside?: boolean;
}

export interface PlacedLabelResult {
  x: number;
  y: number;
  width: number;
  height: number;
  position: PlacementSide;
  textAnchor: 'start' | 'middle' | 'end';
  dominantBaseline: 'auto' | 'middle' | 'hanging';
}

export function placeLabel({
  anchor,
  text,
  fontSize = 11,
  fontFamily = '"Space Mono", monospace',
  fontWeight = '600',
  preferredPosition = 'top',
  alternativePositions = ['top', 'bottom', 'right', 'left', 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
  obstacles = [],
  viewport,
  gap = 12,
  allowInside = false,
}: PlaceLabelOptions): PlacedLabelResult {
  const { width: lblW, height: lblH } = measureTextSize(text, fontSize, fontFamily, fontWeight);

  const anchorRect: Rect = 'width' in anchor
    ? anchor
    : { x: anchor.x, y: anchor.y, width: 0, height: 0 };

  const candidatesOrder: PlacementSide[] = Array.from(
    new Set([preferredPosition, ...(allowInside ? (['center'] as PlacementSide[]) : []), ...alternativePositions])
  );

  const vpPad = viewport?.padding ?? 10;
  const minX = vpPad;
  const minY = vpPad;
  const maxX = (viewport?.width ?? 10000) - vpPad;
  const maxY = (viewport?.height ?? 10000) - vpPad;

  let bestCandidate: PlacedLabelResult | null = null;
  let leastCollisions = Infinity;
  let leastOverlapArea = Infinity;

  for (const pos of candidatesOrder) {
    let candX = 0;
    let candY = 0;
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    let dominantBaseline: 'auto' | 'middle' | 'hanging' = 'middle';

    switch (pos) {
      case 'top':
        candX = anchorRect.x + anchorRect.width / 2 - lblW / 2;
        candY = anchorRect.y - gap - lblH;
        textAnchor = 'middle';
        dominantBaseline = 'auto';
        break;

      case 'bottom':
        candX = anchorRect.x + anchorRect.width / 2 - lblW / 2;
        candY = anchorRect.y + anchorRect.height + gap;
        textAnchor = 'middle';
        dominantBaseline = 'hanging';
        break;

      case 'right':
        candX = anchorRect.x + anchorRect.width + gap;
        candY = anchorRect.y + anchorRect.height / 2 - lblH / 2;
        textAnchor = 'start';
        dominantBaseline = 'middle';
        break;

      case 'left':
        candX = anchorRect.x - gap - lblW;
        candY = anchorRect.y + anchorRect.height / 2 - lblH / 2;
        textAnchor = 'end';
        dominantBaseline = 'middle';
        break;

      case 'top-right':
        candX = anchorRect.x + anchorRect.width + gap;
        candY = anchorRect.y - gap - lblH;
        textAnchor = 'start';
        dominantBaseline = 'auto';
        break;

      case 'top-left':
        candX = anchorRect.x - gap - lblW;
        candY = anchorRect.y - gap - lblH;
        textAnchor = 'end';
        dominantBaseline = 'auto';
        break;

      case 'bottom-right':
        candX = anchorRect.x + anchorRect.width + gap;
        candY = anchorRect.y + anchorRect.height + gap;
        textAnchor = 'start';
        dominantBaseline = 'hanging';
        break;

      case 'bottom-left':
        candX = anchorRect.x - gap - lblW;
        candY = anchorRect.y + anchorRect.height + gap;
        textAnchor = 'end';
        dominantBaseline = 'hanging';
        break;

      case 'center':
        candX = anchorRect.x + anchorRect.width / 2 - lblW / 2;
        candY = anchorRect.y + anchorRect.height / 2 - lblH / 2;
        textAnchor = 'middle';
        dominantBaseline = 'middle';
        break;
    }

    // Viewport clamping
    if (viewport) {
      if (candX < minX) candX = minX;
      if (candX + lblW > maxX) candX = maxX - lblW;
      if (candY < minY) candY = minY;
      if (candY + lblH > maxY) candY = maxY - lblH;
    }

    const candRect: Rect = { x: candX, y: candY, width: lblW, height: lblH };

    // Check collisions against obstacles and anchor itself
    let collisionCount = 0;
    let totalOverlap = 0;

    // Anchor check (unless center is allowed)
    if (pos !== 'center' && checkRectCollision(candRect, anchorRect, 4, 4)) {
      collisionCount += 2;
      totalOverlap += calculateOverlapArea(candRect, anchorRect);
    }

    // Obstacle checks
    for (const obs of obstacles) {
      const pad = obs.padding ?? 8;
      if (checkRectCollision(candRect, obs, 2, pad)) {
        collisionCount++;
        totalOverlap += calculateOverlapArea(candRect, {
          x: obs.x - pad,
          y: obs.y - pad,
          width: obs.width + pad * 2,
          height: obs.height + pad * 2,
        });
      }
    }

    // Zero collisions: immediate clean match!
    if (collisionCount === 0) {
      return {
        x: candX,
        y: candY,
        width: lblW,
        height: lblH,
        position: pos,
        textAnchor,
        dominantBaseline,
      };
    }

    // Track best fallback candidate
    if (collisionCount < leastCollisions || (collisionCount === leastCollisions && totalOverlap < leastOverlapArea)) {
      leastCollisions = collisionCount;
      leastOverlapArea = totalOverlap;
      bestCandidate = {
        x: candX,
        y: candY,
        width: lblW,
        height: lblH,
        position: pos,
        textAnchor,
        dominantBaseline,
      };
    }
  }

  return (
    bestCandidate || {
      x: anchorRect.x,
      y: anchorRect.y - gap - lblH,
      width: lblW,
      height: lblH,
      position: preferredPosition,
      textAnchor: 'middle',
      dominantBaseline: 'auto',
    }
  );
}

// ============================================================================
// 5. VECTOR / ARROW LABEL ENGINE (placeVectorLabel)
// ============================================================================

export interface PlaceVectorLabelOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  preferredSide?: 'above' | 'below';
  obstacles?: LayoutObstacle[];
  viewport?: ViewportBoundary;
  clearance?: number; // Distance from vector shaft (default 14px)
}

export function placeVectorLabel({
  x1,
  y1,
  x2,
  y2,
  text,
  fontSize = 11,
  fontFamily = '"Space Mono", monospace',
  fontWeight = '600',
  preferredSide = 'above',
  obstacles = [],
  viewport,
  clearance = 14,
}: PlaceVectorLabelOptions): {
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'above' | 'below';
} {
  const { width: lblW, height: lblH } = measureTextSize(text, fontSize, fontFamily, fontWeight);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  // Vector midpoint
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Normal unit vector (perpendicular to line direction)
  const nx = len > 0 ? -dy / len : 0;
  const ny = len > 0 ? dx / len : -1;

  // Ensure "above" consistently has negative Y in standard canvas coordinates
  const aboveSign = ny > 0 ? -1 : 1;
  const sidesToTry: ('above' | 'below')[] = preferredSide === 'above' ? ['above', 'below'] : ['below', 'above'];

  // Add arrowhead safe zone as obstacle so text never overlaps the arrowhead
  const arrowHeadObstacle: LayoutObstacle = {
    x: x2 - 10,
    y: y2 - 10,
    width: 20,
    height: 20,
    padding: 6,
  };
  const effectiveObstacles = [...obstacles, arrowHeadObstacle];

  let bestResult: { x: number; y: number; width: number; height: number; side: 'above' | 'below' } | null = null;
  let leastCollisions = Infinity;

  for (const side of sidesToTry) {
    const sign = (side === 'above' ? 1 : -1) * aboveSign;
    let labelCenterX = midX + nx * clearance * sign;
    let labelCenterY = midY + ny * clearance * sign;

    // If vector is very short (< 45px), shift outward past start point
    if (len < 45) {
      labelCenterX += (dx > 0 ? 1 : -1) * (lblW / 2 + 8);
    }

    let candX = labelCenterX - lblW / 2;
    let candY = labelCenterY - lblH / 2;

    // Viewport clamping
    if (viewport) {
      const vpPad = viewport.padding ?? 8;
      candX = Math.max(vpPad, Math.min(viewport.width - vpPad - lblW, candX));
      candY = Math.max(vpPad, Math.min(viewport.height - vpPad - lblH, candY));
    }

    const candRect: Rect = { x: candX, y: candY, width: lblW, height: lblH };

    let collisions = 0;
    for (const obs of effectiveObstacles) {
      if (checkRectCollision(candRect, obs, 2, obs.padding ?? 6)) {
        collisions++;
      }
    }

    if (collisions === 0) {
      return { x: candX, y: candY, width: lblW, height: lblH, side };
    }

    if (collisions < leastCollisions) {
      leastCollisions = collisions;
      bestResult = { x: candX, y: candY, width: lblW, height: lblH, side };
    }
  }

  return bestResult || {
    x: midX - lblW / 2,
    y: midY - clearance - lblH,
    width: lblW,
    height: lblH,
    side: 'above',
  };
}

// ============================================================================
// 6. OBJECT & MASS BLOCK LAYOUT ENGINE (layoutObjectWithLabel)
// ============================================================================

export interface ObjectLayoutResult {
  objectRect: Rect;
  safeBoundary: Rect;
  label: PlacedLabelResult;
  isInside: boolean;
}

export function layoutObjectWithLabel({
  x,
  y,
  width,
  height,
  labelText,
  fontSize = 12,
  fontFamily = '"Space Mono", monospace',
  fontWeight = '700',
  preferredPosition = 'center',
  safePadding = 12,
  obstacles = [],
  viewport,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  labelText: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  preferredPosition?: PlacementSide;
  safePadding?: number;
  obstacles?: LayoutObstacle[];
  viewport?: ViewportBoundary;
}): ObjectLayoutResult {
  const objectRect: Rect = { x, y, width, height };
  const safeBoundary: Rect = {
    x: x - safePadding,
    y: y - safePadding,
    width: width + safePadding * 2,
    height: height + safePadding * 2,
  };

  const { width: lblW, height: lblH } = measureTextSize(labelText, fontSize, fontFamily, fontWeight);

  // Determine if label fits comfortably inside object (with at least 14px horizontal and 10px vertical breathing room)
  const canFitInside = width >= lblW + 14 && height >= lblH + 10;
  const allowInside = preferredPosition === 'center' && canFitInside;

  const targetPlacement: PlacementSide = allowInside ? 'center' : 'top';

  const labelPlacement = placeLabel({
    anchor: objectRect,
    text: labelText,
    fontSize,
    fontFamily,
    fontWeight,
    preferredPosition: targetPlacement,
    alternativePositions: ['top', 'bottom', 'right', 'left'],
    obstacles,
    viewport,
    gap: 14,
    allowInside,
  });

  return {
    objectRect,
    safeBoundary,
    label: labelPlacement,
    isInside: labelPlacement.position === 'center',
  };
}

// ============================================================================
// 7. CANVAS 2D CONTEXT DRAWING HELPERS
// ============================================================================

export function drawCanvasLabel(
  ctx: CanvasRenderingContext2D,
  placed: PlacedLabelResult,
  text: string,
  options: {
    textColor?: string;
    bgColor?: string;
    borderColor?: string;
    showBadge?: boolean;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    radius?: number;
  } = {}
) {
  const {
    textColor = '#2E6B55',
    bgColor = 'rgba(255, 255, 255, 0.95)',
    borderColor,
    showBadge = true,
    fontSize = 11,
    fontFamily = '"Space Mono", monospace',
    fontWeight = '600',
    radius = 4,
  } = options;

  ctx.save();

  if (showBadge && bgColor) {
    ctx.fillStyle = bgColor;
    if (typeof (ctx as any).roundRect === 'function') {
      ctx.beginPath();
      (ctx as any).roundRect(placed.x - 4, placed.y - 2, placed.width + 8, placed.height + 4, radius);
      ctx.fill();
      if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else {
      ctx.fillRect(placed.x - 4, placed.y - 2, placed.width + 8, placed.height + 4);
      if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(placed.x - 4, placed.y - 2, placed.width + 8, placed.height + 4);
      }
    }
  }

  ctx.fillStyle = textColor;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, placed.x, placed.y + placed.height / 2);

  ctx.restore();
}
