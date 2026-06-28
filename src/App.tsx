/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  HelpCircle, 
  FileJson, 
  Image as ImageIcon, 
  Grid, 
  Share2,
  Trash2,
  FolderOpen,
  Info,
  Shield,
  Clock,
  Settings as SettingsIcon,
  RefreshCw,
  Sparkles,
  FilePlus
} from 'lucide-react';

import { ShapeType, Point, Keyframe, Layer, Project, ProjectAsset } from './types';
import { getInterpolatedProperties, DEFAULT_PROPERTIES } from './utils/animation';

// Custom sub-components
import UserGuide from './components/UserGuide';
import ToolPanel, { BrushSettings } from './components/ToolPanel';
import LayersPanel from './components/LayersPanel';
import PropertiesPanel from './components/PropertiesPanel';
import AnimationStage from './components/AnimationStage';
import Timeline from './components/Timeline';

import { INITIAL_PROJECT } from './data/defaultProject';
import { animatorReducer, initialAnimatorState } from './state/animatorReducer';
import { validateAndMigrateProject } from './utils/projectValidation';
import { exportProjectToJson } from './export/exportJson';
import { exportFrameToPng } from './export/exportPng';
import { exportAnimationToSpriteSheet } from './export/exportSpriteSheet';
import { exportPlayableHtml } from './export/exportPlayableHtml';


