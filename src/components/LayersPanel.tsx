/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit2, 
  Check, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Layer } from '../types';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRenameLayer: (id: string, newName: string) => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

export default function LayersPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRenameLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayer,
}: LayersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');

  const startEditing = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(layer.id);
    setTempName(layer.name);
  };

  const saveRename = (id: string) => {
    if (tempName.trim()) {
      onRenameLayer(id, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div id="layers-panel" className="w-full lg:w-72 bg-slate-900/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col p-4 gap-4 shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider">Layers Stack</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
          {layers.length} {layers.length === 1 ? 'Layer' : 'Layers'}
        </span>
      </div>

      {layers.length === 0 ? (
        <div id="layers-empty" className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-center">
          <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-sans">No layers yet</p>
          <p className="text-[10px] text-slate-600 font-mono mt-1">Add a shape to begin animating</p>
        </div>
      ) : (
        <div id="layers-list" className="flex-1 space-y-2 overflow-y-auto max-h-[300px] lg:max-h-none scrollbar-thin scrollbar-thumb-slate-850">
          {/* Note: render layers in reverse so the top-most layer in the array is at the top of the list stack visually */}
          {[...layers].reverse().map((layer, idx) => {
            // Calculate absolute index in the original array
            const originalIndex = layers.length - 1 - idx;
            const isActive = layer.id === activeLayerId;

            return (
              <div
                key={layer.id}
                id={`layer-row-${layer.id}`}
                onClick={() => onSelectLayer(layer.id)}
                className={`group flex flex-col p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-850 to-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                    : 'bg-slate-950/60 hover:bg-slate-850/40 border-slate-850'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Name section */}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    {editingId === layer.id ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          id={`rename-input-${layer.id}`}
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(layer.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full bg-slate-900 border border-cyan-500 text-xs px-1.5 py-0.5 rounded text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          id={`save-rename-${layer.id}`}
                          onClick={() => saveRename(layer.id)}
                          className="p-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-slate-600">
                          #{originalIndex}
                        </span>
                        <span className="text-xs font-sans font-semibold text-slate-200 truncate">
                          {layer.name}
                        </span>
                        <button
                          id={`edit-layer-name-${layer.id}`}
                          onClick={(e) => startEditing(layer, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ordering arrows */}
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`move-up-${layer.id}`}
                      disabled={originalIndex === layers.length - 1}
                      onClick={() => onMoveLayer(layer.id, 'up')}
                      className="p-1 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-850 text-slate-400 hover:text-cyan-400 border border-slate-750 cursor-pointer"
                      title="Move Up (Bring Forward)"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      id={`move-down-${layer.id}`}
                      disabled={originalIndex === 0}
                      onClick={() => onMoveLayer(layer.id, 'down')}
                      className="p-1 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-850 text-slate-400 hover:text-cyan-400 border border-slate-750 cursor-pointer"
                      title="Move Down (Send Backward)"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Layer Quick Controls */}
                <div 
                  className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900/60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    {/* Hide/Show */}
                    <button
                      id={`toggle-vis-${layer.id}`}
                      onClick={() => onToggleVisibility(layer.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        layer.visible 
                          ? 'bg-slate-850 hover:bg-slate-800 text-cyan-400' 
                          : 'bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/30'
                      }`}
                      title={layer.visible ? "Hide Layer" : "Show Layer"}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Lock/Unlock */}
                    <button
                      id={`toggle-lock-${layer.id}`}
                      onClick={() => onToggleLock(layer.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        layer.locked 
                          ? 'bg-amber-950/20 text-amber-500 border border-amber-900/40' 
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                    >
                      {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Duplicate */}
                    <button
                      id={`dup-layer-${layer.id}`}
                      onClick={() => onDuplicateLayer(layer.id)}
                      className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      title="Duplicate Layer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      id={`del-layer-${layer.id}`}
                      onClick={() => onDeleteLayer(layer.id)}
                      className="p-1 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 text-red-400 cursor-pointer"
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
