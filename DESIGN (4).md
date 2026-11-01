---
name: GENLABS
colors:
  surface: '#14171E'
  surface-dim: '#0C0E12'
  surface-bright: '#222733'
  surface-container-lowest: '#080A0D'
  surface-container-low: '#0F1217'
  surface-container: '#14171E'
  surface-container-high: '#1B202A'
  surface-container-highest: '#222733'
  on-surface: '#F1F5F9'
  on-surface-variant: '#94A3B8'
  inverse-surface: '#F1F5F9'
  inverse-on-surface: '#14171E'
  outline: '#222733'
  outline-variant: '#191D26'
  surface-tint: '#3E8E75'
  primary: '#3E8E75'
  on-primary: '#FFFFFF'
  primary-container: '#1C332A'
  on-primary-container: '#4EAA8F'
  inverse-primary: '#3E8E75'
  secondary: '#4B8F8C'
  on-secondary: '#FFFFFF'
  secondary-container: '#143633'
  on-secondary-container: '#5FA8A5'
  tertiary: '#BA8230'
  on-tertiary: '#FFFFFF'
  tertiary-container: '#3E2908'
  on-tertiary-container: '#DDA14C'
  error: '#F87171'
  on-error: '#FFFFFF'
  error-container: '#450A0A'
  on-error-container: '#FCA5A5'
  primary-fixed: '#4EAA8F'
  primary-fixed-dim: '#3E8E75'
  on-primary-fixed: '#0C0E12'
  on-primary-fixed-variant: '#1C332A'
  secondary-fixed: '#5FA8A5'
  secondary-fixed-dim: '#4B8F8C'
  on-secondary-fixed: '#0C0E12'
  on-secondary-fixed-variant: '#143633'
  tertiary-fixed: '#DDA14C'
  tertiary-fixed-dim: '#BA8230'
  on-tertiary-fixed: '#0C0E12'
  on-tertiary-fixed-variant: '#3E2908'
  background: '#0C0E12'
  on-background: '#F1F5F9'
  surface-variant: '#1B202A'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Sora
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Space Mono
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Space Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Space Mono
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
  label-md:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
  label-sm:
    fontFamily: Space Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.5rem
  margin: 1.5rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an uncompromising, instrument-grade visual architecture engineered for complex physical modeling, computational simulations, and high-density telemetry. Built to empower university engineering researchers, physicists, and STEM practitioners, the environment evokes absolute optical precision, deliberate control, and focused mental endurance.

The visual style synthesizes brutalist precision with technical minimalism:
- **Controlled Precision Geometry:** Mildly rounded corners (2px roundedness) provide slight tactile softening while preserving matrix joints and rack-mounted test unit aesthetics.
- **Instrument-Grade Contrast:** Deep pine slate surfaces eliminate visual glare while luminous phosphor teals and warm radiant ochres direct cognitive attention to variable deltas, state changes, and mathematical outputs.
- **Monospaced Rigor:** Exacting tabular alignments honor mathematical logic; typography treats labels, coordinates, and equations as precision artifacts.

## Colors

The palette is derived directly from the institutional brand identity, mapped onto a high-density, low-glare dark simulation environment.

### Palette Architecture
- **Primary (`#1D4838` - Deep Pine Forest):** The structural bedrock of the interface. Employed for structural containers, active execution triggers, and foundational framing.
- **Secondary (`#4B8F8C` - Phosphor Sage Cyan):** High-clarity instrumentation telemetry. Used for active state variables, vector lines, focused coordinate tags, and baseline waveform renders.
- **Tertiary (`#BA8230` - Warm Ochre Gold):** Dynamic simulation energy. Highlights energetic thresholds, caution vectors, transient states, resonant frequencies, and key metric emphasis.
- **Neutral Surface Tone (`#2B3025` - Warm Dark Slate Olive):** Anchors the physical ground planes, gutter seams, and contextual panels. Subdued sub-variants provide a layered surface hierarchy:
  - Base Viewport Canvas: `#0E1410`
  - Panel Elevation 01: `#151B16`
  - Panel Elevation 02: `#1D241E`
  - Subtle Dividing Seams: `#2B3025`

### Functional Semantics
- **Success / Equilibrium:** `#4B8F8C` (Sage Cyan)
- **Warning / Parameter Drift:** `#BA8230` (Ochre Gold)
- **Critical / Divergence / Error:** `#D9534F`
- **Text Primary:** `#E6ECE8` (High-contrast pale pine tint)
- **Text Secondary / Muted Metrics:** `#8FA396` (Atmospheric sage gray)

## Typography

Typography balances architectural stability with algorithmic tabular readout:
- **Display & Headings (Sora):** Sora provides geometric clarity with crisp aperture terminals, ensuring module headers and primary simulation benchmarks remain authoritative at high density.
- **Body, Numerical Telemetry, & Labels (Space Mono):** Space Mono enforces strict column alignment across all data feeds, coordinates, timestamps, and parameters. Tabular numerals are mandatory; character widths never fluctuate during continuous computational rendering.

