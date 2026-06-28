/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  ChevronLeft, 
  ChevronRight, 
  Repeat, 
  Eye, 
  Key,
  Clock,
  Sparkles
} from 'lucide-react';
import { Layer, Keyframe } from '../types';

interface TimelineProps {
  layers: Layer[];
  activeLayerId: string | null;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  onionSkinEnabled: boolean;
  setOnionSkinEnabled: (enabled: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;
  duration: number; // in seconds
  setDuration: (duration: number) => void;
  onAddKeyframe: (layerId: string, frame: number) => void;
  onRemoveKeyframeAt: (layerId: string, frame: number) => void;
  onMoveKeyframe: (layerId: string, fromFrame: number, toFrame: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function Timeline({
  layers,
  activeLayerId,
  currentFrame,
  setCurrentFrame,
  onionSkinEnabled,
  setOnionSkinEnabled,
  fps,
  setFps,
  duration,
  setDuration,
  onAddKeyframe,
  onRemoveKeyframeAt,
  onMoveKeyframe,
  isPlaying,
  setIsPlaying,
}: TimelineProps) {
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [draggingKeyframe, setDraggingKeyframe] = useState<{ layerId: string; fromFrame: number; targetFrame: number } | null>(null);
  const draggingKeyframeRef = useRef<{ layerId: string; fromFrame: number; targetFrame: number } | null>(null);
  const [isScrubbingRuler, setIsScrubbingRuler] = useState<boolean>(false);

  const updateDraggingKeyframe = (state: { layerId: string; fromFrame: number; targetFrame: number } | null) => {
    setDraggingKeyframe(state);
    draggingKeyframeRef.current = state;
  };

  const totalFrames = Math.max(12, fps * duration);
  const playTimerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const rulerRef = useRef<HTMLDivElement>(null);
  const currentFrameRef = useRef(currentFrame);
  
  useEffect(() => {
    currentFrameRef.current = currentFrame;
  }, [currentFrame]);

  // Playback Loop via requestAnimationFrame
  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = performance.now();
      
      const frameInterval = 1000 / fps;
      let accumulator = 0;

      const tick = (now: number) => {
        if (!isPlaying) return;
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        accumulator += delta;
        if (accumulator >= frameInterval) {
          const framesToAdvance = Math.floor(accumulator / frameInterval);
          accumulator %= frameInterval;

          let nextFrame = currentFrameRef.current + framesToAdvance;
          if (nextFrame >= totalFrames) {
            if (isLooping) {
              nextFrame = 0;
            } else {
              setIsPlaying(false);
              nextFrame = totalFrames - 1;
            }
          }
          setCurrentFrame(nextFrame);
        }
        playTimerRef.current = requestAnimationFrame(tick);
      };

      playTimerRef.current = requestAnimationFrame(tick);
    } else {
      if (playTimerRef.current) {
        cancelAnimationFrame(playTimerRef.current);
      }
    }

    return () => {
      if (playTimerRef.current) {
        cancelAnimationFrame(playTimerRef.current);
      }
    };
  }, [isPlaying, fps, totalFrames, isLooping, setIsPlaying, setCurrentFrame]);

  // Handle global mouse release for keyframe dragging and ruler scrubbing
  useEffect(() => {
    const handleMouseUp = () => {
      const dragState = draggingKeyframeRef.current;
      if (dragState && dragState.fromFrame !== dragState.targetFrame) {
        onMoveKeyframe(dragState.layerId, dragState.fromFrame, dragState.targetFrame);
      }
      updateDraggingKeyframe(null);
      setIsScrubbingRuler(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const dragState = draggingKeyframeRef.current;
        if (dragState) {
          updateDraggingKeyframe(null);
        }
        setIsScrubbingRuler(false);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onMoveKeyframe]);

  const handlePlayToggle = () => setIsPlaying(!isPlaying);
  
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const handlePrevFrame = () => {
    setCurrentFrame(Math.max(0, currentFrame - 1));
  };

  const handleNextFrame = () => {
    setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1));
  };

  // Scrubbing the timeline ruler helper
  const handleRulerScrub = (clientX: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    const targetFrame = Math.round(percentage * (totalFrames - 1));
    setCurrentFrame(targetFrame);
  };

  const handleRulerMouseDown = (e: React.MouseEvent) => {
    setIsScrubbingRuler(true);
    handleRulerScrub(e.clientX);
  };

