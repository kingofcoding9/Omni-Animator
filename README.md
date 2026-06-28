# Omni-Animator

An elegant, smooth, and high-fidelity 2D Vector Animation Creator. Create fluid vector animations with custom shape layers, keyframes, transitions, and export options, designed specifically for clean, responsive browser-based work.

## Features

- **Vector-Based Canvas Stage**: Scalable shapes (circles, squares, lines, rectangles, custom text, freeform drawing, local images).
- **Smooth Keyframe Interpolation**: Multi-layer timelines where property values (position, size, colors, scale, opacity, rotation) are interpolated cleanly between keyframes using custom easing options (linear, ease-in, ease-out, ease-in-out).
- **Onion Skinning**: Transparent outlines of adjacent frames to align motions with high precision.
- **Durable Local Persistence**: Automated debounce saving to browser local storage to prevent work loss, plus full project JSON import and export capability.
- **Versatile Multi-Format Exports**:
  - Export single frames as clean PNG images.
  - Export full animations as high-quality PNG Sprite Sheets.
  - Export self-contained, offline-playable interactive HTML animations.
  - Export crisp vector SVGs.
- **Polished Cinematic Theme**: Built with a dark, high-contrast, professional cyan color palette and clean responsive structures.

## Getting Started

### Installation

First, install the package dependencies:

```bash
npm install
```

### Running the Application (Development)

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Compile and build the static assets:

```bash
npm run build
```

The production-ready assets will be created in the `dist` directory.

## Licensing

Owned by Omni-Science. Created by king_of_coding.
