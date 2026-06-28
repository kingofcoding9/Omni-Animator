/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Settings, 
  Trash, 
  Plus, 
  Compass, 
  Maximize, 
  Sliders, 
  Palette, 
  Type, 
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import { Layer, Keyframe } from '../types';
import { DEFAULT_PROPERTIES } from '../utils/animation';

interface PropertiesPanelProps {
  activeLayer: Layer | null;
  currentFrame: number;
  interpolatedProperties: Omit<Keyframe, 'frame'>;
  onUpdateKeyframeProperty: (propertyName: keyof Keyframe | 'text' | 'imageUrl', value: any) => void;
  onInsertKeyframe: () => void;
  onRemoveKeyframe: () => void;
}

export default function PropertiesPanel({
  activeLayer,
  currentFrame,
  interpolatedProperties,
  onUpdateKeyframeProperty,
  onInsertKeyframe,
  onRemoveKeyframe,
}: PropertiesPanelProps) {
  if (!activeLayer) {
    return (
      <div id="properties-panel-empty" className="w-full lg:w-80 bg-slate-900/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col items-center justify-center text-center gap-2 shrink-0">
        <Sliders className="w-8 h-8 text-cyan-400 animate-pulse" />
        <h3 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Properties</h3>
        <p className="text-[11px] text-slate-500 font-sans max-w-[200px]">
          Select any element on the stage or layers list to customize its attributes and timeline states.
        </p>
      </div>
    );
  }

  // Check if a keyframe exists at the exact current frame
  const existingKeyframe = activeLayer.keyframes.find(kf => kf.frame === currentFrame);
  const hasKeyframe = !!existingKeyframe;

  const handlePropertyChange = (propertyName: keyof Keyframe | 'text' | 'imageUrl', value: any) => {
    onUpdateKeyframeProperty(propertyName, value);
  };

  return (
    <div id="properties-panel" className="w-full lg:w-80 bg-slate-900/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col gap-5 shrink-0 overflow-y-auto select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider">Properties</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
          Layer: {activeLayer.type.toUpperCase()}
        </span>
      </div>

      {/* Keyframe Presence Indicator */}
      <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
        hasKeyframe 
          ? 'bg-emerald-950/20 border-emerald-500/35 text-emerald-300' 
          : 'bg-slate-950 border-slate-850 text-slate-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-sans font-bold">
            <Activity className={`w-4 h-4 ${hasKeyframe ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Frame {currentFrame} State</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
            hasKeyframe ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {hasKeyframe ? 'KEYFRAME' : 'TWEENED'}
          </span>
        </div>
        
        <p className="text-[10px] font-sans leading-relaxed">
          {hasKeyframe 
            ? 'Any property changes below will save directly to this specific keyframe.' 
            : 'Changes will automatically create a new keyframe here, capturing the active state.'}
        </p>

        <div className="flex gap-2 mt-1">
          {hasKeyframe ? (
            <button
              id="remove-keyframe-btn"
              onClick={onRemoveKeyframe}
              className="w-full py-1.5 px-2.5 rounded bg-red-950/45 hover:bg-red-950 text-red-300 text-xs font-sans font-bold border border-red-900/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash className="w-3.5 h-3.5" />
              Remove Keyframe
            </button>
          ) : (
            <button
              id="insert-keyframe-btn"
              onClick={onInsertKeyframe}
              className="w-full py-1.5 px-2.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-sans font-bold transition-all shadow-sm shadow-teal-500/10 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Insert Keyframe
            </button>
          )}
        </div>
      </div>

      {/* Inputs Scrollable Area */}
      <div className="space-y-4 pr-1">

        {/* 1. Spatial Coordinates */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Position</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-sans font-medium text-slate-400">Position X (px)</label>
              <input
                id="prop-x-input"
                type="number"
                value={Math.round(interpolatedProperties.x)}
                onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-sky-500 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-sans font-medium text-slate-400">Position Y (px)</label>
              <input
                id="prop-y-input"
                type="number"
                value={Math.round(interpolatedProperties.y)}
                onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-sky-500 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Scale & Sizing */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <Maximize className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scale &amp; Dimensions</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-sans font-medium text-slate-400">Width (px)</label>
              <input
                id="prop-width-input"
                type="number"
                min="2"
                max="2000"
                value={Math.round(interpolatedProperties.width)}
                onChange={(e) => handlePropertyChange('width', Math.max(2, parseFloat(e.target.value) || 2))}
                className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-sans font-medium text-slate-400">Height (px)</label>
              <input
                id="prop-height-input"
                type="number"
                min="2"
                max="2000"
                value={Math.round(interpolatedProperties.height)}
                onChange={(e) => handlePropertyChange('height', Math.max(2, parseFloat(e.target.value) || 2))}
                className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-sans font-medium text-slate-400">Scale X</label>
              <input
                id="prop-scaleX-input"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={interpolatedProperties.scaleX}
                onChange={(e) => handlePropertyChange('scaleX', parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-sans font-medium text-slate-400">Scale Y</label>
              <input
                id="prop-scaleY-input"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={interpolatedProperties.scaleY}
                onChange={(e) => handlePropertyChange('scaleY', parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Rotation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-sans font-medium text-slate-400">Rotation (deg)</label>
            <span className="text-xs text-white font-mono">{Math.round(interpolatedProperties.rotation)}°</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="prop-rotation-slider"
              type="range"
              min="-360"
              max="360"
              value={Math.round(interpolatedProperties.rotation)}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
              className="flex-1 accent-teal-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
            />
            <input
              id="prop-rotation-input"
              type="number"
              value={Math.round(interpolatedProperties.rotation)}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value) || 0)}
              className="w-16 bg-slate-950 border border-slate-850 text-xs text-white rounded px-1.5 py-1 text-center focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Opacity */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-sans font-medium text-slate-400">Opacity (%)</label>
            <span className="text-xs text-white font-mono">{Math.round(interpolatedProperties.opacity * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="prop-opacity-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(interpolatedProperties.opacity * 100)}
              onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value) / 100)}
              className="flex-1 accent-teal-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
            />
            <input
              id="prop-opacity-input"
              type="number"
              min="0"
              max="100"
              value={Math.round(interpolatedProperties.opacity * 100)}
              onChange={(e) => handlePropertyChange('opacity', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) / 100)}
              className="w-16 bg-slate-950 border border-slate-850 text-xs text-white rounded px-1.5 py-1 text-center focus:outline-none"
            />
          </div>
        </div>

        {/* 5. Custom shape specific settings */}
        {activeLayer.type === 'text' && (
          <div className="space-y-3 p-3 rounded-xl bg-slate-950/50 border border-slate-850">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span>Text Settings</span>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans font-medium text-slate-400">String Text</label>
              {/* Note: text string itself is stored as static/layer-level property to preserve content across frames, but we allow editing it here */}
              <input
                id="prop-text-string-input"
                type="text"
                value={activeLayer.text || 'Text'}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-sans font-medium text-slate-400">Font Size (px)</label>
                <span className="text-xs text-white font-mono">{Math.round(interpolatedProperties.fontSize)}px</span>
              </div>
              <input
                id="prop-fontSize-slider"
                type="range"
                min="8"
                max="120"
                value={interpolatedProperties.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-sans font-medium text-slate-400">Font Weight</label>
                <select
                  id="prop-fontWeight-select"
                  value={interpolatedProperties.fontWeight || 'bold'}
                  onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2 py-1.5 focus:outline-none font-sans"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="bold">Bold</option>
                  <option value="black">Black</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-sans font-medium text-slate-400">Alignment</label>
                <select
                  id="prop-textAlign-select"
                  value={interpolatedProperties.textAlign || 'center'}
                  onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2 py-1.5 focus:outline-none font-sans"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {(activeLayer.type === 'square' || activeLayer.type === 'rectangle') && (
          <div className="space-y-1 p-3 rounded-xl bg-slate-950/50 border border-slate-850">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-sans font-medium text-slate-400">Corner Rounding (px)</label>
              <span className="text-xs text-white font-mono">{Math.round(interpolatedProperties.borderRadius || 0)}px</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="prop-borderRadius-slider"
                type="range"
                min="0"
                max="100"
                value={interpolatedProperties.borderRadius || 0}
                onChange={(e) => handlePropertyChange('borderRadius', parseInt(e.target.value))}
                className="flex-1 accent-teal-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
              <input
                id="prop-borderRadius-input"
                type="number"
                min="0"
                max="100"
                value={Math.round(interpolatedProperties.borderRadius || 0)}
                onChange={(e) => handlePropertyChange('borderRadius', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 bg-slate-950 border border-slate-850 text-xs text-white rounded px-1.5 py-1 text-center focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeLayer.type === 'image' && (
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/50 border border-slate-850">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
              <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Image</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">Provide an image address starting with https or select an uploaded asset ID:</p>
            <input
              id="prop-imageUrl-input"
              type="text"
              value={activeLayer.imageUrl || ''}
              placeholder="https://example.com/sprite.png"
              onChange={(e) => handlePropertyChange('imageUrl', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-[11px] text-slate-200 rounded px-2 py-1.5 focus:outline-none font-mono"
            />
          </div>
        )}

        {/* 6. Coloring and Stroke Styling */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Colors &amp; Stroke</span>
          </div>

          {activeLayer.type !== 'line' && activeLayer.type !== 'freeform' && (
            <div className="flex items-center justify-between gap-3 bg-slate-950/40 p-2 rounded-lg border border-slate-850/60">
              <span className="text-[11px] font-sans text-slate-400">Fill Color</span>
              <div className="flex items-center gap-1.5">
                <input
                  id="prop-color-input"
                  type="text"
                  value={interpolatedProperties.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="w-20 bg-slate-950 border border-slate-850 text-xs text-white rounded px-1 py-0.5 font-mono text-center focus:outline-none"
                />
                <input
                  id="prop-color-picker"
                  type="color"
                  value={interpolatedProperties.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent overflow-hidden"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 bg-slate-950/40 p-2 rounded-lg border border-slate-850/60">
            <span className="text-[11px] font-sans text-slate-400">Stroke Color</span>
            <div className="flex items-center gap-1.5">
              <input
                id="prop-strokeColor-input"
                type="text"
                value={interpolatedProperties.strokeColor}
                onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                className="w-20 bg-slate-950 border border-slate-850 text-xs text-white rounded px-1 py-0.5 font-mono text-center focus:outline-none"
              />
              <input
                id="prop-strokeColor-picker"
                type="color"
                value={interpolatedProperties.strokeColor}
                onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent overflow-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-sans font-medium text-slate-400">Stroke Thickness (px)</label>
              <span className="text-xs text-white font-mono">{Math.round(interpolatedProperties.strokeWidth)}px</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="prop-strokeWidth-slider"
                type="range"
                min="0"
                max="24"
                value={interpolatedProperties.strokeWidth}
                onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                className="flex-1 accent-teal-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
              <input
                id="prop-strokeWidth-input"
                type="number"
                min="0"
                max="24"
                value={interpolatedProperties.strokeWidth}
                onChange={(e) => handlePropertyChange('strokeWidth', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 bg-slate-950 border border-slate-850 text-xs text-white rounded px-1 py-0.5 text-center focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 7. Keyframe Easing Setting */}
        {hasKeyframe && (
          <div className="space-y-1.5 pt-2 border-t border-slate-850">
            <label className="text-[10px] font-sans font-medium text-slate-400 block">
              Transition Easing to Next Keyframe
            </label>
            <select
              id="prop-easing-select"
              value={existingKeyframe.easing || 'linear'}
              onChange={(e) => handlePropertyChange('easing', e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none font-sans"
            >
              <option value="linear">Linear (Constant speed)</option>
              <option value="ease-in">Ease In (Accelerating)</option>
              <option value="ease-out">Ease Out (Decelerating)</option>
              <option value="ease-in-out">Ease In-Out (Smooth start/end)</option>
            </select>
          </div>
        )}

      </div>
    </div>
  );
}
