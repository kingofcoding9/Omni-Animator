/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';

import { ShapeType, Point, Keyframe, Layer, Project } from './types';
import { getInterpolatedProperties, DEFAULT_PROPERTIES } from './utils/animation';

// Custom sub-components
import UserGuide from './components/UserGuide';
import ToolPanel from './components/ToolPanel';
import LayersPanel from './components/LayersPanel';
import PropertiesPanel from './components/PropertiesPanel';
import AnimationStage from './components/AnimationStage';
import Timeline from './components/Timeline';

// Default initial project setup
const INITIAL_PROJECT: Project = {
  name: 'Retro Orbit Wave',
  fps: 24,
  duration: 4, // 4 seconds (96 frames total)
  width: 800,
  height: 500,
  layers: [
    {
      id: 'layer-cosmic-ring',
      name: 'Cosmic Ring',
      type: 'circle',
      visible: true,
      locked: false,
      keyframes: [
        {
          frame: 0,
          x: 400,
          y: 250,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
          color: '#1e1b4b',
          strokeColor: '#38bdf8',
          strokeWidth: 4,
          width: 250,
          height: 250,
          fontSize: 24,
          easing: 'ease-in-out',
        },
        {
          frame: 48,
          x: 400,
          y: 250,
          scaleX: 1.2,
          scaleY: 1.2,
          rotation: 180,
          opacity: 0.8,
          color: '#311042',
          strokeColor: '#f43f5e',
          strokeWidth: 8,
          width: 250,
          height: 250,
          fontSize: 24,
          easing: 'ease-in-out',
        },
        {
          frame: 95,
          x: 400,
          y: 250,
          scaleX: 1,
          scaleY: 1,
          rotation: 360,
          opacity: 1,
          color: '#1e1b4b',
          strokeColor: '#38bdf8',
          strokeWidth: 4,
          width: 250,
          height: 250,
          fontSize: 24,
          easing: 'linear',
        },
      ],
    },
    {
      id: 'layer-comet-core',
      name: 'Comet Core',
      type: 'square',
      visible: true,
      locked: false,
      keyframes: [
        {
          frame: 0,
          x: 275,
          y: 250,
          scaleX: 1,
          scaleY: 1,
          rotation: 45,
          opacity: 1,
          color: '#06b6d4',
          strokeColor: '#ffffff',
          strokeWidth: 2,
          width: 40,
          height: 40,
          fontSize: 24,
          easing: 'ease-out',
        },
        {
          frame: 24,
          x: 400,
          y: 125,
          scaleX: 1.3,
          scaleY: 1.3,
          rotation: 135,
          opacity: 1,
          color: '#10b981',
          strokeColor: '#e0f2fe',
          strokeWidth: 3,
          width: 40,
          height: 40,
          fontSize: 24,
          easing: 'ease-in',
        },
        {
          frame: 48,
          x: 525,
          y: 250,
          scaleX: 1,
          scaleY: 1,
          rotation: 225,
          opacity: 1,
          color: '#f59e0b',
          strokeColor: '#ffffff',
          strokeWidth: 2,
          width: 40,
          height: 40,
          fontSize: 24,
          easing: 'ease-out',
        },
        {
          frame: 72,
          x: 400,
          y: 375,
          scaleX: 1.3,
          scaleY: 1.3,
          rotation: 315,
          opacity: 1,
          color: '#ec4899',
          strokeColor: '#fdf2f8',
          strokeWidth: 3,
          width: 40,
          height: 40,
          fontSize: 24,
          easing: 'ease-in',
        },
        {
          frame: 95,
          x: 275,
          y: 250,
          scaleX: 1,
          scaleY: 1,
          rotation: 405,
          opacity: 1,
          color: '#06b6d4',
          strokeColor: '#ffffff',
          strokeWidth: 2,
          width: 40,
          height: 40,
          fontSize: 24,
          easing: 'linear',
        },
      ],
    },
    {
      id: 'layer-welcome-text',
      name: 'Title Banner',
      type: 'text',
      visible: true,
      text: 'OMNI SCIENCE',
      locked: false,
      keyframes: [
        {
          frame: 0,
          x: 400,
          y: 250,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 0,
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 0,
          width: 300,
          height: 50,
          fontSize: 28,
          easing: 'ease-out',
        },
        {
          frame: 30,
          x: 400,
          y: 250,
          scaleX: 1.1,
          scaleY: 1.1,
          rotation: 0,
          opacity: 1,
          color: '#2dd4bf',
          strokeColor: '#1e293b',
          strokeWidth: 1,
          width: 300,
          height: 50,
          fontSize: 32,
          easing: 'ease-in-out',
        },
        {
          frame: 65,
          x: 400,
          y: 250,
          scaleX: 1.1,
          scaleY: 1.1,
          rotation: 0,
          opacity: 1,
          color: '#f43f5e',
          strokeColor: '#1e293b',
          strokeWidth: 1,
          width: 300,
          height: 50,
          fontSize: 32,
          easing: 'ease-in',
        },
        {
          frame: 95,
          x: 400,
          y: 250,
          scaleX: 0.8,
          scaleY: 0.8,
          rotation: 0,
          opacity: 0,
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 0,
          width: 300,
          height: 50,
          fontSize: 24,
          easing: 'linear',
        }
      ],
    }
  ],
};

