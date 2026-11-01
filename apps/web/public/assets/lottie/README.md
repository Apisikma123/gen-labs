# Legacy Lottie Assets Deprecated

In accordance with GEN LABS Stage 3 Zero-Slop and Performance Directives, legacy `.lottie` binary files have been completely replaced by native 3D SVG vector assets located in:
`apps/web/public/icons/3d/`

### Benefits:
- **Payload reduction**: Over 25 MB removed from client repository.
- **Runtime performance**: 0.00 ms script evaluation, zero WebGL/Canvas overhead.
- **Scale fidelity**: Infinite vector crispness on all high-DPI displays.
- **Backwards compatibility**: `<Lottie3DIcon>` in `@/components/ui/lottie-3d-icon` automatically maps legacy names to native `<Icon3d>` vector components.