  const handleRulerMouseMove = (e: React.MouseEvent) => {
    if (isScrubbingRuler) {
      handleRulerScrub(e.clientX);
    } else if (draggingKeyframe) {
      // If we are dragging a keyframe, update its position visually based on mouse X
      if (!rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
      const targetFrame = Math.round(percentage * (totalFrames - 1));
      
      if (targetFrame !== draggingKeyframe.targetFrame) {
         updateDraggingKeyframe({ ...draggingKeyframe, targetFrame });
      }
    }
  };

  // Keyframe Drag and Interaction events
  const handleKeyframeMouseDown = (e: React.MouseEvent, layerId: string, frame: number) => {
    e.stopPropagation();
    if (e.button === 0) { // left click
      updateDraggingKeyframe({ layerId, fromFrame: frame, targetFrame: frame });
    }
  };

  const handleCellDoubleClick = (layerId: string, frame: number, hasKf: boolean) => {
    if (hasKf) {
      onRemoveKeyframeAt(layerId, frame);
    } else {
      onAddKeyframe(layerId, frame);
    }
  };

  const handleTrackClick = (e: React.MouseEvent, layerId: string) => {
     if (!rulerRef.current) return;
     const rect = rulerRef.current.getBoundingClientRect();
     const relativeX = e.clientX - rect.left;
     const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
     const targetFrame = Math.round(percentage * (totalFrames - 1));
     setCurrentFrame(targetFrame);
  };

  const handleTrackDoubleClick = (e: React.MouseEvent, layerId: string) => {
     if (!rulerRef.current) return;
     const rect = rulerRef.current.getBoundingClientRect();
     const relativeX = e.clientX - rect.left;
     const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
     const targetFrame = Math.round(percentage * (totalFrames - 1));
     const hasKf = layers.find(l => l.id === layerId)?.keyframes.some(k => k.frame === targetFrame);
     handleCellDoubleClick(layerId, targetFrame, !!hasKf);
  };

  // Format timestamp strings
  const formatTime = (frameIdx: number) => {
    const totalSecs = frameIdx / fps;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const centis = Math.floor((totalSecs % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  // Determine tick steps to avoid rendering thousands of ticks
  const tickStep = totalFrames > 300 ? Math.ceil(totalFrames / 50) : (totalFrames > 100 ? 5 : 1);
  const ticks = [];
  for (let i = 0; i < totalFrames; i += tickStep) {
     ticks.push(i);
  }
  if (ticks[ticks.length - 1] !== totalFrames - 1) {
     ticks.push(totalFrames - 1);
  }

  return (
    <div id="timeline-container" className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4 select-none shadow-xl shadow-slate-950/20">
      
      {/* 1. Header Toolbar Controls */}
      <div id="timeline-controls-bar" className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
        
        {/* Left: Playback buttons */}
        <div className="flex items-center gap-1">
          <button
            id="timeline-prev-btn"
            onClick={handlePrevFrame}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous Frame"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="timeline-play-btn"
            onClick={handlePlayToggle}
            className={`p-2.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isPlaying 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/10'
            }`}
            title={isPlaying ? "Pause playback" : "Play animation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current text-white" />}
            <span className="text-xs uppercase font-sans hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            id="timeline-stop-btn"
            onClick={handleStop}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Stop &amp; Rewind"
          >
            <Square className="w-4 h-4 fill-current text-rose-500" />
          </button>

          <button
            id="timeline-next-btn"
            onClick={handleNextFrame}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next Frame"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            id="timeline-loop-btn"
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLooping 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Continuous Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Frame and Time displays */}
        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Playhead Frame</span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {currentFrame.toString().padStart(4, '0')} <span className="text-slate-600">/</span> {totalFrames.toString().padStart(4, '0')}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Timestamp</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {formatTime(currentFrame)}
            </span>
          </div>
        </div>

        {/* Right: FPS, Duration, Onion Skin */}
        <div className="flex items-center gap-2.5">
          {/* Onion Skin toggle */}
          <button
            id="timeline-onion-btn"
            onClick={() => setOnionSkinEnabled(!onionSkinEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans font-medium transition-colors cursor-pointer ${
              onionSkinEnabled 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Preview transparent outlines of previous/next frames"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Onion Skin</span>
          </button>

          {/* Framerate selection */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 font-mono">FPS:</span>
            <select
              id="timeline-fps-select"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="12">12 FPS (Retro)</option>
              <option value="24">24 FPS (Cinema)</option>
              <option value="30">30 FPS (Standard)</option>
              <option value="60">60 FPS (Smooth)</option>
            </select>
          </div>

          {/* Duration selection */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-mono">Secs:</span>
            <input
              id="timeline-duration-input"
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
              className="bg-transparent text-xs font-mono font-bold text-white w-8 focus:outline-none text-center"
            />
          </div>
        </div>

      </div>

      {/* 2. Timeline Grid tracks scrubber */}
      <div 
        id="timeline-scrubber" 
        className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden flex flex-col"
        onMouseMove={handleRulerMouseMove}
      >
        
        {/* Scrubber Rule header bar */}
        <div className="flex border-b border-slate-850 bg-slate-950/80">
          {/* Label Spacer Column */}
          <div className="w-36 shrink-0 border-r border-slate-850 px-3 py-1.5 flex items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            Layer Track
          </div>

          {/* Ruler Cells */}
          <div 
            id="timeline-ruler"
            ref={rulerRef}
            className="flex-1 relative h-8 cursor-ew-resize bg-slate-950"
            onMouseDown={handleRulerMouseDown}
          >
            {/* Playhead cyan vertical line */}
            <div 
              id="ruler-playhead-line"
              className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 z-10 pointer-events-none"
              style={{
                left: `${(currentFrame / (totalFrames - 1)) * 100}%`,
              }}
            >
              <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full -ml-1.5 shadow-[0_0_8px_rgba(34,211,238,1)] border border-slate-950" />
            </div>

            {/* Render Ticks */}
            {ticks.map((fIdx) => {
               const isMajor = fIdx % 5 === 0;
               const isLabel = fIdx % 10 === 0 || fIdx === 0 || fIdx === totalFrames - 1;
               return (
                  <div 
                    key={`tick-${fIdx}`}
                    className="absolute top-0 bottom-0 flex flex-col items-center justify-between"
                    style={{ left: `${(fIdx / (totalFrames - 1)) * 100}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className={`w-[1px] ${isMajor ? 'h-3 bg-slate-600' : 'h-1.5 bg-slate-800'}`} />
                    {isLabel && (
                       <span className="text-[8px] font-mono text-slate-400 select-none pb-1">
                         {fIdx}
                       </span>
                    )}
                  </div>
               );
            })}
          </div>
        </div>

        {/* Tracks lists rows */}
        <div className="max-h-40 overflow-y-auto overflow-x-hidden divide-y divide-slate-900 scrollbar-thin scrollbar-thumb-slate-850">
          {layers.map((layer) => {
            const isLayerActive = layer.id === activeLayerId;

            return (
              <div 
                key={layer.id} 
                id={`track-row-${layer.id}`}
                className={`flex items-stretch transition-colors ${
                  isLayerActive ? 'bg-slate-900/40' : 'hover:bg-slate-900/10'
                }`}
              >
                {/* Track label */}
                <div className="w-36 shrink-0 border-r border-slate-850 p-2.5 flex items-center justify-between gap-1">
                  <span className="text-xs font-sans text-slate-300 truncate" title={layer.name}>
                    {layer.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-600 uppercase">
                    {layer.type}
                  </span>
                </div>

                {/* Track cell area */}
                <div 
                  className="flex-1 relative flex items-center justify-between bg-slate-950/20 cursor-pointer overflow-hidden h-9"
                  onClick={(e) => handleTrackClick(e, layer.id)}
                  onDoubleClick={(e) => handleTrackDoubleClick(e, layer.id)}
                  title="Click to jump. Double click to add/remove keyframe."
                >
                  {/* Vertical playhead tracker line background */}
                  <div 
                    className="absolute top-0 bottom-0 w-[1px] bg-cyan-500/20 pointer-events-none"
                    style={{
                      left: `${(currentFrame / (totalFrames - 1)) * 100}%`,
                    }}
                  />

                  {layer.keyframes.map((kf) => {
                     const isCurrent = kf.frame === currentFrame;
                     const isDragging = draggingKeyframe && draggingKeyframe.layerId === layer.id && draggingKeyframe.fromFrame === kf.frame;
                     const displayFrame = isDragging ? draggingKeyframe.targetFrame : kf.frame;
                     
                     return (
                        <div
                           key={`kf-${layer.id}-${kf.frame}`}
                           className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                           style={{ left: `${(displayFrame / (totalFrames - 1)) * 100}%` }}
                           onMouseDown={(e) => handleKeyframeMouseDown(e, layer.id, kf.frame)}
                           onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleCellDoubleClick(layer.id, kf.frame, true);
                           }}
                        >
                           <div
                              className={`w-3.5 h-3.5 transform rotate-45 border transition-all shadow ${
                                isCurrent 
                                  ? 'bg-amber-400 border-white scale-110 shadow-amber-500/30' 
                                  : 'bg-amber-600 border-amber-950 hover:bg-amber-500'
                              } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
                              title={`Keyframe at frame ${kf.frame} (Hold & Drag to shift)`}
                           />
                        </div>
                     )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Double click instruction helper */}
      <p className="text-[10px] text-slate-500 text-center font-mono mt-0.5">
        💡 Double-click any track to **Add Keyframe**. Double-click a diamond to **Remove Keyframe**. Hold and drag a diamond left or right to **Slide its Frame**.
      </p>

    </div>
  );
}