export default function App() {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [activeLayerId, setActiveLayerId] = useState<string | null>('layer-comet-core');
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [onionSkinEnabled, setOnionSkinEnabled] = useState<boolean>(true);
  const [gridSnap, setGridSnap] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<ShapeType | 'select' | 'drawing'>('select');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Undo/Redo Stacks
  const [historyPast, setHistoryPast] = useState<Project[]>([]);
  const [historyFuture, setHistoryFuture] = useState<Project[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger guide open on first visit
  useEffect(() => {
    setIsGuideOpen(true);
  }, []);

  // Save the state to history for undo/redo tracking
  const pushHistory = (prevProject: Project) => {
    setHistoryPast((past) => [...past, JSON.parse(JSON.stringify(prevProject))]);
    setHistoryFuture([]); // clear redo stack on new action
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    setIsPlaying(false);
    const previous = historyPast[historyPast.length - 1];
    setHistoryFuture((future) => [JSON.parse(JSON.stringify(project)), ...future]);
    setProject(previous);
    setHistoryPast((past) => past.slice(0, past.length - 1));
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    setIsPlaying(false);
    const next = historyFuture[0];
    setHistoryPast((past) => [...past, JSON.parse(JSON.stringify(project))]);
    setProject(next);
    setHistoryFuture((future) => future.slice(1));
  };

  // Add a brand new layer with appropriate type and starting properties
  const handleAddShape = (type: ShapeType) => {
    setIsPlaying(false);
    const prevProj = { ...project };
    pushHistory(prevProj);

    const layerCount = project.layers.filter(l => l.type === type).length + 1;
    const layerId = `layer-${type}-${Date.now()}`;
    const layerName = `${type.charAt(0).toUpperCase() + type.slice(1)} ${layerCount}`;

    // Compute standard default starting properties at current playhead frame
    const defaultKf: Keyframe = {
      frame: currentFrame,
      x: project.width / 2,
      y: project.height / 2,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      color: type === 'line' ? '#10b981' : type === 'text' ? '#ffffff' : '#3b82f6',
      strokeColor: '#ffffff',
      strokeWidth: type === 'line' || type === 'freeform' ? 4 : 0,
      width: type === 'line' ? 200 : 100,
      height: type === 'line' ? 4 : 100,
      fontSize: 28,
      easing: 'linear',
    };

    const newLayer: Layer = {
      id: layerId,
      name: layerName,
      type,
      visible: true,
      locked: false,
      text: type === 'text' ? 'ENTER TEXT' : undefined,
      imageUrl: type === 'image' ? 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300' : undefined,
      keyframes: [defaultKf],
    };

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setActiveLayerId(layerId);
    setActiveTool('select');
  };

  // Capture freeform drawing vector coordinate paths
  const handleAddFreeformLayer = (points: Point[], center: Point) => {
    setIsPlaying(false);
    const prevProj = { ...project };
    pushHistory(prevProj);

    const layerCount = project.layers.filter(l => l.type === 'freeform').length + 1;
    const layerId = `layer-freeform-${Date.now()}`;
    const layerName = `Sketch ${layerCount}`;

    const defaultKf: Keyframe = {
      frame: currentFrame,
      x: center.x,
      y: center.y,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      color: '#2dd4bf', // Teal line
      strokeColor: '#2dd4bf',
      strokeWidth: 4,
      width: 100, // proxy bounds
      height: 100,
      fontSize: 24,
      easing: 'linear',
    };

    const newLayer: Layer = {
      id: layerId,
      name: layerName,
      type: 'freeform',
      visible: true,
      locked: false,
      freeformPoints: points,
      keyframes: [defaultKf],
    };

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setActiveLayerId(layerId);
  };

  // Direct element modifier (handles dragging on canvas, resizing handles, and static properties updates)
  const handleUpdateLayerProperty = (layerId: string, property: keyof Keyframe, value: any) => {
    setProject((prev) => {
      const layers = prev.layers.map((layer) => {
        if (layer.id !== layerId) return layer;

        // If modifying specific text or image values directly (non-interpolated strings)
        if (property === ('text' as any)) {
          return { ...layer, text: value };
        }
        if (property === ('imageUrl' as any)) {
          return { ...layer, imageUrl: value };
        }

        // Find or insert keyframe on current frame
        const keyframes = [...layer.keyframes];
        const existingIdx = keyframes.findIndex((kf) => kf.frame === currentFrame);

        if (existingIdx !== -1) {
          // Edit existing keyframe values
          keyframes[existingIdx] = {
            ...keyframes[existingIdx],
            [property]: value,
          };
        } else {
          // If no keyframe on this frame, interpolate all other active coordinates, and append a new keyframe
          const activeProps = getInterpolatedProperties(layer, currentFrame);
          const newKf: Keyframe = {
            frame: currentFrame,
            x: activeProps.x,
            y: activeProps.y,
            scaleX: activeProps.scaleX,
            scaleY: activeProps.scaleY,
            rotation: activeProps.rotation,
            opacity: activeProps.opacity,
            color: activeProps.color,
            strokeColor: activeProps.strokeColor,
            strokeWidth: activeProps.strokeWidth,
            width: activeProps.width,
            height: activeProps.height,
            fontSize: activeProps.fontSize,
            easing: activeProps.easing || 'linear',
            [property]: value, // Override with requested target edit
          };
          keyframes.push(newKf);
        }

        // Keep keyframes sorted by ascending frame index
        keyframes.sort((a, b) => a.frame - b.frame);

        return { ...layer, keyframes };
      });

      return { ...prev, layers };
    });
  };

  // Properties Panel callback wrapper
  const handleUpdateKeyframeProperty = (property: keyof Keyframe, value: any) => {
    if (!activeLayerId) return;
    handleUpdateLayerProperty(activeLayerId, property, value);
  };

  // Insert explicit manual keyframe at playhead index
  const handleInsertKeyframe = () => {
    if (!activeLayerId) return;
    const layer = project.layers.find(l => l.id === activeLayerId);
    if (!layer) return;

    // Check if keyframe already exists
    if (layer.keyframes.some(k => k.frame === currentFrame)) return;

    const prevProj = { ...project };
    pushHistory(prevProj);

    const activeProps = getInterpolatedProperties(layer, currentFrame);
    const newKf: Keyframe = {
      frame: currentFrame,
      x: activeProps.x,
      y: activeProps.y,
      scaleX: activeProps.scaleX,
      scaleY: activeProps.scaleY,
      rotation: activeProps.rotation,
      opacity: activeProps.opacity,
      color: activeProps.color,
      strokeColor: activeProps.strokeColor,
      strokeWidth: activeProps.strokeWidth,
      width: activeProps.width,
      height: activeProps.height,
      fontSize: activeProps.fontSize,
      easing: activeProps.easing || 'linear',
    };

    setProject((prev) => {
      const layers = prev.layers.map((l) => {
        if (l.id !== activeLayerId) return l;
        const keyframes = [...l.keyframes, newKf].sort((a, b) => a.frame - b.frame);
        return { ...l, keyframes };
      });
      return { ...prev, layers };
    });
  };

  // Remove keyframe at current frame
  const handleRemoveKeyframe = () => {
    if (!activeLayerId) return;
    const layer = project.layers.find(l => l.id === activeLayerId);
    if (!layer) return;

    // Must leave at least one keyframe to describe the layer!
    if (layer.keyframes.length <= 1) {
      alert("An object must have at least one keyframe in its timeline.");
      return;
    }

    const prevProj = { ...project };
    pushHistory(prevProj);

    setProject((prev) => {
      const layers = prev.layers.map((l) => {
        if (l.id !== activeLayerId) return l;
        const keyframes = l.keyframes.filter(k => k.frame !== currentFrame);
        return { ...l, keyframes };
      });
      return { ...prev, layers };
    });
  };

  const handleRemoveKeyframeAt = (layerId: string, frame: number) => {
    const layer = project.layers.find(l => l.id === layerId);
    if (!layer) return;

    if (layer.keyframes.length <= 1) {
      alert("An object must have at least one keyframe in its timeline.");
      return;
    }

    const prevProj = { ...project };
    pushHistory(prevProj);

    setProject((prev) => {
      const layers = prev.layers.map((l) => {
        if (l.id !== layerId) return l;
        return { ...l, keyframes: l.keyframes.filter(k => k.frame !== frame) };
      });
      return { ...prev, layers };
    });
  };

  // Slider support: drag and reposition a keyframe's frame index in real-time
  const handleMoveKeyframe = (layerId: string, fromFrame: number, toFrame: number) => {
    setProject((prev) => {
      const layers = prev.layers.map((l) => {
        if (l.id !== layerId) return l;

        // Check if there's already a keyframe at toFrame
        const collision = l.keyframes.some(k => k.frame === toFrame);
        if (collision) return l; // Block overlaps for drag safety

        const keyframes = l.keyframes.map((kf) => {
          if (kf.frame === fromFrame) {
            return { ...kf, frame: toFrame };
          }
          return kf;
        }).sort((a, b) => a.frame - b.frame);

        return { ...l, keyframes };
      });
      return { ...prev, layers };
    });
  };

  // Add explicit keyframe via double click on track cells
  const handleAddKeyframeAtFrame = (layerId: string, frame: number) => {
    const layer = project.layers.find(l => l.id === layerId);
    if (!layer) return;

    const prevProj = { ...project };
    pushHistory(prevProj);

    const activeProps = getInterpolatedProperties(layer, frame);
    const newKf: Keyframe = {
      frame,
      x: activeProps.x,
      y: activeProps.y,
      scaleX: activeProps.scaleX,
      scaleY: activeProps.scaleY,
      rotation: activeProps.rotation,
      opacity: activeProps.opacity,
      color: activeProps.color,
      strokeColor: activeProps.strokeColor,
      strokeWidth: activeProps.strokeWidth,
      width: activeProps.width,
      height: activeProps.height,
      fontSize: activeProps.fontSize,
      easing: activeProps.easing || 'linear',
    };

    setProject((prev) => {
      const layers = prev.layers.map((l) => {
        if (l.id !== layerId) return l;
        const keyframes = [...l.keyframes, newKf].sort((a, b) => a.frame - b.frame);
        return { ...l, keyframes };
      });
      return { ...prev, layers };
    });
  };

  // Layers controls: Visibility, Locks, Duplicate, Deletion, and Moving indexes
  const handleToggleVisibility = (id: string) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }));
  };

  const handleToggleLock = (id: string) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
    }));
  };

  const handleRenameLayer = (id: string, newName: string) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, name: newName } : l)),
    }));
  };

  const handleDuplicateLayer = (id: string) => {
    const layer = project.layers.find((l) => l.id === id);
    if (!layer) return;

    const prevProj = { ...project };
    pushHistory(prevProj);

    const duplicate: Layer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: `${layer.id}-copy-${Date.now()}`,
      name: `${layer.name} Copy`,
    };

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, duplicate],
    }));
  };

  const handleDeleteLayer = (id: string) => {
    const prevProj = { ...project };
    pushHistory(prevProj);

    setProject((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== id),
    }));

    if (activeLayerId === id) {
      setActiveLayerId(null);
    }
  };

  // Layer stack shifting (z-index ordering helper)
  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const index = project.layers.findIndex((l) => l.id === id);
    if (index === -1) return;

    const newLayers = [...project.layers];
    if (direction === 'up' && index < newLayers.length - 1) {
      // Swap with next index (brings it closer to the top visually)
      const temp = newLayers[index];
      newLayers[index] = newLayers[index + 1];
      newLayers[index + 1] = temp;
    } else if (direction === 'down' && index > 0) {
      // Swap with previous index (sends it further down visually)
      const temp = newLayers[index];
      newLayers[index] = newLayers[index - 1];
      newLayers[index - 1] = temp;
    }

    setProject((prev) => ({ ...prev, layers: newLayers }));
  };

  // 1. JSON Exporter (Save Project)
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_project.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 2. Import JSON Project (with Safety Guarantee Prompt Warning)
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Safety Guarantee: Always check before overwriting active work!
    if (project.layers.length > 0) {
      const confirmOverwrite = window.confirm(
        "SAFETY GUARANTEE CHECK:\nImporting a new project file will replace your active workspace elements. This action is irreversible unless you undo immediately.\n\nDo you want to proceed and load the selected project?"
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
        if (parsed.layers && parsed.fps && parsed.duration) {
          pushHistory(project);
          setProject(parsed);
          setActiveLayerId(parsed.layers[0]?.id || null);
          setCurrentFrame(0);
        } else {
          alert("Invalid project format. Ensure the JSON file contains layers, fps, and duration properties.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // 3. Capture Current Static Frame as PNG Image
  const handleExportPNGFrame = () => {
    const svgElement = document.getElementById('animation-svg-canvas') as any;
    if (!svgElement) return;

    try {
      setIsLoading(true);
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = project.width;
        canvas.height = project.height;
        const context = canvas.getContext('2d');
        if (context) {
          // Draw standard deep slate background color
          context.fillStyle = '#0f172a';
          context.fillRect(0, 0, project.width, project.height);
          context.drawImage(image, 0, 0);

          const pngData = canvas.toDataURL('image/png');
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', pngData);
          downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_frame_${currentFrame}.png`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        }
        window.URL.revokeObjectURL(blobURL);
        setIsLoading(false);
      };
      image.src = blobURL;
    } catch (err) {
      alert("Failed to render current frame as PNG.");
      setIsLoading(false);
    }
  };

  // 4. Sprite Sheet Exporter
  const handleExportSpriteSheet = () => {
    setIsLoading(true);
    setIsPlaying(false);

    // Prompt user to explain parameters
    const totalFramesCount = Math.min(project.fps * project.duration, 100); // Caps for canvas limits
    const confirmSheet = window.confirm(
      `SPRITE SHEET EXPORTER:\n\nThis will combine ${totalFramesCount} animation frames into a single, combined image grid (sheet). Perfect for web/game engine integration.\n\nDo you want to proceed?`
    );
    if (!confirmSheet) {
      setIsLoading(false);
      return;
    }

    // Capture states of ALL frames in sequence
    setTimeout(async () => {
      try {
        const cols = Math.ceil(Math.sqrt(totalFramesCount));
        const rows = Math.ceil(totalFramesCount / cols);

        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = cols * project.width;
        compositeCanvas.height = rows * project.height;
        const ctx = compositeCanvas.getContext('2d');
        if (!ctx) throw new Error("Could not acquire 2D canvas context");

        ctx.fillStyle = '#0f172a'; // Clear dark canvas bg
        ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

        // Map and resolve images of each frame
        const svgElement = document.getElementById('animation-svg-canvas') as any;
        if (!svgElement) throw new Error("SVG Canvas not found");

        for (let frameIdx = 0; frameIdx < totalFramesCount; frameIdx++) {
          // Setup state of frame
          setCurrentFrame(frameIdx);
          await new Promise(resolve => setTimeout(resolve, 50)); // Allow DOM to repaint

          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const blobURL = window.URL.createObjectURL(svgBlob);

          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const colIdx = frameIdx % cols;
              const rowIdx = Math.floor(frameIdx / cols);
              ctx.drawImage(img, colIdx * project.width, rowIdx * project.height);
              window.URL.revokeObjectURL(blobURL);
              resolve();
            };
            img.onerror = reject;
            img.src = blobURL;
          });
        }

        // Export resulting sheet
        const sheetData = compositeCanvas.toDataURL('image/png');
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', sheetData);
        downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_spritesheet.png`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setCurrentFrame(0); // Rewind
      } catch (err) {
        alert("Failed to render full spritesheet.");
      } finally {
        setIsLoading(false);
      }
    }, 150);
  };

  // 5. Browser Playable Animation Data Exporter (Outputs a fully playable autonomous HTML document)
  const handleExportPlayableHTML = () => {
    setIsLoading(true);
    try {
      const templateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playable Vector Animation: ${project.name}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0b0f19;
            color: #ffffff;
            font-family: system-ui, sans-serif;
            display: flex;
            flex-col;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
        }
        #container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            background: #111827;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
            border: 1px solid #1f2937;
        }
        #stage-wrapper {
            background-color: #0f172a;
            border-radius: 8px;
            overflow: hidden;
            width: ${project.width}px;
            height: ${project.height}px;
            position: relative;
        }
        svg {
            width: 100%;
            height: 100%;
        }
        #title {
            font-weight: 800;
            font-size: 1.25rem;
            letter-spacing: 0.05em;
        }
        #credits {
            font-size: 0.75rem;
            color: #6b7280;
        }
        #controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        button {
            background: #10b981;
            color: #0b0f19;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            font-size: 0.85rem;
            transition: opacity 0.15s;
        }
        button:hover {
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="title">${project.name}</div>
        <div id="stage-wrapper">
           <svg id="canvas" viewBox="0 0 ${project.width} ${project.height}"></svg>
        </div>
        <div id="controls">
            <button id="playBtn">Pause</button>
            <span id="frameCounter">Frame: 0</span>
        </div>
        <div id="credits">Powered by Omni-Science • Developed by king_of_coding</div>
    </div>

    <script>
        const project = ${JSON.stringify(project)};
        const totalFrames = Math.max(12, project.fps * project.duration);
        let currentFrame = 0;
        let isPlaying = true;
        const svgCanvas = document.getElementById('canvas');
        const playBtn = document.getElementById('playBtn');
        const frameCounter = document.getElementById('frameCounter');

        // Linear interpolation helper
        function interpolate(a, b, t) {
            return a + (b - a) * t;
        }

        // Color interpolation helper
        function parseHex(hex) {
            let clean = hex.replace('#', '');
            if (clean.length === 3) {
                clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
            }
            const num = parseInt(clean, 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
        }
        function toHex(r, g, b) {
            const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
            return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
        }
        function interpolateColor(color1, color2, t) {
            try {
                const c1 = parseHex(color1);
                const c2 = parseHex(color2);
                return toHex(
                    c1.r + (c2.r - c1.r) * t,
                    c1.g + (c2.g - c1.g) * t,
                    c1.b + (c2.b - c1.b) * t
                );
            } catch(e) { return color1; }
        }

        function applyEasing(t, easing) {
            if (easing === 'ease-in') return t * t;
            if (easing === 'ease-out') return t * (2 - t);
            if (easing === 'ease-in-out') return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            return t; // linear
        }

        function getInterpolatedProperties(layer, frame) {
            const sorted = [...layer.keyframes].sort((a,b) => a.frame - b.frame);
            if (sorted.length === 0) return {};
            if (frame <= sorted[0].frame) return sorted[0];
            if (frame >= sorted[sorted.length - 1].frame) return sorted[sorted.length - 1];

            let prev = sorted[0], next = sorted[sorted.length - 1];
            for (let i = 0; i < sorted.length - 1; i++) {
                if (sorted[i].frame <= frame && sorted[i+1].frame >= frame) {
                    prev = sorted[i];
                    next = sorted[i+1];
                    break;
                }
            }

            const t = (frame - prev.frame) / (next.frame - prev.frame);
            const tE = applyEasing(t, prev.easing || 'linear');

            return {
                x: interpolate(prev.x, next.x, tE),
                y: interpolate(prev.y, next.y, tE),
                scaleX: interpolate(prev.scaleX, next.scaleX, tE),
                scaleY: interpolate(prev.scaleY, next.scaleY, tE),
                rotation: interpolate(prev.rotation, next.rotation, tE),
                opacity: interpolate(prev.opacity, next.opacity, tE),
                width: interpolate(prev.width, next.width, tE),
                height: interpolate(prev.height, next.height, tE),
                fontSize: interpolate(prev.fontSize, next.fontSize, tE),
                strokeWidth: interpolate(prev.strokeWidth, next.strokeWidth, tE),
                color: interpolateColor(prev.color, next.color, tE),
                strokeColor: interpolateColor(prev.strokeColor, next.strokeColor, tE),
            };
        }

        function renderFrame() {
            svgCanvas.innerHTML = '';
            frameCounter.textContent = 'Frame: ' + currentFrame;

            project.layers.forEach((layer) => {
                if (!layer.visible) return;
                const props = getInterpolatedProperties(layer, currentFrame);

                let element;
                if (layer.type === 'circle') {
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    element.setAttribute('cx', props.x);
                    element.setAttribute('cy', props.y);
                    element.setAttribute('r', props.width / 2);
                    element.setAttribute('fill', props.color);
                    element.setAttribute('stroke', props.strokeColor);
                    element.setAttribute('stroke-width', props.strokeWidth);
                    element.setAttribute('transform', 'rotate(' + props.rotation + ' ' + props.x + ' ' + props.y + ')');
                } else if (layer.type === 'square' || layer.type === 'rectangle') {
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    element.setAttribute('x', props.x - props.width / 2);
                    element.setAttribute('y', props.y - props.height / 2);
                    element.setAttribute('width', props.width);
                    element.setAttribute('height', props.height);
                    element.setAttribute('fill', props.color);
                    element.setAttribute('stroke', props.strokeColor);
                    element.setAttribute('stroke-width', props.strokeWidth);
                    element.setAttribute('transform', 'rotate(' + props.rotation + ' ' + props.x + ' ' + props.y + ')');
                } else if (layer.type === 'line') {
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    element.setAttribute('x1', props.x - props.width/2);
                    element.setAttribute('y1', props.y);
                    element.setAttribute('x2', props.x + props.width/2);
                    element.setAttribute('y2', props.y);
                    element.setAttribute('stroke', props.color);
                    element.setAttribute('stroke-width', props.strokeWidth);
                    element.setAttribute('transform', 'rotate(' + props.rotation + ' ' + props.x + ' ' + props.y + ')');
                } else if (layer.type === 'text') {
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    element.setAttribute('x', props.x);
                    element.setAttribute('y', props.y);
                    element.setAttribute('fill', props.color);
                    element.setAttribute('font-size', props.fontSize);
                    element.setAttribute('text-anchor', 'middle');
                    element.setAttribute('dominant-baseline', 'central');
                    element.setAttribute('transform', 'rotate(' + props.rotation + ' ' + props.x + ' ' + props.y + ')');
                    element.textContent = layer.text || 'TEXT';
                } else if (layer.type === 'image') {
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                    element.setAttribute('href', layer.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200');
                    element.setAttribute('x', props.x - props.width/2);
                    element.setAttribute('y', props.y - props.height/2);
                    element.setAttribute('width', props.width);
                    element.setAttribute('height', props.height);
                    element.setAttribute('transform', 'rotate(' + props.rotation + ' ' + props.x + ' ' + props.y + ')');
                } else if (layer.type === 'freeform') {
                    if (!layer.freeformPoints) return;
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const d = layer.freeformPoints.map((p, i) => (i===0 ? 'M':'L') + ' ' + p.x + ' ' + p.y).join(' ');
                    element.setAttribute('d', d);
                    element.setAttribute('fill', 'none');
                    element.setAttribute('stroke', props.color);
                    element.setAttribute('stroke-width', props.strokeWidth);
                    element.setAttribute('transform', 'translate(' + props.x + ',' + props.y + ') rotate(' + props.rotation + ') scale(' + props.scaleX + ',' + props.scaleY + ')');
                }

                if (element) {
                    element.setAttribute('opacity', props.opacity);
                    svgCanvas.appendChild(element);
                }
            });
        }

        // Timer Loop
        let lastTime = performance.now();
        const interval = 1000 / project.fps;

        function tick(now) {
            if (!isPlaying) return;
            const elapsed = now - lastTime;
            if (elapsed >= interval) {
                lastTime = now - (elapsed % interval);
                currentFrame = (currentFrame + 1) % totalFrames;
                renderFrame();
            }
            requestAnimationFrame(tick);
        }

        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playBtn.textContent = isPlaying ? 'Pause' : 'Play';
            if (isPlaying) {
                lastTime = performance.now();
                requestAnimationFrame(tick);
            }
        });

        renderFrame();
        requestAnimationFrame(tick);
    </script>
</body>
</html>`;

      const blob = new Blob([templateHTML], { type: 'text/html' });
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', window.URL.createObjectURL(blob));
      downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_playable_player.html`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert("Failed to export standalone playable animation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans select-none overflow-x-hidden antialiased">
      
      {/* Immersive User Guide Manual modal */}
      <UserGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

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
                  onChange={(e) => setProject(p => ({ ...p, name: e.target.value }))}
                  className="bg-transparent text-base sm:text-lg font-sans font-black tracking-tight text-white focus:outline-none focus:bg-slate-900/60 rounded px-2 py-0.5 border border-transparent hover:border-slate-800/80 focus:border-teal-500"
                />
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  V2D ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono pl-2">
                Owned by <span className="text-teal-400">Omni-Science</span> • Author: <span className="text-slate-200">king_of_coding</span>
              </p>
            </div>
          </div>

          {/* Export Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Import Project */}
            <div className="relative group">
              <button
                id="header-import-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-850 text-xs font-sans font-bold flex items-center gap-2 transition-all active:translate-y-[1px] shadow-lg shadow-black/40 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">Open Project</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <div className="absolute right-0 top-11 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 w-60 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] text-slate-400 leading-normal">
                <strong>Open Project (JSON):</strong> Selects and parses a saved vector workspace database file, reconstructing your layers and timelines fully.
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
                <span className="hidden md:inline">Save Project</span>
              </button>
              <div className="absolute right-0 top-11 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 w-60 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] text-slate-400 leading-normal">
                <strong>Save Project (JSON):</strong> Downloads all layer shapes, point lists, coordinates, and keyframe intervals safely onto your machine.
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
                <strong>Export PNG:</strong> Rasterizes and downloads a snapshot image of the canvas layout state at your active frame position.
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
                <strong>Export Spritesheet:</strong> Iterates over every frame of your timeline, packaging each layout side-by-side into a single combined sprite grid.
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
          <span className="text-xs font-mono text-slate-200">Processing vector layout...</span>
        </div>
      )}

      {/* 2. Main Creator Workspace Dashboard Grid Layout */}
      <main id="workspace-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-[#020617]">
        
        {/* Left: Shape adding tool drawer */}
        <ToolPanel
          onAddShape={handleAddShape}
          onOpenGuide={() => setIsGuideOpen(true)}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          gridSnap={gridSnap}
          setGridSnap={setGridSnap}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
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
            onSelectLayer={(id) => {
              setActiveTool('select');
              setActiveLayerId(id);
            }}
            onAddFreeformLayer={handleAddFreeformLayer}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            projectWidth={project.width}
            projectHeight={project.height}
          />

          {/* Timeline and Frame Tick Grid */}
          <Timeline
            layers={project.layers}
            activeLayerId={activeLayerId}
            currentFrame={currentFrame}
            setCurrentFrame={setCurrentFrame}
            onionSkinEnabled={onionSkinEnabled}
            setOnionSkinEnabled={setOnionSkinEnabled}
            fps={project.fps}
            setFps={(f) => setProject((p) => ({ ...p, fps: f }))}
            duration={project.duration}
            setDuration={(d) => setProject((p) => ({ ...p, duration: d }))}
            onAddKeyframe={handleAddKeyframeAtFrame}
            onRemoveKeyframeAt={handleRemoveKeyframeAt}
            onMoveKeyframe={handleMoveKeyframe}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

        </div>

        {/* Right Stack Sidebar: Layers order & Attributes properties inputs */}
        <div id="right-workspace-sidebar" className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 bg-slate-900 divide-y divide-slate-800/80 overflow-y-auto">
          {/* Layers system */}
          <LayersPanel
            layers={project.layers}
            activeLayerId={activeLayerId}
            onSelectLayer={(id) => {
              setActiveTool('select');
              setActiveLayerId(id);
            }}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onRenameLayer={handleRenameLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            onMoveLayer={handleMoveLayer}
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