export default function App() {
  const [state, dispatch] = useReducer(animatorReducer, INITIAL_PROJECT, initialAnimatorState);
  const {
    project,
    activeLayerId,
    currentFrame,
    onionSkinEnabled,
    gridSnap,
    activeTool,
    isGuideOpen,
    isPlaying,
    past,
    future
  } = state;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    size: 4,
    color: '#f43f5e',
    smoothing: true
  });
  const [showRecovery, setShowRecovery] = useState<boolean>(false);
  const [savedProjectData, setSavedProjectData] = useState<Project | null>(null);

  // Autosave
  useEffect(() => {
    if (project.layers.length > 0 || project.assets.length > 0) {
      localStorage.setItem('omni_animator_autosave', JSON.stringify(project));
    }
  }, [project]);

  // Recovery check
  useEffect(() => {
    const saved = localStorage.getItem('omni_animator_autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.layers?.length > 0 || parsed.assets?.length > 0)) {
          setSavedProjectData(parsed);
          setShowRecovery(true);
        }
      } catch (e) {
        // invalid
      }
    }
  }, []);

  const handleRecover = () => {
    if (savedProjectData) {
      dispatch({ type: 'IMPORT_PROJECT', payload: savedProjectData });
    }
    setShowRecovery(false);
  };

  const handleDiscardRecovery = () => {
    localStorage.removeItem('omni_animator_autosave');
    setShowRecovery(false);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      const isMac = navigator.userAgent.toLowerCase().includes('mac');
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }
      if (cmdOrCtrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }

      // Nudging
      if (activeLayerId) {
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -1;
        else if (e.key === 'ArrowDown') dy = 1;
        else if (e.key === 'ArrowLeft') dx = -1;
        else if (e.key === 'ArrowRight') dx = 1;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          const layer = project.layers.find(l => l.id === activeLayerId);
          if (!layer || layer.locked) return;
          
          // Use exact interpolated props or keyframe props
          const currentProps = layer.keyframes.find(k => k.frame === currentFrame) || layer.keyframes[0];
          const step = e.shiftKey ? 10 : 1;
          
          // Use dispatch directly to ensure we can capture history properly if needed
          // Or just update property without pushing history every single nudge frame,
          // but we can just let it push for simplicity or not.
          handleUpdateLayerProperty(activeLayerId, 'x', currentProps.x + dx * step, false);
          handleUpdateLayerProperty(activeLayerId, 'y', currentProps.y + dy * step, false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLayerId, project, currentFrame]);

  // Trigger guide open on first visit
  useEffect(() => {
    dispatch({ type: 'SET_GUIDE_OPEN', payload: true });
  }, []);

  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleRedo = () => dispatch({ type: 'REDO' });

  const handleAddShape = (type: ShapeType) => {
    dispatch({
      type: 'ADD_LAYER',
      payload: { type, defaultProperties: {}, currentFrame }
    });
  };

  const handleAddFreeformLayer = (points: Point[], center: Point) => {
    dispatch({
      type: 'ADD_FREEFORM_LAYER',
      payload: { 
        points, 
        center, 
        currentFrame,
        strokeColor: brushSettings.color,
        strokeWidth: brushSettings.size,
        smoothing: brushSettings.smoothing
      }
    });
  };

  const handleUpdateLayerProperty = (layerId: string, property: keyof Keyframe, value: any, pushToHistory = false) => {
    dispatch({
      type: 'UPDATE_LAYER_PROPERTY',
      payload: { layerId, property, value, currentFrame, pushToHistory }
    });
  };

  const handleUpdateKeyframeProperty = (property: keyof Keyframe, value: any) => {
    if (!activeLayerId) return;
    handleUpdateLayerProperty(activeLayerId, property, value, true);
  };

  const handleInsertKeyframe = () => {
    if (!activeLayerId) return;
    dispatch({
      type: 'INSERT_KEYFRAME',
      payload: { layerId: activeLayerId, currentFrame }
    });
  };

  const handleRemoveKeyframe = () => {
    if (!activeLayerId) return;
    const layer = project.layers.find(l => l.id === activeLayerId);
    if (!layer) return;

    if (layer.keyframes.length <= 1) {
      alert("An object must have at least one keyframe in its timeline.");
      return;
    }

    dispatch({
      type: 'REMOVE_KEYFRAME',
      payload: { layerId: activeLayerId, currentFrame }
    });
  };

  const handleRemoveKeyframeAt = (layerId: string, frame: number) => {
    const layer = project.layers.find(l => l.id === layerId);
    if (!layer) return;

    if (layer.keyframes.length <= 1) {
      alert("An object must have at least one keyframe in its timeline.");
      return;
    }

    dispatch({
      type: 'REMOVE_KEYFRAME_AT',
      payload: { layerId, frame }
    });
  };

  const handleMoveKeyframe = (layerId: string, fromFrame: number, toFrame: number) => {
    dispatch({
      type: 'MOVE_KEYFRAME',
      payload: { layerId, fromFrame, toFrame }
    });
  };

  const handleAddKeyframeAtFrame = (layerId: string, frame: number) => {
    dispatch({
      type: 'ADD_KEYFRAME_AT_FRAME',
      payload: { layerId, frame }
    });
  };

  const handleToggleVisibility = (id: string) => dispatch({ type: 'TOGGLE_VISIBILITY', payload: id });
  const handleToggleLock = (id: string) => dispatch({ type: 'TOGGLE_LOCK', payload: id });
  const handleRenameLayer = (id: string, name: string) => dispatch({ type: 'RENAME_LAYER', payload: { id, name } });
  const handleDuplicateLayer = (id: string) => dispatch({ type: 'DUPLICATE_LAYER', payload: id });
  const handleDeleteLayer = (id: string) => dispatch({ type: 'DELETE_LAYER', payload: id });
  
  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    dispatch({
      type: 'MOVE_LAYER',
      payload: { id, direction }
    });
  };

  const handleNewProject = () => {
    if (project.layers.length > 0) {
      const confirmNew = window.confirm("Are you sure you want to start a new project? All unsaved changes will be lost.");
      if (!confirmNew) return;
    }
    dispatch({ type: 'RESET_PROJECT', payload: INITIAL_PROJECT });
  };

  const handleExportJSON = () => {
    exportProjectToJson(project);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (project.layers.length > 0) {
      const confirmOverwrite = window.confirm(
        "Importing a new project will replace your current animation. All unsaved changes will be lost.\n\nDo you want to proceed?"
      );
      if (!confirmOverwrite) {
        e.target.value = '';
        return;
      }
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validated = validateAndMigrateProject(parsed);
        dispatch({ type: 'IMPORT_PROJECT', payload: validated });
      } catch (err: any) {
        alert(err.message || "Failed to parse JSON file.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExportPNGFrame = async () => {
    try {
      setIsLoading(true);
      await exportFrameToPng(project, currentFrame);
    } catch (err) {
      alert("Failed to render current frame as PNG.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSpriteSheet = async () => {
    const totalFrames = Math.min(project.fps * project.duration, 100);
    const confirmSheet = window.confirm(
      `Warning: You are about to export a sprite sheet with ${totalFrames} frames.\n\nThis could generate a large image and take a moment to render. Do you want to proceed?`
    );
    if (!confirmSheet) return;

    setIsLoading(true);
    dispatch({ type: 'SET_PLAYING', payload: false });

    const cancelRef = { current: false };
    try {
      await exportAnimationToSpriteSheet(project, () => {}, cancelRef);
    } catch (err: any) {
      alert(err.message || "Failed to render sprite sheet.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPlayableHTML = () => {
    setIsLoading(true);
    try {
      exportPlayableHtml(project);
    } catch (err) {
      alert("Failed to export standalone playable animation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans select-none overflow-x-hidden antialiased">
      
      {/* Immersive User Guide Manual modal */}
      <UserGuide isOpen={isGuideOpen} onClose={() => dispatch({ type: 'SET_GUIDE_OPEN', payload: false })} />

      {/* Recovery Banner */}
      {showRecovery && (
        <div className="bg-teal-500/10 border-b border-teal-500/30 px-6 py-2 flex items-center justify-between shadow-lg">
          <span className="text-teal-300 text-sm font-semibold">An unsaved project was found.</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRecover} 
              className="bg-teal-500 text-slate-900 px-3 py-1 rounded text-xs font-bold hover:bg-teal-400"
            >
              Recover Project
            </button>
            <button 
              onClick={handleDiscardRecovery} 
              className="text-slate-400 text-xs font-semibold hover:text-slate-300"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* 1. Header Banner & Branding */}
      <header id="app-banner-header" className="relative h-20 overflow-hidden border-b border-slate-800 flex items-center shrink-0">
        {/* Background Banner image with premium glass overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="../Omni-Science Banner.jpg" 
            alt="Omni-Science Banner" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter blur-[2px]"
            onError={(e) => {
              // Graceful fallback to a premium color flow if file not present
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950" />
        </div>

        {/* Header Elements Content */}
        <div id="header-content" className="relative z-10 w-full px-6 flex items-center justify-between gap-4">
          
          {/* Logo and Metadata */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 items-center justify-center shrink-0 shadow-lg shadow-teal-500/10">
              <img 
                src="../Omni-Science Logo.jpg" 
                alt="Omni-Science Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-teal-400 font-sans font-black text-2xl">Ω</span>`;
                  }
                }}
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                {/* Project title block */}
                <input
                  id="project-name-input"
                  type="text"
                  value={project.name}
                  onChange={(e) => dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { ...project, name: e.target.value } })}
                  className="bg-transparent text-base sm:text-lg font-sans font-black tracking-tight text-white focus:outline-none focus:bg-slate-900/60 rounded px-2 py-0.5 border border-transparent hover:border-slate-800/80 focus:border-teal-500"
                />
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  Animation Creator
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono pl-2">
                Owned by <span className="text-teal-400">Omni-Science</span> • Author: <span className="text-slate-200">king_of_coding</span>
              </p>
            </div>
          </div>

          {/* Export Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* New Project */}
            <div className="relative group">
              <button
                id="header-new-btn"
                onClick={handleNewProject}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-850 text-xs font-sans font-bold flex items-center gap-2 transition-all active:translate-y-[1px] shadow-lg shadow-black/40 cursor-pointer"
              >
                <FilePlus className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">New</span>
              </button>
            </div>

            {/* Import Project */}
            <div className="relative group">
              <button
                id="header-import-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-850 text-xs font-sans font-bold flex items-center gap-2 transition-all active:translate-y-[1px] shadow-lg shadow-black/40 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">Open</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <div className="absolute right-0 top-11 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 w-60 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] text-slate-400 leading-normal">
                <strong>Open Project:</strong> Loads a previously saved project file.
              </div>
            </div>

            {/* Save JSON Project */}
            <div className="relative group">
              <button
                id="header-save-btn"
                onClick={handleExportJSON}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-850 text-xs font-sans font-bold flex items-center gap-2 transition-all active:translate-y-[1px] shadow-lg shadow-black/40 cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-teal-400" />
                <span className="hidden md:inline">Save</span>
              </button>
              <div className="absolute right-0 top-11 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 w-60 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] text-slate-400 leading-normal">
                <strong>Save Project:</strong> Downloads your current animation project to your device.
              </div>
            </div>

            {/* Render Static PNG */}
            <div className="relative group">
              <button
                id="header-png-btn"
                onClick={handleExportPNGFrame}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-850 text-xs font-sans font-bold flex items-center gap-2 transition-all active:translate-y-[1px] shadow-lg shadow-black/40 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span className="hidden md:inline">Export PNG</span>
              </button>
              <div className="absolute right-0 top-11 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 w-60 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] text-slate-400 leading-normal">
                <strong>Export PNG:</strong> Exports an image of the current frame.
              </div>
            </div>

            {/* Render Sprite Sheet */}
            <div className="relative group">
              <button
                id="header-spritesheet-btn"
                onClick={handleExportSpriteSheet}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-850 text-xs font-sans font-bold flex items-center gap-2 transition-all active:translate-y-[1px] shadow-lg shadow-black/40 cursor-pointer"
              >
                <Grid className="w-4 h-4 text-amber-500" />
                <span className="hidden lg:inline">Export Sheet</span>
              </button>
              <div className="absolute right-0 top-11 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 w-60 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] text-slate-400 leading-normal">
                <strong>Export Spritesheet:</strong> Exports a combined grid image of all frames.
              </div>
            </div>

            {/* Render Standalone Playable HTML Player */}
            <div className="relative group">
              <button
                id="header-html-btn"
                onClick={handleExportPlayableHTML}
                className="px-3.5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-sans font-bold flex items-center gap-2 transition-all active:translate-y-[1px] shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>Playable HTML</span>
              </button>
              <div className="absolute right-0 top-11 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 w-60 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] text-slate-400 leading-normal">
                <strong>Playable HTML:</strong> Packs all vector elements and interpolation players into a single self-contained document you can load anywhere.
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Loading overlay indicator */}
      {isLoading && (
        <div id="global-loading-indicator" className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-teal-500/40 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md">
          <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
          <span className="text-xs font-sans text-slate-200">Loading...</span>
        </div>
      )}

      {/* 2. Main Creator Workspace Dashboard Grid Layout */}
      <main id="workspace-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-[#020617]">
        
        {/* Left: Shape adding tool drawer */}
        <ToolPanel
          onAddShape={handleAddShape}
          onOpenGuide={() => dispatch({ type: 'SET_GUIDE_OPEN', payload: true })}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          gridSnap={gridSnap}
          setGridSnap={(v) => dispatch({ type: 'SET_GRID_SNAP', payload: v })}
          activeTool={activeTool}
          setActiveTool={(tool) => dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool })}
          brushSettings={brushSettings}
          setBrushSettings={setBrushSettings}
        />

        {/* Center Canvas Stage and Timeline Section */}
        <div id="center-workspace-pane" className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          
          {/* Main Drawing Stage Area */}
          <AnimationStage
            layers={project.layers}
            activeLayerId={activeLayerId}
            currentFrame={currentFrame}
            onionSkinEnabled={onionSkinEnabled}
            gridSnap={gridSnap}
            onUpdateLayerProperty={handleUpdateLayerProperty}
            onStartTransaction={() => dispatch({ type: 'START_TRANSACTION' })}
            onSelectLayer={(id) => {
              dispatch({ type: 'SET_ACTIVE_TOOL', payload: 'select' });
              dispatch({ type: 'SET_ACTIVE_LAYER', payload: id });
            }}
            onAddFreeformLayer={handleAddFreeformLayer}
            activeTool={activeTool}
            setActiveTool={(tool) => dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool })}
            brushSettings={brushSettings}
            projectWidth={project.width}
            projectHeight={project.height}
          />

          {/* Timeline and Frame Tick Grid */}
          <Timeline
            layers={project.layers}
            activeLayerId={activeLayerId}
            currentFrame={currentFrame}
            setCurrentFrame={(f) => dispatch({ type: 'SET_CURRENT_FRAME', payload: f })}
            onionSkinEnabled={onionSkinEnabled}
            setOnionSkinEnabled={(v) => dispatch({ type: 'SET_ONION_SKIN', payload: v })}
            fps={project.fps}
            setFps={(f) => dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { ...project, fps: f } })}
            duration={project.duration}
            setDuration={(d) => dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { ...project, duration: d } })}
            onAddKeyframe={handleAddKeyframeAtFrame}
            onRemoveKeyframeAt={handleRemoveKeyframeAt}
            onMoveKeyframe={handleMoveKeyframe}
            isPlaying={isPlaying}
            setIsPlaying={(playing) => dispatch({ type: 'SET_PLAYING', payload: playing })}
          />

        </div>

        {/* Right Stack Sidebar: Layers order & Attributes properties inputs */}
        <div id="right-workspace-sidebar" className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 bg-slate-900 divide-y divide-slate-800/80 overflow-y-auto">
          {/* Layers system */}
          <LayersPanel
            layers={project.layers}
            activeLayerId={activeLayerId}
            onSelectLayer={(id) => {
              dispatch({ type: 'SET_ACTIVE_TOOL', payload: 'select' });
              dispatch({ type: 'SET_ACTIVE_LAYER', payload: id });
            }}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onRenameLayer={handleRenameLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            onMoveLayer={handleMoveLayer}
            assets={project.assets || []}
            onAddAsset={(asset) => dispatch({ type: 'ADD_ASSET', payload: asset })}
            onDeleteAsset={(id) => dispatch({ type: 'DELETE_ASSET', payload: id })}
            onAddImageLayerFromAsset={(assetId) => {
              const asset = project.assets?.find(a => a.id === assetId);
              if (asset) {
                dispatch({
                  type: 'ADD_LAYER',
                  payload: {
                    type: 'image',
                    defaultProperties: {},
                    currentFrame,
                    imageUrl: asset.dataUrl
                  }
                });
              }
            }}
          />

          {/* Object Properties attributes */}
          <PropertiesPanel
            activeLayer={project.layers.find((l) => l.id === activeLayerId) || null}
            currentFrame={currentFrame}
            interpolatedProperties={
              activeLayerId 
                ? getInterpolatedProperties(project.layers.find((l) => l.id === activeLayerId)!, currentFrame)
                : DEFAULT_PROPERTIES
            }
            onUpdateKeyframeProperty={handleUpdateKeyframeProperty}
            onInsertKeyframe={handleInsertKeyframe}
            onRemoveKeyframe={handleRemoveKeyframe}
          />
        </div>

      </main>

    </div>
  );
}