All micro labels (`label-sm`, `label-md`) use uppercase formatting with +0.06em tracking to optimize legibility on high-density displays.

## Layout & Spacing

The spatial architecture models an instrument chassis: modular, docked, and tightly aligned.
- **Grid Hierarchy:** A strict 12-column desktop grid scaling down to 6 columns on tablets and 4 columns on mobile. Surfaces snap together with flush borders, using `1px` structural divider seams rather than loose white space.
- **Micro Rhythms:** Component interiors follow an exact 4px/8px scale (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px). High-density readout blocks pack tight 4px and 8px gaps to preserve simulation canvas real estate.
- **Adaptive Canvas Model:**
  - **Desktop (>= 1200px):** Fixed utility rails (left: parameter inputs, right: live telemetry monitors) flank a responsive central rendering viewport.
  - **Tablet (768px - 1199px):** Rails collapse into tabbed side drawers; the central viewport remains persistently accessible.
  - **Mobile (< 768px):** Linear stacked panes featuring sticky bottom transport controls (run, pause, step-forward, reset).

## Elevation & Depth

To avoid optical diffusion and maintain scientific focus, this design system completely eliminates ambient drop shadows and skeuomorphic blur gradients.

- **Planar Tiering:** Depth is communicated exclusively through surface luminance:
  - **Base Field (Canvas Ground):** `#0E1410` (Darkest, recessed simulation plane).
  - **Tiers & Frames (Level 1):** `#151B16` with crisp `1px solid #2B3025` borders.
  - **Hover / Active Overlays (Level 2):** `#1D241E` bounded by `#4B8F8C` (Sage Cyan) or `#BA8230` (Ochre) accent lines.
- **Phosphor Illumination:** Interactive focuses, active relays, and selected telemetry cells generate an internal 1px high-contrast perimeter highlight rather than outward shadows, preserving sharp physical matrix boundaries.

## Shapes & Ergonomics

The geometry adheres to the modern, approachable, and professional **PRD v2.0 / Anime.js-grade** ergonomic radius hierarchy:
- **8px (`rounded-sm`):** Compact controls, telemetry tags, micro-badges.
- **12px (`rounded-md` / DEFAULT):** Inputs, buttons, segmented selectors.
- **16px (`rounded-lg`):** Standard cards, simulation apparatus panels, telemetry chassis.
- **20px (`rounded-xl`):** Learning journey decks, interactive comparison stages.
- **24px (`rounded-2xl`):** Hero containers, major viewport enclosures.
- **9999px (`rounded-full`):** Floating status pills, circular playheads, badges.

This calibrated geometry provides smooth visual tactility akin to high-end creative software and `animejs.com`, avoiding both brutalist sharp corners and cartoonish blob shapes.

## Components

### Buttons & Execution Controls
- **Primary Action (Run / Execute):** Modern rounded squircle (`12px` radius), background `#1D4838`, border `1px solid #4B8F8C`, text `#E6ECE8`, font `Space Mono` / `Sora`. Hover triggers background `#4B8F8C` with `#0E1410` inverted text.
- **Secondary / Step Action:** Background transparent, border `1px solid #2B3025`, text `#8FA396`, radius `12px`. Hover elevates border to `#8FA396` and text to `#E6ECE8`.
- **Cautionary / Reset:** Border `1px solid #BA8230`, text `#BA8230`, radius `12px`. Active click shifts background to `rgba(186, 130, 48, 0.15)`.

### Input Fields & Parameter Steppers
- Monospaced inputs with dark backgrounds (`#0E1410`) framed by a `1px solid #2B3025` outline and ergonomic `12px` rounded corners.
- Active focus switches border to `#4B8F8C`. Numerical units (`Hz`, `m/s²`, `rad`, `V`) are right-docked in subdued `#8FA396` `label-sm`.

### Chips & Status Indicators
- **Telemetry Chips:** Clean ergonomic tags (`8px` radius) with `2px` left border indicators:
  - Running / Sync: Left border `#4B8F8C`, fill `rgba(75, 143, 140, 0.08)`, text `#4B8F8C`.
  - Limit Warning: Left border `#BA8230`, fill `rgba(186, 130, 48, 0.08)`, text `#BA8230`.

### Checkboxes & Radio Knobs
- **Checkboxes:** 14px × 14px boxes with a subtle `2px` roundedness, dark background, `1px solid #2B3025`. Checked state displays a solid inner fill `#4B8F8C` with a central point.
- **Radio Buttons:** Styled as slightly rounded square selectors to preserve the system's geometric language.

### Cards & Chassis Panels
- Surface `#151B16` enclosed in `1px solid #2B3025` with subtle matching corner rounding.
- Panel headers feature a dedicated `32px` top title strip in `#1D241E` housing the module title in `Sora` `label-md` and status indicators flush to the right.

