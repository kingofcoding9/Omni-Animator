import React, { useState, useRef } from 'react';
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
  Sparkles,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash
} from 'lucide-react';
import { Layer, ProjectAsset } from '../types';

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

  // Assets support
  assets: ProjectAsset[];
  onAddAsset: (asset: Omit<ProjectAsset, 'id'>) => void;
  onDeleteAsset: (id: string) => void;
  onAddImageLayerFromAsset: (assetId: string) => void;
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
  assets = [],
  onAddAsset,
  onDeleteAsset,
  onAddImageLayerFromAsset,
}: LayersPanelProps) {
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // HTML5 Drag and Drop & file upload handlers
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          onAddAsset({
            name: file.name,
            dataUrl,
            type: file.type,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  return (
    <div id="layers-panel" className="w-full lg:w-72 bg-slate-900/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col p-4 gap-4 shrink-0 overflow-y-auto min-h-0">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-850 p-1 bg-slate-950/45 rounded-xl">
        <button
          id="tab-layers-btn"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-slate-800 text-white border border-slate-700/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Layers</span>
        </button>
        <button
          id="tab-assets-btn"
          onClick={() => setActiveTab('assets')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-slate-800 text-white border border-slate-700/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
          <span>Assets</span>
        </button>
      </div>

      {activeTab === 'layers' ? (
        <>
          {/* Layers Stack View */}
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Layers Stack</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
              {layers.length} {layers.length === 1 ? 'Layer' : 'Layers'}
            </span>
          </div>

          {layers.length === 0 ? (
            <div id="layers-empty" className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-center">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
              <p className="text-xs text-slate-400 font-sans">No layers yet</p>
              <p className="text-[10px] text-slate-600 font-mono mt-1">Add a shape to begin animating</p>
            </div>
          ) : (
            <div id="layers-list" className="flex-1 space-y-2 overflow-y-auto max-h-[350px] lg:max-h-none scrollbar-thin scrollbar-thumb-slate-850">
              {[...layers].reverse().map((layer, idx) => {
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

                      {/* Ordering Arrows */}
                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`move-up-${layer.id}`}
                          disabled={originalIndex === layers.length - 1}
                          onClick={() => onMoveLayer(layer.id, 'up')}
                          className="p-1 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-850 text-slate-400 hover:text-cyan-400 border border-slate-750 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          id={`move-down-${layer.id}`}
                          disabled={originalIndex === 0}
                          onClick={() => onMoveLayer(layer.id, 'down')}
                          className="p-1 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-850 text-slate-400 hover:text-cyan-400 border border-slate-750 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Quick controls */}
                    <div 
                      className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          id={`toggle-vis-${layer.id}`}
                          onClick={() => onToggleVisibility(layer.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            layer.visible 
                              ? 'bg-slate-850 hover:bg-slate-800 text-cyan-400' 
                              : 'bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/30'
                          }`}
                          title={layer.visible ? "Hide" : "Show"}
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          id={`toggle-lock-${layer.id}`}
                          onClick={() => onToggleLock(layer.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            layer.locked 
                              ? 'bg-amber-950/20 text-amber-500 border border-amber-900/40' 
                              : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title={layer.locked ? "Unlock" : "Lock"}
                        >
                          {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          id={`dup-layer-${layer.id}`}
                          onClick={() => onDuplicateLayer(layer.id)}
                          className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`del-layer-${layer.id}`}
                          onClick={() => onDeleteLayer(layer.id)}
                          className="p-1 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 text-red-400 cursor-pointer"
                          title="Delete"
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
        </>
      ) : (
        <>
          {/* Assets Tab View */}
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Asset Library</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
              {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            id="asset-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-150 ${
              isDraggingOver
                ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300'
                : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-700 text-slate-400'
            }`}
          >
            <Upload className="w-6 h-6 mb-1.5 text-cyan-400" />
            <span className="text-xs font-sans font-semibold">Drag &amp; Drop Image</span>
            <span className="text-[10px] font-mono text-slate-600 mt-0.5">Or click to select files</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          {/* Scrollable Assets List */}
          {assets.length === 0 ? (
            <div id="assets-empty-msg" className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-600">
              <p className="text-xs font-sans font-medium">No assets uploaded yet</p>
              <p className="text-[10px] font-mono mt-0.5">Upload images to place them as layers on stage</p>
            </div>
          ) : (
            <div id="assets-list" className="flex-1 space-y-2 overflow-y-auto max-h-[350px] lg:max-h-none scrollbar-thin scrollbar-thumb-slate-850">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  id={`asset-item-${asset.id}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-850/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-sans font-semibold text-slate-200 truncate max-w-[120px]" title={asset.name}>
                        {asset.name}
                      </p>
                      <p className="text-[9px] font-mono text-slate-600 uppercase">
                        {asset.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id={`use-asset-${asset.id}`}
                      onClick={() => onAddImageLayerFromAsset(asset.id)}
                      className="p-1 px-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-sans font-bold flex items-center gap-0.5 cursor-pointer"
                      title="Insert as Image Layer"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                    <button
                      id={`delete-asset-${asset.id}`}
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1.5 rounded bg-red-950/20 hover:bg-red-950/50 text-red-400 cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
