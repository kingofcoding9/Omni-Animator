/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Hand, 
  MousePointer, 
  Grid,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Layer, Keyframe, Point } from '../types';
import { getInterpolatedProperties } from '../utils/animation';

interface AnimationStageProps {
  layers: Layer[];
  activeLayerId: string | null;
  currentFrame: number;
  onionSkinEnabled: boolean;
  gridSnap: boolean;
  onUpdateLayerProperty: (layerId: string, property: keyof Keyframe, value: any) => void;
  onSelectLayer: (id: string | null) => void;
  onAddFreeformLayer: (points: Point[], center: Point) => void;
  activeTool: 'circle' | 'square' | 'rectangle' | 'line' | 'text' | 'image' | 'freeform' | 'select' | 'drawing';
  setActiveTool: (tool: any) => void;
  projectWidth: number;
  projectHeight: number;
}

export default function AnimationStage({
  layers,
  activeLayerId,
  currentFrame,
  onionSkinEnabled,
  gridSnap,
  onUpdateLayerProperty,
  onSelectLayer,
  onAddFreeformLayer,
  activeTool,
  setActiveTool,
  projectWidth,
  projectHeight,
}: AnimationStageProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isPanningMode, setIsPanningMode] = useState<boolean>(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Dragging states
  const dragInfo = useRef<{
    type: 'move' | 'resize' | 'rotate' | 'pan' | 'draw' | null;
    startX: number;
    startY: number;
    startLayerX: number;
    startLayerY: number;
    startWidth: number;
    startHeight: number;
    startRotation: number;
    startPanX: number;
    startPanY: number;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startLayerX: 0,
    startLayerY: 0,
    startWidth: 100,
    startHeight: 100,
    startRotation: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const activeProps = activeLayer ? getInterpolatedProperties(activeLayer, currentFrame) : null;

  // Track spacebar for quick panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPanningMode(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanningMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Center stage inside parent container on load
  useEffect(() => {
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      setPanX((containerW - projectWidth) / 2);
      setPanY((containerH - projectHeight) / 2);
    }
  }, [projectWidth, projectHeight]);

  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, prev - 0.15));
  const handleZoomReset = () => {
    setZoom(1);
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      setPanX((containerW - projectWidth) / 2);
      setPanY((containerH - projectHeight) / 2);
    }
  };

  // Get client relative points taking zoom and pan into account
  const getStageCoords = (clientX: number, clientY: number): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  };

  // Interaction handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>, dragType: 'move' | 'resize' | 'rotate' | 'pan' | null) => {
    e.preventDefault();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const actualDragType = isPanningMode || activeTool === 'drawing' ? (activeTool === 'drawing' ? 'draw' : 'pan') : dragType;

    if (!actualDragType) {
      // Clicked on empty area, deselect or pan
      if (activeTool === 'select') {
        onSelectLayer(null);
        dragInfo.current = {
          ...dragInfo.current,
          type: 'pan',
          startX: clientX,
          startY: clientY,
          startPanX: panX,
          startPanY: panY,
        };
      }
      return;
    }

    if (actualDragType === 'pan') {
      dragInfo.current = {
        ...dragInfo.current,
        type: 'pan',
        startX: clientX,
        startY: clientY,
        startPanX: panX,
        startPanY: panY,
      };
    } else if (actualDragType === 'draw') {
      const coords = getStageCoords(clientX, clientY);
      setDrawingPoints([coords]);
      dragInfo.current = {
        ...dragInfo.current,
        type: 'draw',
        startX: clientX,
        startY: clientY,
      };
    } else if (activeLayer && activeProps && !activeLayer.locked) {
      dragInfo.current = {
        ...dragInfo.current,
        type: actualDragType,
        startX: clientX,
        startY: clientY,
        startLayerX: activeProps.x,
        startLayerY: activeProps.y,
        startWidth: activeProps.width,
        startHeight: activeProps.height,
        startRotation: activeProps.rotation,
      };
    }

    // Attach listeners
    const onMove = (moveEvt: MouseEvent | TouchEvent) => {
      const moveTouch = 'touches' in moveEvt;
      // Handle multi-touch gesture filter
      if (moveTouch && moveEvt.touches.length === 0) return;
      const currentX = moveTouch ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const currentY = moveTouch ? moveEvt.touches[0].clientY : moveEvt.clientY;

      const type = dragInfo.current.type;
      if (type === 'pan') {
        const dx = currentX - dragInfo.current.startX;
        const dy = currentY - dragInfo.current.startY;
        setPanX(dragInfo.current.startPanX + dx);
        setPanY(dragInfo.current.startPanY + dy);
      } else if (type === 'draw') {
        const coords = getStageCoords(currentX, currentY);
        setDrawingPoints(prev => [...prev, coords]);
      } else if (activeLayer && activeProps && !activeLayer.locked) {
        const dx = (currentX - dragInfo.current.startX) / zoom;
        const dy = (currentY - dragInfo.current.startY) / zoom;

        if (type === 'move') {
          let newX = dragInfo.current.startLayerX + dx;
          let newY = dragInfo.current.startLayerY + dy;

          if (gridSnap) {
            newX = Math.round(newX / 10) * 10;
            newY = Math.round(newY / 10) * 10;
          }

          onUpdateLayerProperty(activeLayer.id, 'x', newX);
          onUpdateLayerProperty(activeLayer.id, 'y', newY);
        } else if (type === 'resize') {
          // Precise trigonometry sizing for rotated shapes!
          const theta = dragInfo.current.startRotation * (Math.PI / 180);
          
          // Project delta onto layer's local axes
          const ldx = dx * Math.cos(theta) + dy * Math.sin(theta);
          const ldy = -dx * Math.sin(theta) + dy * Math.cos(theta);

          let newW = dragInfo.current.startWidth + ldx * 2;
          let newH = dragInfo.current.startHeight + ldy * 2;

          newW = Math.max(10, newW);
          newH = Math.max(10, newH);

          if (gridSnap) {
            newW = Math.round(newW / 10) * 10;
            newH = Math.round(newH / 10) * 10;
          }

          onUpdateLayerProperty(activeLayer.id, 'width', newW);
          onUpdateLayerProperty(activeLayer.id, 'height', newH);
        } else if (type === 'rotate') {
          // Rotate shape based on angle of mouse from shape's center
          if (svgRef.current) {
            const svgRect = svgRef.current.getBoundingClientRect();
            // shape center in client space
            const centerX = svgRect.left + (dragInfo.current.startLayerX * zoom);
            const centerY = svgRect.top + (dragInfo.current.startLayerY * zoom);

            const startAngle = Math.atan2(
              dragInfo.current.startY - centerY,
              dragInfo.current.startX - centerX
            );
            const currentAngle = Math.atan2(
              currentY - centerY,
              currentX - centerX
            );

            const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
            let newRotation = dragInfo.current.startRotation + angleDiff;

            // Snap rotation to 15 degrees if snap enabled
            if (gridSnap) {
              newRotation = Math.round(newRotation / 15) * 15;
            }

            onUpdateLayerProperty(activeLayer.id, 'rotation', newRotation);
          }
        }
      }
    };

    const onUp = () => {
      if (dragInfo.current.type === 'draw') {
        finishDrawing();
      }
      dragInfo.current.type = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const finishDrawing = () => {
    if (drawingPoints.length < 3) {
      setDrawingPoints([]);
      return;
    }

    // Find bounding box to normalize path coordinate centers
    const xs = drawingPoints.map(p => p.x);
    const ys = drawingPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Shift all points so they are relative to the center
    const relativePoints = drawingPoints.map(p => ({
      x: p.x - centerX,
      y: p.y - centerY,
    }));

    onAddFreeformLayer(relativePoints, { x: centerX, y: centerY });
    setDrawingPoints([]);
    setActiveTool('select');
  };

  // Render a specific layer's vector elements
  const renderLayerShape = (layer: Layer, props: Omit<Keyframe, 'frame'>, index: number, isGhost: boolean = false, ghostTint: string | null = null) => {
    if (!layer.visible && !isGhost) return null;

    const baseOpacity = props.opacity ?? 1;
    const finalOpacity = isGhost ? 0.25 : baseOpacity;
    const fillColor = ghostTint ? ghostTint : props.color;
    const strokeColor = ghostTint ? ghostTint : props.strokeColor;
    const strokeWidth = props.strokeWidth ?? 2;

    const sharedProps = {
      opacity: finalOpacity,
      onClick: (e: React.MouseEvent) => {
        if (isGhost || layer.locked) return;
        e.stopPropagation();
        onSelectLayer(layer.id);
      },
      className: `transition-all duration-75 ${isGhost ? '' : 'cursor-pointer hover:stroke-teal-400/40'}`,
      style: { pointerEvents: isGhost || isPanningMode || activeTool === 'drawing' ? 'none' : 'auto' } as React.CSSProperties
    };

    switch (layer.type) {
      case 'circle': {
        const radius = props.width / 2;
        return (
          <circle
            key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}
            id={`shape-circle-${layer.id}`}
            cx={props.x}
            cy={props.y}
            r={radius}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
            {...sharedProps}
          />
        );
      }
      case 'square':
      case 'rectangle': {
        const xOffset = props.x - props.width / 2;
        const yOffset = props.y - props.height / 2;
        return (
          <rect
            key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}
            id={`shape-rect-${layer.id}`}
            x={xOffset}
            y={yOffset}
            width={props.width}
            height={props.height}
            rx={layer.type === 'square' ? props.width * 0.05 : 0} // visual roundness for square
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
            {...sharedProps}
          />
        );
      }
      case 'line': {
        const x1 = props.x - props.width / 2;
        const x2 = props.x + props.width / 2;
        const y = props.y;
        return (
          <line
            key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}
            id={`shape-line-${layer.id}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={fillColor} // line uses main color as stroke
            strokeWidth={strokeWidth || 4}
            strokeLinecap="round"
            transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
            {...sharedProps}
          />
        );
      }
      case 'text': {
        return (
          <text
            key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}
            id={`shape-text-${layer.id}`}
            x={props.x}
            y={props.y}
            fill={fillColor}
            stroke={strokeWidth > 0 ? strokeColor : 'none'}
            strokeWidth={strokeWidth}
            fontSize={props.fontSize}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
            {...sharedProps}
          >
            {layer.text || 'TEXT'}
          </text>
        );
      }
      case 'image': {
        const xOffset = props.x - props.width / 2;
        const yOffset = props.y - props.height / 2;
        const defaultImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200';
        return (
          <g key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}>
            <image
              id={`shape-image-${layer.id}`}
              href={layer.imageUrl || defaultImg}
              x={xOffset}
              y={yOffset}
              width={props.width}
              height={props.height}
              transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
              preserveAspectRatio="xMidYMid slice"
              {...sharedProps}
            />
            {/* Draw a subtle boundary border for sprite positioning helper */}
            {!isGhost && activeLayerId === layer.id && (
              <rect
                x={xOffset}
                y={yOffset}
                width={props.width}
                height={props.height}
                fill="none"
                stroke="#fda4af"
                strokeWidth="1"
                transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
                style={{ pointerEvents: 'none' }}
              />
            )}
          </g>
        );
      }
      case 'freeform': {
        if (!layer.freeformPoints || layer.freeformPoints.length === 0) return null;
        
        // Construct standard SVG path data relative to center
        const pathData = layer.freeformPoints.map((p, i) => 
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');

        return (
          <path
            key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}
            id={`shape-path-${layer.id}`}
            d={pathData}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeWidth || 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`translate(${props.x}, ${props.y}) rotate(${props.rotation}) scale(${props.scaleX}, ${props.scaleY})`}
            {...sharedProps}
          />
        );
      }
      default:
        return null;
    }
  };

  // Render active selection outlines and edit handlers
  const renderSelectionHandles = () => {
    if (!activeLayer || !activeProps || activeLayer.locked || activeTool === 'drawing') return null;

    const { x, y, width, height, rotation } = activeProps;
    
    // Selection coordinates centered at 0, 0 since we apply parent translation/rotation group
    const left = -width / 2;
    const top = -height / 2;
    const right = width / 2;
    const bottom = height / 2;

    return (
      <g 
        id="selection-group"
        transform={`translate(${x}, ${y}) rotate(${rotation})`}
      >
        {/* Bounding box outline */}
        <rect
          id="selection-outline"
          x={left}
          y={top}
          width={width}
          height={height}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          style={{ pointerEvents: 'none' }}
        />

        {/* Center Move Handle */}
        <circle
          id="handle-center-move"
          cx={0}
          cy={0}
          r="6"
          className="fill-teal-400 stroke-slate-900 cursor-move hover:scale-125 transition-transform"
          strokeWidth="1.5"
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          onTouchStart={(e) => handleMouseDown(e, 'move')}
          title="Drag to Move"
        />

        {/* Rotation Connector Line */}
        <line
          x1={0}
          y1={top}
          x2={0}
          y2={top - 25}
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="2,2"
          style={{ pointerEvents: 'none' }}
        />

        {/* Rotation Handle */}
        <circle
          id="handle-rotate"
          cx={0}
          cy={top - 25}
          r="7"
          className="fill-amber-400 stroke-slate-900 cursor-alias hover:scale-125 transition-transform shadow"
          strokeWidth="1.5"
          onMouseDown={(e) => handleMouseDown(e, 'rotate')}
          onTouchStart={(e) => handleMouseDown(e, 'rotate')}
          title="Drag to Rotate"
        />

        {/* Resize Handle (Bottom-Right Corner) */}
        <rect
          id="handle-resize-corner"
          x={right - 5}
          y={bottom - 5}
          width="10"
          height="10"
          className="fill-teal-400 stroke-slate-900 cursor-se-resize hover:scale-125 transition-transform shadow"
          strokeWidth="1.5"
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
          onTouchStart={(e) => handleMouseDown(e, 'resize')}
          title="Drag to Resize"
        />
      </g>
    );
  };

  return (
    <div id="animation-stage-viewport" className="flex-1 bg-slate-950 flex flex-col min-h-[350px] relative overflow-hidden group select-none border border-slate-800 rounded-2xl">
      
      {/* Stage Header / Toolbar */}
      <div id="stage-control-bar" className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        
        {/* Left: Mode Indicators */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
            {activeTool === 'drawing' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-teal-300">DRAWING PATH MODE</span>
              </>
            ) : isPanningMode ? (
              <>
                <Hand className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] font-mono font-bold text-sky-300">PAN CANVAS MODE</span>
              </>
            ) : (
              <>
                <MousePointer className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-mono font-bold text-slate-300">SELECT &amp; TWEEN MODE</span>
              </>
            )}
          </div>
          
          {/* Active Layer Label */}
          {activeLayer && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-lg backdrop-blur-sm text-[10px] text-slate-300 font-sans">
              <span>Target:</span>
              <strong className="text-white font-semibold">{activeLayer.name}</strong>
              {activeLayer.locked && <span className="text-amber-500">(Locked)</span>}
            </div>
          )}
        </div>

        {/* Right: Stage Canvas View Settings */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-lg backdrop-blur-sm">
          <button
            id="zoom-out-btn"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            id="zoom-reset-btn"
            onClick={handleZoomReset}
            className="text-[10px] font-mono text-slate-300 font-bold px-2 py-1 rounded hover:bg-slate-800"
            title="Reset Pan and Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            id="zoom-in-btn"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            id="pan-mode-btn"
            onClick={() => setIsPanningMode(!isPanningMode)}
            className={`p-1.5 rounded-lg transition-colors ${
              isPanningMode ? 'bg-teal-500/10 text-teal-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Pan Tool (Hold Spacebar)"
          >
            <Hand className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Drag/Drop Zoom Interactive Arena */}
      <div 
        id="stage-outer-container"
        ref={containerRef}
        className={`flex-1 relative overflow-hidden ${
          isPanningMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onMouseDown={(e) => handleMouseDown(e, null)}
        onTouchStart={(e) => handleMouseDown(e, null)}
      >
        
        {/* Render grid pattern in background if snap enabled */}
        <div 
          id="stage-grid-backdrop"
          className="absolute inset-0 transition-opacity duration-150"
          style={{
            backgroundImage: 'radial-gradient(rgba(38, 79, 110, 0.2) 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${panX}px ${panY}px`,
            pointerEvents: 'none',
          }}
        />

        {/* Scalable Stage Card */}
        <div 
          id="stage-canvas-card"
          className="absolute bg-slate-900 border border-slate-800 shadow-2xl rounded"
          style={{
            width: projectWidth,
            height: projectHeight,
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Main SVG Vector Canvas */}
          <svg
            id="animation-svg-canvas"
            ref={svgRef}
            width={projectWidth}
            height={projectHeight}
            className="w-full h-full overflow-visible"
            style={{ touchAction: 'none' }}
          >
            {/* Onion Skin Background layers (Previous and Next keyframe interpolation states) */}
            {onionSkinEnabled && currentFrame > 0 && (
              <g id="onion-skin-prev">
                {layers.map((layer, index) => {
                  const props = getInterpolatedProperties(layer, currentFrame - 1);
                  return renderLayerShape(layer, props, index, true, '#ef4444'); // Tint red
                })}
              </g>
            )}

            {onionSkinEnabled && (
              <g id="onion-skin-next">
                {layers.map((layer, index) => {
                  const props = getInterpolatedProperties(layer, currentFrame + 1);
                  return renderLayerShape(layer, props, index, true, '#10b981'); // Tint green
                })}
              </g>
            )}

            {/* Static Grid Guide Lines */}
            {gridSnap && (
              <g id="grid-guides" style={{ pointerEvents: 'none', opacity: 0.15 }}>
                {Array.from({ length: Math.ceil(projectWidth / 50) }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * 50}
                    y1={0}
                    x2={i * 50}
                    y2={projectHeight}
                    stroke="#2dd4bf"
                    strokeWidth="1"
                  />
                ))}
                {Array.from({ length: Math.ceil(projectHeight / 50) }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * 50}
                    x2={projectWidth}
                    y2={i * 50}
                    stroke="#2dd4bf"
                    strokeWidth="1"
                  />
                ))}
              </g>
            )}

            {/* Primary Render Stack */}
            <g id="layers-render-stack">
              {layers.map((layer, index) => {
                const props = getInterpolatedProperties(layer, currentFrame);
                return renderLayerShape(layer, props, index);
              })}
            </g>

            {/* Selection handle overlays */}
            {renderSelectionHandles()}

            {/* Freeform Live Stroke Drawing line */}
            {activeTool === 'drawing' && drawingPoints.length > 0 && (
              <g id="live-drawing-preview" style={{ pointerEvents: 'none' }}>
                <path
                  d={drawingPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </svg>
        </div>

      </div>

      {/* Drawing Mode Info Banner Footer */}
      {activeTool === 'drawing' && (
        <div id="drawing-banner" className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-teal-500 text-slate-950 text-xs font-sans font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Click &amp; drag on canvas to paint a custom vector shape!</span>
        </div>
      )}

    </div>
  );
}
