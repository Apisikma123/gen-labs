# GEN LABS — 3D Lottie Asset Credits & Licensing

This document details all 3D animated assets integrated into the GEN LABS production application. All assets have been discovered from LottieFiles, evaluated for dimensional craftsmanship, verified for license compliance, and stored locally to eliminate runtime external CDN dependencies.

## Asset Registry

| Icon / Asset | Role in GEN LABS | Original Title | Creator / Author | Source Page | License |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`cube-3d.lottie`** | Simulation Apparatus & 3D Spatial Matrix Anchor | Geometric Cube 3D Animation | Irfan M | [LottieFiles Page](https://lottiefiles.com/free-animation/geometric-cube-3d-animation-qjKMpconTL) | Lottie Simple License |
| **`home-3d.lottie`** | Primary Navigation Portal & Home Anchor | Home 3D Icon Animation | Irfan M | [LottieFiles Page](https://lottiefiles.com/free-animation/home-3d-icon-SPYR7Uk5bN) | Lottie Simple License |
| **`coin-3d.lottie`** | AI Quota, Compute Credits & Simulation Energy Tokens | 3D Money & Credit Token Animation | Irfan M | [LottieFiles Page](https://lottiefiles.com/free-animation/3d-money-icon-H0SaumE2wd) | Lottie Simple License |
| **`check-3d.lottie`** | Verification, Experiment Completed, Success & Validation | 3D Task Done & Verified Icon Animation | Irfan M | [LottieFiles Page](https://lottiefiles.com/free-animation/3d-task-done-icon-MCaErbyAO0) | Lottie Simple License |
| **`clipboard-3d.lottie`** | Lab Notebook, Module Specification & Parameter Sheet | 3D Clipboard & Documentation Icon Animation | Irfan M | [LottieFiles Page](https://lottiefiles.com/free-animation/3d-clipboard-icon-axg2lttM7Z) | Lottie Simple License |
| **`mic-3d.lottie`** | GEN LABS AI Audio Dialogue & Voice Prompting | Microphone 3D Audio Icon Animation | Irfan M | [LottieFiles Page](https://lottiefiles.com/free-animation/microphone-3d-icon-SjTwuxtgih) | Lottie Simple License |
| **`ai-robot-3d.lottie`** | Tanya AI & GEN LABS AI Identity | AI Robot Dimensional Assistant Animation | LottieFiles Community | [LottieFiles Page](https://lottiefiles.com/free-animation/ai-robot-teaAovRePh) | Lottie Simple License |
| **`atom-3d.lottie`** | Physics, Atomic Structure & Molecular Simulation Discipline | Atomic Structure & Quantum Orbit Animation | LottieFiles Community | [LottieFiles Page](https://lottiefiles.com/free-animation/atom-gvbsVPgMeA) | Lottie Simple License |
| **`book-3d.lottie`** | Curriculum, Learning Deck & Scientific Literature | Books Stack & Knowledge Base Animation | LottieFiles Community | [LottieFiles Page](https://lottiefiles.com/free-animation/books-stack-MixplAvd6D) | Lottie Simple License |
| **`empty-state-3d.lottie`** | Zero Search Results, Empty Apparatus State & Clean Canvas | Empty Box & Discovery Void Animation | LottieFiles Community | [LottieFiles Page](https://lottiefiles.com/free-animation/empty-box-empty-search-QAxvG5ZlLZ) | Lottie Simple License |
| **`settings-3d.lottie`** | Simulation Calibration, Environmental Controls & System Parameters | Dimensional Mechanical Gears & Calibration Animation | LottieFiles Community | [LottieFiles Page](https://lottiefiles.com/free-animation/gears-or-settings-8GHlpPkBQM) | Lottie Simple License |
| **`search-3d.lottie`** | Global Apparatus & Module Discovery Lens | Searching & Discovery Lens Animation | LottieFiles Community | [LottieFiles Page](https://lottiefiles.com/free-animation/searching-4qnihLJD2p) | Lottie Simple License |

## License Terms: Lottie Simple License
All assets above are distributed under the **Lottie Simple License** (or compatible permissive community license).
Under this license:
- Assets are free to use in commercial and non-commercial digital products.
- No royalties or recurring license fees are required.
- Attribution is preserved in this credits manifest.
- Assets are bundled and served directly from the local `/public/assets/lottie/` distribution directory.

## Design Integration Guidelines (DESIGN (4).md & PRD v2.0)
- **Palette Alignment**: Dominant structural hues align with Deep Pine (`#1D4838`), Phosphor Sage Cyan (`#4B8F8C`), and Warm Ochre Gold (`#BA8230`) on Obsidian Pine Canvas (`#0E1410`).
- **Performance & Reduced Motion**: Rendered via `Lottie3DIcon` component using `@lottiefiles/dotlottie-react`, honoring user `prefers-reduced-motion` preferences, viewport visibility pauses, and micro-hover triggering.
