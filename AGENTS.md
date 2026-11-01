# GEN LABS — Global Agent Guidelines

## Design System & Anti-Slop Directive
All frontend code and simulation canvases in GEN LABS must strictly adhere to `.agents/rules/anti-slop-design.md` and `DESIGN (4).md`:

1. **Anti-Slop Invariants:**
   - NO AI dot matrix grids or floating decorative dots.
   - NO floating status pill badges or colored indicator dots inside canvas viewports. Canvas is strictly for apparatus, physical bodies, and vectors; telemetry/state belongs in panels outside canvas.
   - NO AI-purple/violet gradients or neon glow halos.
   - NO generic cartoon roundness. Radius system follows PRD v2.0: 8px compact controls/badges, 12px inputs/buttons, 16px cards/panels, 20px modals/learning decks, 24px hero containers, 9999px pills/avatars. Soft, approachable, modern, and professional.
   - Canvas backgrounds must use hairline orthogonal graticules or solid `#0C0E12` base ground, NEVER dot patterns.

2. **Color Palette (GEN LABS Precision Charcoal System):**
   - Ground & Canvas: Neutral Obsidian Charcoal (`#0C0E12`)
   - Surface & Cards: Precision Graphite (`#14171E`), Inset (`#0F1217`), Elevated (`#1B202A`)
   - Primary Accent: Desaturated Laboratory Sage (`#3E8E75`), Hover (`#4EAA8F`)
   - Structural: Deep Subdued Sage (`#1C332A`)
   - Telemetry & Success: Phosphor Sage Cyan (`#4B8F8C`)
   - Accent & Energy: Warm Ochre Gold (`#BA8230`)
   - Borders: Quiet Hairline Seam (`#222733`), Subtle (`#191D26`)
   - Text: Crisp Soft White (`#F1F5F9`), Muted Slate (`#94A3B8`), Dim (`#64748B`)

3. **Typography:**
   - Headings: Sora
   - Telemetry & Numerical Readouts: Space Mono (tabular numerals)
