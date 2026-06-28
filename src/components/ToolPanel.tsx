/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Circle, 
  Square, 
  Type, 
  Image, 
  PenTool, 
  Minus, 
  HelpCircle, 
  BookOpen, 
  FileJson,
  Undo2,
  Redo2,
  LayoutGrid
} from 'lucide-react';
import { ShapeType } from '../types';

interface ToolPanelProps {
  onAddShape: (type: ShapeType) => void;
  onOpenGuide: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  gridSnap: boolean;
  setGridSnap: (snap: boolean) => void;
  activeTool: ShapeType | 'select' | 'drawing';
  setActiveTool: (tool: ShapeType | 'select' | 'drawing') => void;
}

export default function ToolPanel({
  onAddShape,
  onOpenGuide,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  gridSnap,
  setGridSnap,
  activeTool,
  setActiveTool,
}: ToolPanelProps) {
  const tools: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
    { type: 'circle', label: 'Circle', icon: <Circle className="w-5 h-5 text-sky-400" /> },
    { type: 'square', label: 'Square', icon: <Square className="w-5 h-5 text-indigo-400" /> },
    { type: 'rectangle', label: 'Rectangle', icon: <div className="w-5 h-3 bg-transparent border-2 border-purple-400 rounded-sm" /> },
    { type: 'line', label: 'Line', icon: <Minus className="w-5 h-5 text-emerald-400" /> },
    { type: 'text', label: 'Text', icon: <Type className="w-5 h-5 text-amber-400" /> },
    { type: 'image', label: 'Sprite / Image', icon: <Image className="w-5 h-5 text-rose-400" /> },
    { type: 'freeform', label: 'Freeform Draw', icon: <PenTool className="w-5 h-5 text-teal-400" /> },
  ];

  return (
    <div id="tool-panel" className="w-full lg:w-64 bg-slate-900/80 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between p-4 gap-4 shrink-0">
      <div className="space-y-5">
        {/* Logo and Brand */}
        <div id="logo-brand-container" className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-850 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <img 
              src="../Omni-Science Logo.jpg" 
              alt="Omni-Science" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Render a beautiful neon fallback if logo not found
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-cyan-400 font-sans font-black text-xl">Ω</span>`;
                }
              }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-display font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 truncate">OMNI-ANIMATOR</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-tight truncate">Owned by Omni-Science</p>
          </div>
        </div>

        {/* History / Actions */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="undo-btn"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-sans font-medium transition-all border border-slate-800"
              title="Undo Action"
            >
              <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
              Undo
            </button>
            <button
              id="redo-btn"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-sans font-medium transition-all border border-slate-800"
              title="Redo Action"
            >
              <Redo2 className="w-3.5 h-3.5 text-cyan-400" />
              Redo
            </button>
          </div>

          <button
            id="snap-grid-btn"
            onClick={() => setGridSnap(!gridSnap)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans font-medium border transition-all ${
              gridSnap 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-850/50 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span>Snap to Grid (10px)</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${gridSnap ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse' : 'bg-slate-700'}`} />
          </button>
        </div>

        {/* Shape / Sprites Palette */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Vector Toolkit</div>
          <div className="space-y-1.5">
            {/* Standard Selection Tool */}
            <button
              id="tool-select"
              onClick={() => setActiveTool('select')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-sans font-semibold transition-all duration-150 border text-left cursor-pointer ${
                activeTool === 'select'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-850/40 hover:bg-slate-800 border-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <span className="p-1 rounded-md bg-slate-950">
                <MousePointerIcon className="w-4 h-4 text-cyan-400" />
              </span>
              <span>Select / Transform</span>
            </button>

            {tools.map((tool) => (
              <button
                key={tool.type}
                id={`add-${tool.type}-btn`}
                onClick={() => {
                  onAddShape(tool.type);
                  if (tool.type === 'freeform') {
                    setActiveTool('drawing');
                  } else {
                    setActiveTool('select');
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-all duration-150 border text-left cursor-pointer ${
                  activeTool === 'drawing' && tool.type === 'freeform'
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-850/40 hover:bg-slate-800 border-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <span className="p-1 rounded-md bg-slate-950">
                  {tool.icon}
                </span>
                <span>Add {tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual & Credit Footer */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <button
          id="toggle-guide-btn"
          onClick={onOpenGuide}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-cyan-600 border border-cyan-400 text-white text-xs font-display font-bold rounded-lg transition-all shadow-lg shadow-cyan-950/25 active:scale-95 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Open Guide &amp; Guarantee</span>
        </button>

        <div className="text-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
          <p className="text-[10px] text-slate-400 font-sans tracking-wide">
            Creator Suite
          </p>
          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
            By <span className="text-cyan-400">king_of_coding</span>
          </p>
          <p className="text-[9px] text-slate-600 font-mono">
            Owned by Omni-Science
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple internal helper icon to avoid extra imports
function MousePointerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="m13 13 6 6" />
    </svg>
  );
}