### Technical Data Displays & Vector Scopes
- Dedicated graticule overlay grids (`10px` and `50px` increments) rendered in `rgba(43, 48, 37, 0.4)`.
- Real-time telemetry vectors utilize `#4B8F8C` for current values and `#BA8230` for historical envelope or peak-hold traces.

---

## Brand Identity & Logo System (GEN LABS Nexus)

### 1. Logo Mark Philosophy
The official brand symbol for **GEN LABS** is the **GEN LABS Nexus**:
- **Geometry:** An isometric hexagonal test cell (*test chamber*) constructed from three precision-milled planar vector facets interlocking with 120° rotational symmetry and separated by 14px expansion channels.
- **The Tri-Axial Pillars:** The three facets represent the fundamental simulation loop:
  1. **Top Facet:** *Parameter Exploration* (Dynamic user variables and inputs).
  2. **Right Facet:** *Physics Engine & Simulation* (Deterministic mathematical equations).
  3. **Left Facet:** *Empirical Telemetry* (Real-time observation and sensor feedback).
- **Reaction Core:** The center hexagonal aperture houses a calibrated *Phosphor Sage* (`#4B8F8C`) sensor node, representing the dynamic equilibrium point of physical simulation.

### 2. Typography Lockup
- **Brand Wordmark:** `GEN·LABS` in **Sora** (Font Weight: 800 / Extrabold, tracking: -0.02em / -1.5px).
- **Separator:** Phosphor Sage middle dot (`·` / `#4B8F8C`) between `GEN` and `LABS`.
- **Telemetry Subtitle:** `UNIVERSAL SIMULATION PLATFORM` set in **Space Mono** (Font Weight: 700 / Bold, tracking: 0.2em / 4px, uppercase).

### 3. Master Brand Assets
All production assets are available in pure vector SVG (`viewBox="0 0 256 256"` for symbols, `viewBox="0 0 960 256"` for horizontal lockups) and multi-resolution web icon formats:
- **Master Symbol (Light Mode):** [`/public/gen-labs-symbol.svg`](file:///d:/GENLABS/apps/web/public/gen-labs-symbol.svg) (Deep Slate `#10150B` + Phosphor Sage `#4B8F8C`)
- **Master Symbol (Dark Mode / Reversed):** [`/public/gen-labs-symbol-white.svg`](file:///d:/GENLABS/apps/web/public/gen-labs-symbol-white.svg) (Off-White `#F4F6F4` + Phosphor Sage `#4B8F8C`)
- **Horizontal Lockup (Light):** [`/public/gen-labs-logo-horizontal.svg`](file:///d:/GENLABS/apps/web/public/gen-labs-logo-horizontal.svg)
- **Horizontal Lockup (Dark):** [`/public/gen-labs-logo-horizontal-dark.svg`](file:///d:/GENLABS/apps/web/public/gen-labs-logo-horizontal-dark.svg)
- **Favicon & Web Suite:**
  - Standard Browser Favicon: [`/public/favicon.ico`](file:///d:/GENLABS/apps/web/public/favicon.ico) & [`/public/favicon.svg`](file:///d:/GENLABS/apps/web/public/favicon.svg)
  - Touch Icon (iOS/Android): [`/public/apple-touch-icon.png`](file:///d:/GENLABS/apps/web/public/apple-touch-icon.png)
  - PWA Icons: [`/public/icon-192.png`](file:///d:/GENLABS/apps/web/public/icon-192.png), [`/public/icon-512.png`](file:///d:/GENLABS/apps/web/public/icon-512.png)
  - Web Manifest: [`/public/site.webmanifest`](file:///d:/GENLABS/apps/web/public/site.webmanifest)
  - OpenGraph Social Card (1200x630): [`/public/og-image.png`](file:///d:/GENLABS/apps/web/public/og-image.png)

### 4. Code Integration
The design system provides a first-class React component for instant, layout-shift-free rendering across light and dark modes:
```tsx
import { GenLabsLogo } from '@/components/ui/gen-labs-logo';

// In Header / Navigation
<GenLabsLogo variant="horizontal" size={26} />

// Icon only (Sidebar / Favicon context)
<GenLabsLogo variant="symbol" size={24} />

// Large hero or auth cards
<GenLabsLogo variant="symbol" size={44} />
```

### 5. Clear Space & Scale Rules
- **Clear Space:** Minimum clear space around the symbol is equal to $0.25 \times$ symbol height ($X/4$).
- **Minimum Digital Render Size:** 16 px (Favicon). The mark maintains 100% silhouette integrity at 16px.
- **Lockup Minimum Height:** 20 px for digital screens.
- **Anti-Slop Invariant:** Never substitute the GEN LABS Nexus with generic atom clip-art, educational mortarboards, or AI-generated gradients. The mark must remain pure vector geometry.