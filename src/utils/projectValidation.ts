import { Project, Layer, Keyframe, ProjectAsset } from '../types';

/**
 * Validates and migrates raw JSON input into a safe and fully compatible Project structure.
 * Throws a friendly, human-readable error if the data is corrupt or completely invalid.
 */
export function validateAndMigrateProject(rawInput: any): Project {
  if (!rawInput || typeof rawInput !== 'object') {
    throw new Error('Import failed: File is not a valid JSON object.');
  }

  // Basic properties
  const name = typeof rawInput.name === 'string' ? rawInput.name.trim() : 'Unnamed Project';
  const fps = Number.isInteger(rawInput.fps) && rawInput.fps > 0 ? rawInput.fps : 24;
  const duration = typeof rawInput.duration === 'number' && rawInput.duration > 0 ? rawInput.duration : 4;
  const width = typeof rawInput.width === 'number' && rawInput.width > 0 ? rawInput.width : 800;
  const height = typeof rawInput.height === 'number' && rawInput.height > 0 ? rawInput.height : 500;
  const backgroundColor = typeof rawInput.backgroundColor === 'string' ? rawInput.backgroundColor : '#020617';
  const id = typeof rawInput.id === 'string' ? rawInput.id : `project-${Date.now()}`;
  const schemaVersion = typeof rawInput.schemaVersion === 'number' ? rawInput.schemaVersion : 1;
  const createdAt = typeof rawInput.createdAt === 'string' ? rawInput.createdAt : new Date().toISOString();
  const updatedAt = typeof rawInput.updatedAt === 'string' ? rawInput.updatedAt : new Date().toISOString();

  // Assets list
  const assets: ProjectAsset[] = [];
  if (Array.isArray(rawInput.assets)) {
    for (const rawAsset of rawInput.assets) {
      if (rawAsset && typeof rawAsset === 'object' && typeof rawAsset.id === 'string' && typeof rawAsset.dataUrl === 'string') {
        assets.push({
          id: rawAsset.id,
          name: typeof rawAsset.name === 'string' ? rawAsset.name : 'Asset',
          dataUrl: rawAsset.dataUrl,
          type: typeof rawAsset.type === 'string' ? rawAsset.type : 'image/png'
        });
      }
    }
  }

  // Layers list
  const layers: Layer[] = [];
  if (Array.isArray(rawInput.layers)) {
    for (const rawLayer of rawInput.layers) {
      if (!rawLayer || typeof rawLayer !== 'object') continue;
      if (typeof rawLayer.id !== 'string' || typeof rawLayer.name !== 'string') continue;

      const layerType = rawLayer.type;
      const allowedTypes = ['circle', 'square', 'rectangle', 'line', 'text', 'image', 'freeform'];
      if (!allowedTypes.includes(layerType)) continue;

      // Migrate keyframes
      const keyframes: Keyframe[] = [];
      if (Array.isArray(rawLayer.keyframes)) {
        for (const rawKf of rawLayer.keyframes) {
          if (!rawKf || typeof rawKf !== 'object') continue;

          const frame = Number.isInteger(rawKf.frame) ? rawKf.frame : 0;
          const x = typeof rawKf.x === 'number' ? rawKf.x : width / 2;
          const y = typeof rawKf.y === 'number' ? rawKf.y : height / 2;
          const scaleX = typeof rawKf.scaleX === 'number' ? rawKf.scaleX : 1;
          const scaleY = typeof rawKf.scaleY === 'number' ? rawKf.scaleY : 1;
          const rotation = typeof rawKf.rotation === 'number' ? rawKf.rotation : 0;
          const opacity = typeof rawKf.opacity === 'number' ? Math.max(0, Math.min(1, rawKf.opacity)) : 1;
          const color = typeof rawKf.color === 'string' ? rawKf.color : '#3b82f6';
          const strokeColor = typeof rawKf.strokeColor === 'string' ? rawKf.strokeColor : '#ffffff';
          const strokeWidth = typeof rawKf.strokeWidth === 'number' ? rawKf.strokeWidth : 0;
          const kfWidth = typeof rawKf.width === 'number' ? rawKf.width : 100;
          const kfHeight = typeof rawKf.height === 'number' ? rawKf.height : 100;
          const fontSize = typeof rawKf.fontSize === 'number' ? rawKf.fontSize : 28;
          const borderRadius = typeof rawKf.borderRadius === 'number' ? rawKf.borderRadius : undefined;
          const fontWeight = typeof rawKf.fontWeight === 'string' ? rawKf.fontWeight : undefined;
          const textAlign = (rawKf.textAlign === 'left' || rawKf.textAlign === 'center' || rawKf.textAlign === 'right') ? rawKf.textAlign : undefined;
          
          const easing = ['linear', 'ease-in', 'ease-out', 'ease-in-out'].includes(rawKf.easing) 
            ? rawKf.easing 
            : 'linear';

          keyframes.push({
            frame,
            x,
            y,
            scaleX,
            scaleY,
            rotation,
            opacity,
            color,
            strokeColor,
            strokeWidth,
            width: kfWidth,
            height: kfHeight,
            fontSize,
            borderRadius,
            fontWeight,
            textAlign,
            easing
          });
        }
      }

      // Ensure layer has at least one valid keyframe
      if (keyframes.length === 0) {
        keyframes.push({
          frame: 0,
          x: width / 2,
          y: height / 2,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
          color: '#3b82f6',
          strokeColor: '#ffffff',
          strokeWidth: 0,
          width: 100,
          height: 100,
          fontSize: 28,
          easing: 'linear'
        });
      }

      // Sort ascending by frame
      keyframes.sort((a, b) => a.frame - b.frame);

      layers.push({
        id: rawLayer.id,
        name: rawLayer.name,
        type: layerType,
        visible: typeof rawLayer.visible === 'boolean' ? rawLayer.visible : true,
        locked: typeof rawLayer.locked === 'boolean' ? rawLayer.locked : false,
        text: typeof rawLayer.text === 'string' ? rawLayer.text : undefined,
        imageUrl: typeof rawLayer.imageUrl === 'string' ? rawLayer.imageUrl : undefined,
        freeformPoints: Array.isArray(rawLayer.freeformPoints) ? rawLayer.freeformPoints : undefined,
        freeformSmoothing: typeof rawLayer.freeformSmoothing === 'boolean' ? rawLayer.freeformSmoothing : undefined,
        keyframes
      });
    }
  }

  return {
    id,
    schemaVersion,
    name,
    fps,
    duration,
    width,
    height,
    backgroundColor,
    layers,
    assets,
    createdAt,
    updatedAt
  };
}
