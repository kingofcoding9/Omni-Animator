/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Shield, FileText, Smartphone, RefreshCw, Key, Layers, MousePointer, Info } from 'lucide-react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="guide-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            id="guide-modal"
            className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#020617] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 text-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div id="guide-header" className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="text-xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
                    Creator Manual &amp; Guide
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Owned by Omni-Science • By king_of_coding</p>
                </div>
              </div>
              <button
                id="close-guide-btn"
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors duration-150 border border-slate-700"
                aria-label="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div id="guide-content-scroll" className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              
              {/* Banner Placeholder or real if loads */}
              <div id="guide-banner" className="relative h-24 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                <img 
                  src="../Omni-Science Banner.jpg" 
                  alt="Omni-Science Banner" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  onError={(e) => {
                    // Fallback to beautiful neon design if file not found
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="relative z-10 text-center px-4">
                  <h3 className="text-lg font-sans font-bold tracking-widest text-cyan-300 drop-shadow-md">OMNI-SCIENCE ANIMATION HUB</h3>
                  <p className="text-xs text-slate-300 font-mono mt-1">High-fidelity keyframe interpolation engine</p>
                </div>
              </div>

              {/* Sections */}
              <div id="guide-sections-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. What the animator does */}
                <div id="guide-sec-1" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4" /> 1. What it does
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This software is an advanced browser-based vector 2D animation suite. Instead of rendering frame-by-frame pixels (which slows down your computer), it uses hardware-accelerated SVG elements and mathematical transforms. This allows you to scale, rotate, and animate shapes smoothly at high frame rates.
                  </p>
                </div>

                {/* 2. How to create a new animation */}
                <div id="guide-sec-2" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> 2. Creating an Animation
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Start by adjusting the stage resolution, frame rate (FPS), and duration in the <strong>Settings</strong> panel. Your total frames will calculate automatically. The default stage size is 800x500 pixels, providing a spacious playground for your vector elements.
                  </p>
                </div>

                {/* 3. Add shapes, text, and images */}
                <div id="guide-sec-3" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" /> 3. Adding Elements
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Use the <strong>Tool Panel</strong> to inject objects into your active frame. You can draw lines, place rectangles, squares, circles, custom texts, or freeform draw with mouse strokes. You can also import external images and sprites by putting their URL links directly.
                  </p>
                </div>

                {/* 4. Move, resize, and rotate */}
                <div id="guide-sec-4" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <MousePointer className="w-4 h-4" /> 4. Transforming Objects
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click on any object to select it. Drag it around the canvas to move it. Control handles let you resize, stretch, and rotate the object. You can also input precise coordinates, scale values, and rotation angles directly inside the <strong>Properties Panel</strong>.
                  </p>
                </div>

                {/* 5. How layers work */}
                <div id="guide-sec-5" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" /> 5. Layer System
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every object belongs to its own layer. Layer order decides which element sits on top. Use the <strong>Layers Panel</strong> to hide layers, lock them to prevent accidental edits, duplicate them, rename them for organization, or delete them when they are no longer needed.
                  </p>
                </div>

                {/* 6. How keyframes work */}
                <div id="guide-sec-6" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4" /> 6. Keyframes &amp; Tweening
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A keyframe stores an object's properties at a specific frame index. If you place a keyframe on frame 0, move the object, and place another keyframe on frame 24, our engine automatically calculates the intermediate states (tweening) using mathematical curves for continuous, stutter-free playback.
                  </p>
                </div>

                {/* 7. Preview the animation */}
                <div id="guide-sec-7" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> 7. Playback Controls
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Use the controls underneath the stage to <strong>Play</strong>, <strong>Pause</strong>, <strong>Stop</strong>, or toggle <strong>Loop</strong>. You can manually drag the playhead along the timeline ruler or tap on individual frame ticks. Toggle <strong>Onion Skinning</strong> to see semi-transparent ghost views of adjacent frames.
                  </p>
                </div>

                {/* 8. Save and open projects */}
                <div id="guide-sec-8" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> 8. Saving and Opening
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Save your project safely to a JSON file on your machine using the <strong>Save Project</strong> button. When you return later, drag or upload the JSON project file to instantly recreate your work, preserving all elements, layers, coordinates, and keyframes.
                  </p>
                </div>

                {/* 9. How to export */}
                <div id="guide-sec-9" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" /> 9. Export Options
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You can export in multiple ways: download the current static frame as a <strong>PNG Image</strong>, build a full <strong>Sprite Sheet</strong> containing all frame states as a single sheet, or export a <strong>Playable Animation</strong> that packages your vector animation cleanly.
                  </p>
                </div>

                {/* 10. Mobile controls */}
                <div id="guide-sec-10" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> 10. Mobile Compatibility
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our canvas supports both mouse pointer inputs and multi-touch gestures. Use touch drag to position elements, and tap properties to open sliders designed for mobile viewports. On smaller screens, side menus can collapse to maximize editing space.
                  </p>
                </div>

                {/* 11. Troubleshooting tips */}
                <div id="guide-sec-11" className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-sans font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> 11. Troubleshooting
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li>If animations stutter, double check that your browser has hardware acceleration enabled.</li>
                    <li>If an image does not render, ensure its URL starts with https and allows cross-origin requests.</li>
                    <li>Use the built-in <strong>Undo</strong> (Ctrl+Z) and <strong>Redo</strong> (Ctrl+Y) buttons to quickly fix mistakes.</li>
                  </ul>
                </div>

                {/* 12. Safety Guarantee (Detailed) */}
                <div id="guide-sec-12" className="p-4 bg-cyan-950/10 rounded-xl border border-cyan-500/30 md:col-span-2 space-y-3">
                  <h3 className="text-sm font-sans font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" /> 12. Safety Guarantee
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                    <div className="space-y-2">
                      <p className="flex gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Zero Risk:</strong> This website does not intentionally damage or modify any of your local files or documents.</span>
                      </p>
                      <p className="flex gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>User Ownership:</strong> Your project data, images, and designs stay strictly under your own control; nothing is uploaded to external clouds.</span>
                      </p>
                      <p className="flex gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Accidental Safeguards:</strong> The tool prompts you and asks for confirmation before overwriting or discarding your active project.</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Secure Downloads:</strong> All export buttons (JSON, PNG, spritesheets) generate clean, standards-compliant client-side downloads without harmful executable scripts.</span>
                      </p>
                      <p className="flex gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Private Access:</strong> Creating animations does not require entering personal emails, login passwords, or private user details.</span>
                      </p>
                      <p className="flex gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Clear Functionality:</strong> Every save, open, and export action is clearly explained with instructions in the sidebar prior to triggering.</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div id="guide-footer" className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-mono">
                Owned by Omni-Science
              </div>
              <button
                id="guide-got-it-btn"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white font-sans font-bold text-sm transition-all duration-150 shadow-lg shadow-cyan-950/20 active:translate-y-[1px] cursor-pointer"
              >
                Accept &amp; Open Workspace
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
