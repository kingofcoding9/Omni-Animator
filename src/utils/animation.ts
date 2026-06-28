/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layer, Keyframe, Point } from '../types';

export const DEFAULT_PROPERTIES: Omit<Keyframe, 'frame'> = {
  x: 400,
  y: 250,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
  color: '#3b82f6',
  strokeColor: '#10b981',
  strokeWidth: 2,
  width: 100,
  height: 100,
  fontSize: 28,
  easing: 'linear',
};

export function applyEasing(t: number, easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'): number {
  switch (easing) {
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return t * (2 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'linear':
    default:
      return t;
  }
}

export function parseHex(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { r: 59, g: 130, b: 246 }; // Default fallback blue
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function toHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    '#' +
    ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b))
      .toString(16)
      .slice(1)
  );
}

export function interpolateColor(color1: string, color2: string, t: number): string {
  try {
    const rgb1 = parseHex(color1);
    const rgb2 = parseHex(color2);
    const r = rgb1.r + (rgb2.r - rgb1.r) * t;
    const g = rgb1.g + (rgb2.g - rgb1.g) * t;
    const b = rgb1.b + (rgb2.b - rgb1.b) * t;
    return toHex(r, g, b);
  } catch (e) {
    return color1;
  }
}

export function getInterpolatedProperties(layer: Layer, frame: number): Omit<Keyframe, 'frame'> {
  const sorted = [...layer.keyframes].sort((a, b) => a.frame - b.frame);
  
  if (sorted.length === 0) {
    return { ...DEFAULT_PROPERTIES };
  }
  
  if (frame <= sorted[0].frame) {
    return { ...DEFAULT_PROPERTIES, ...sorted[0] };
  }
  
  if (frame >= sorted[sorted.length - 1].frame) {
    return { ...DEFAULT_PROPERTIES, ...sorted[sorted.length - 1] };
  }
  
  // Find interpolation interval
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].frame <= frame && sorted[i + 1].frame >= frame) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }
  
  if (prev.frame === next.frame) {
    return { ...DEFAULT_PROPERTIES, ...prev };
  }
  
  const t = (frame - prev.frame) / (next.frame - prev.frame);
  const tEased = applyEasing(t, prev.easing || 'linear');
  
  return {
    x: prev.x + (next.x - prev.x) * tEased,
    y: prev.y + (next.y - prev.y) * tEased,
    scaleX: prev.scaleX + (next.scaleX - prev.scaleX) * tEased,
    scaleY: prev.scaleY + (next.scaleY - prev.scaleY) * tEased,
    rotation: prev.rotation + (next.rotation - prev.rotation) * tEased,
    opacity: prev.opacity + (next.opacity - prev.opacity) * tEased,
    width: prev.width + (next.width - prev.width) * tEased,
    height: prev.height + (next.height - prev.height) * tEased,
    fontSize: prev.fontSize + (next.fontSize - prev.fontSize) * tEased,
    strokeWidth: prev.strokeWidth + (next.strokeWidth - prev.strokeWidth) * tEased,
    color: interpolateColor(prev.color, next.color, tEased),
    strokeColor: interpolateColor(prev.strokeColor, next.strokeColor, tEased),
    easing: prev.easing,
  };
}
