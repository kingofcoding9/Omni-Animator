import React from 'react';
import { Layer, Keyframe, Point } from '../types';
import { getAssetOrUrl } from './svgSceneRenderer';

interface RenderLayerProps {
  layer: Layer;
  props: Omit<Keyframe, 'frame'>;
  index: number;
  isGhost: boolean;
  activeLayerId: string | null;
  assets: any[];
}

export function RenderLayer({
  layer,
  props,
  index,
  isGhost,
  activeLayerId,
  assets,
}: RenderLayerProps) {
  const fillColor = props.color;
  const strokeColor = props.strokeColor;
  const strokeWidth = props.strokeWidth;
  const opacity = props.opacity;

  const sharedProps = {
    opacity,
    style: {
      cursor: layer.locked ? 'not-allowed' : 'pointer',
      pointerEvents: isGhost ? 'none' : 'auto' as const,
    },
  };

  switch (layer.type) {
    case 'circle': {
      const radius = Math.max(0, props.width / 2);
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
      const rx = layer.type === 'square'
        ? (props.borderRadius !== undefined ? props.borderRadius : props.width * 0.05)
        : (props.borderRadius || 0);

      return (
        <rect
          key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}
          id={`shape-rect-${layer.id}`}
          x={xOffset}
          y={yOffset}
          width={props.width}
          height={props.height}
          rx={rx}
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
          stroke={fillColor}
          strokeWidth={strokeWidth || 4}
          strokeLinecap="round"
          transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
          {...sharedProps}
        />
      );
    }
    case 'text': {
      const fontWeight = props.fontWeight || 'bold';
      const textAnchor = props.textAlign === 'left' ? 'start' : props.textAlign === 'right' ? 'end' : 'middle';
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
          fontWeight={fontWeight}
          textAnchor={textAnchor}
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
      const imgSource = getAssetOrUrl(layer.imageUrl, assets);
      const defaultImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200';
      return (
        <g key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}>
          <image
            id={`shape-image-${layer.id}`}
            href={imgSource || defaultImg}
            x={xOffset}
            y={yOffset}
            width={props.width}
            height={props.height}
            transform={`rotate(${props.rotation}, ${props.x}, ${props.y})`}
            preserveAspectRatio="xMidYMid slice"
            {...sharedProps}
          />
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

      let pathData = '';
      const points = layer.freeformPoints;
      
      if (!layer.freeformSmoothing || points.length < 3) {
        pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      } else {
        pathData = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length - 2; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          pathData += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
        }
        pathData += ` Q ${points[points.length - 2].x} ${points[points.length - 2].y}, ${points[points.length - 1].x} ${points[points.length - 1].y}`;
      }

      // For freeform we often use strokeColor instead of fillColor for the lines
      const activeStroke = strokeWidth > 0 ? strokeColor : fillColor;

      return (
        <path
          key={`${layer.id}-${index}-${isGhost ? 'ghost' : 'real'}`}
          id={`shape-path-${layer.id}`}
          d={pathData}
          fill={fillColor === 'transparent' ? 'none' : fillColor}
          stroke={activeStroke}
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
}
