# GEN LABS — Strict Anti-Slop Design & Canvas Architecture Rules
Reference: DESIGN (4).md & taste-design-v2

## 1. ABSOLUTE ANTI-SLOP MANDATES (ZERO TOLERANCE)
1. **NO AI Dot Grids:**
   - NEVER use dot matrix patterns, dotted SVG grids, dotted canvas backdrops, or `radial-gradient(circle, ...)`.
   - Gridlines must be dedicated hairline orthogonal rectilinear graticules (`10px` and `50px` increments) rendered in `rgba(43, 48, 37, 0.4)` or subtle hairline SVG lines, mimicking scientific oscilloscopes and laboratory test benches.
2. **NO AI-Purple / Neon Mesh Gradients:**
   - NEVER use AI-purple (`#8b5cf6`, `#6366f1`, `#a855f7`), indigo glow mesh, or neon violet halos.
   - The palette is strictly locked to the **GEN LABS** laboratory system:
     * Base Viewport Canvas Ground: `#0E1410` (Dark, recessed simulation plane)
     * Panel Elevation 01: `#151B16`
     * Panel Elevation 02: `#1D241E`
     * Dividing Seams & Hairline Reticles: `#2B3025`
     * Primary Structural Bedrock: `#1D4838` (Deep Pine Forest)
     * Secondary Instrumentation Telemetry: `#4B8F8C` (Phosphor Sage Cyan)
     * Tertiary Dynamic Energy: `#BA8230` (Warm Ochre Gold)
     * High-Contrast Text: `#E6ECE8` (Primary), `#8FA396` (Muted Telemetry)
3. **NO Floating Particle Dots, Status Badges, or Decorative AI Circles:**
   - Every geometric shape on a canvas must represent an authentic physical or mathematical entity (e.g. projectile ball, cart wheel, graph vertex, molecular atom, data point).
   - Zero random floating sparkles, ambient dot clouds, or decorative polygon clutter.
   - NEVER render floating status pill badges or colored circle indicator dots (`<circle ... r={4} />`) inside canvas viewports. All telemetry, state, and condition tags belong strictly in panels outside the canvas.
4. **Rounded Corners & Human Accessibility (PRD v2.0):**
   - Radius scale follows PRD v2.0: 8px compact controls/badges, 12px inputs/buttons, 16px cards/panels, 20px modals/learning decks, 24px hero containers, 9999px pills/avatars.
   - Avoid extreme sharp boxiness as well as cartoon pill over-rounding: clean, warm, approachable, polished, and educational.
5. **NO Skeuomorphic Ambient Drop Shadows or Blurry Halos:**
   - Eliminate heavy drop shadows and glowing blur gradients.
   - Depth is communicated purely through planar luminance tiering (`#0E1410` -> `#151B16` -> `#1D241E`) and crisp 1px `#2B3025` dividing seams.
6. **Monospaced Rigor for Telemetry:**
   - All dynamic variables, coordinates, units, and equations must use `Space Mono` (`font-mono`) with tabular numerals so values never wobble or fluctuate character width during 60 FPS animation.

## 2. CANVAS APPARATUS ARCHITECTURE
- Treat every simulation as a real laboratory bench:
  * Rigid apparatus frames, rails, rulers, and reference baselines.
  * Vector arrows with calibrated arrowheads and concise scalar tags (`F = 25 N`, `v = 4.2 m/s`).
  * Live status tags (`RUNNING`, `EQUILIBRIUM`, `DRIFT`) styled as rectangular telemetry chips with 2px left border indicators.
  * No lazy placeholders, no empty boxes, no generic AI cards.
