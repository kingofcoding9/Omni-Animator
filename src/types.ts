/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ShapeType = 'circle' | 'square' | 'rectangle' | 'line' | 'text' | 'image' | 'freeform';

export interface Point {
  x: number;
  y: number;
}

export interface Keyframe {
  frame: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees
  opacity: number;  // 0 to 1
  color: string;    // hex format (e.g. #3b82f6)
  strokeColor: string;
  strokeWidth: number;
  width: number;
  height: number;
  fontSize: number; // for text
  fontWeight?: string; // 'normal' | 'bold' | '300' | '500' | '700' etc
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number; // for rectangle corner rounding
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface Layer {
  id: string;
  name: string;
  type: ShapeType;
  visible: boolean;
  locked: boolean;
  text?: string;        // for text shapes
  imageUrl?: string;    // for image shapes (URL or asset ID reference or data URL)
  freeformPoints?: Point[]; // for freeform drawing
  freeformSmoothing?: boolean; // smoothing enabled
  keyframes: Keyframe[]; // sorted by frame ascending
}

export interface ProjectAsset {
  id: string;
  name: string;
  dataUrl: string; // Base64 data URI or Object URL
  type: string;
}

export interface Project {
  id: string;
  schemaVersion: number;
  name: string;
  fps: number;
  duration: number; // in seconds
  width: number;    // stage width in px
  height: number;   // stage height in px
  backgroundColor: string; // CSS background color (e.g. #020617)
  layers: Layer[];
  assets: ProjectAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryState {
  past: Project[];
  present: Project;
  future: Project[];
}

