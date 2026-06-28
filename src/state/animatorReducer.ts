import { Project, Layer, Keyframe, Point, ShapeType, ProjectAsset } from '../types';
import { AnimatorAction } from './actions';
import { pushHistoryState } from './history';
import { getInterpolatedProperties } from '../utils/animation';

export interface AnimatorState {
  project: Project;
  past: Project[];
  future: Project[];
  activeLayerId: string | null;
  currentFrame: number;
  onionSkinEnabled: boolean;
  gridSnap: boolean;
  activeTool: ShapeType | 'select' | 'drawing';
  isGuideOpen: boolean;
  isPlaying: boolean;
  exportProgress: { current: number; total: number; show: boolean } | null;
}

export const initialAnimatorState = (defaultProject: Project): AnimatorState => ({
  project: defaultProject,
  past: [],
  future: [],
  activeLayerId: defaultProject.layers[1]?.id || defaultProject.layers[0]?.id || null,
  currentFrame: 0,
  onionSkinEnabled: true,
  gridSnap: false,
  activeTool: 'select',
  isGuideOpen: false,
  isPlaying: false,
  exportProgress: null,
});

export function animatorReducer(state: AnimatorState, action: AnimatorAction): AnimatorState {
  switch (action.type) {
    case 'SET_PROJECT': {
      return {
        ...state,
        project: action.payload,
      };
    }

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        ...state,
        isPlaying: false,
        past: newPast,
        future: [JSON.parse(JSON.stringify(state.project)), ...state.future],
        project: previous,
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        ...state,
        isPlaying: false,
        past: [...state.past, JSON.parse(JSON.stringify(state.project))],
        future: newFuture,
        project: next,
      };
    }

    case 'START_TRANSACTION': {
      return pushHistory(state, state);
    }

    case 'SET_ACTIVE_LAYER': {
      return {
        ...state,
        activeLayerId: action.payload,
      };
    }

    case 'SET_CURRENT_FRAME': {
      return {
        ...state,
        currentFrame: action.payload,
      };
    }

    case 'SET_ONION_SKIN': {
      return {
        ...state,
        onionSkinEnabled: action.payload,
      };
    }

    case 'SET_GRID_SNAP': {
      return {
        ...state,
        gridSnap: action.payload,
      };
    }

    case 'SET_ACTIVE_TOOL': {
      return {
        ...state,
        activeTool: action.payload,
        // stop playback when selecting a new active drawing tool
        isPlaying: action.payload !== 'select' ? false : state.isPlaying,
      };
    }

    case 'SET_GUIDE_OPEN': {
      return {
        ...state,
        isGuideOpen: action.payload,
      };
    }

    case 'SET_PLAYING': {
      return {
        ...state,
        isPlaying: action.payload,
      };
    }

    case 'ADD_LAYER': {
      const { type, defaultProperties, currentFrame } = action.payload;
      const past = pushHistoryState(state.past, state.project);
      
      const count = state.project.layers.filter(l => l.type === type).length + 1;
      const layerId = `layer-${type}-${Date.now()}`;
      const layerName = `${type.charAt(0).toUpperCase() + type.slice(1)} ${count}`;

      const defaultKf: Keyframe = {
        frame: currentFrame,
        x: state.project.width / 2,
        y: state.project.height / 2,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        color: type === 'line' ? '#06b6d4' : type === 'text' ? '#ffffff' : '#3b82f6',
        strokeColor: '#ffffff',
        strokeWidth: type === 'line' || type === 'freeform' ? 4 : 0,
        width: type === 'line' ? 200 : 100,
        height: type === 'line' ? 4 : 100,
        fontSize: 28,
        easing: 'linear',
        ...defaultProperties,
      };

      const newLayer: Layer = {
        id: layerId,
        name: layerName,
        type,
        visible: true,
        locked: false,
        text: type === 'text' ? (action.payload.text || 'ENTER TEXT') : undefined,
        imageUrl: type === 'image' ? (action.payload.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200') : undefined,
        keyframes: [defaultKf],
      };

      return {
        ...state,
        isPlaying: false,
        past,
        future: [],
        project: {
          ...state.project,
          layers: [...state.project.layers, newLayer],
          updatedAt: new Date().toISOString(),
        },
        activeLayerId: layerId,
        activeTool: 'select',
      };
    }

    case 'ADD_FREEFORM_LAYER': {
      const { points, center, currentFrame, strokeColor, strokeWidth, smoothing } = action.payload;
      const past = pushHistoryState(state.past, state.project);

      const count = state.project.layers.filter(l => l.type === 'freeform').length + 1;
      const layerId = `layer-freeform-${Date.now()}`;
      const layerName = `Sketch ${count}`;

      // Calculate bounds for width and height
      const width = Math.max(10, Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)));
      const height = Math.max(10, Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)));

      const defaultKf: Keyframe = {
        frame: currentFrame,
        x: center.x,
        y: center.y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        color: 'transparent', 
        strokeColor: strokeColor || '#22d3ee',
        strokeWidth: strokeWidth || 4,
        width,
        height,
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
        freeformSmoothing: smoothing !== undefined ? smoothing : true,
        keyframes: [defaultKf],
      };

      return {
        ...state,
        isPlaying: false,
        past,
        future: [],
        project: {
          ...state.project,
          layers: [...state.project.layers, newLayer],
          updatedAt: new Date().toISOString(),
        },
        activeLayerId: layerId,
        activeTool: 'select',
      };
    }

    case 'UPDATE_LAYER_PROPERTY': {
      const { layerId, property, value, currentFrame, pushToHistory } = action.payload;
      let past = state.past;
      if (pushToHistory) {
        past = pushHistoryState(state.past, state.project);
      }

      const layers = state.project.layers.map((layer) => {
        if (layer.id !== layerId) return layer;

        if (property === 'text') {
          return { ...layer, text: value };
        }
        if (property === 'imageUrl') {
          return { ...layer, imageUrl: value };
        }

        const keyframes = [...layer.keyframes];
        const existingIdx = keyframes.findIndex((kf) => kf.frame === currentFrame);

        if (existingIdx !== -1) {
          keyframes[existingIdx] = {
            ...keyframes[existingIdx],
            [property]: value,
          };
        } else {
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
            borderRadius: activeProps.borderRadius,
            fontWeight: activeProps.fontWeight,
            textAlign: activeProps.textAlign,
            easing: activeProps.easing || 'linear',
            [property]: value,
          } as Keyframe;
          keyframes.push(newKf);
        }

        keyframes.sort((a, b) => a.frame - b.frame);
        return { ...layer, keyframes };
      });

      return {
        ...state,
        past,
        future: pushToHistory ? [] : state.future,
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'MOVE_KEYFRAME': {
      const { layerId, fromFrame, toFrame } = action.payload;
      const layer = state.project.layers.find(l => l.id === layerId);
      if (!layer) return state;

      const collision = layer.keyframes.some(k => k.frame === toFrame);
      if (collision) return state; // reject movement if overlapping other frame

      const past = pushHistoryState(state.past, state.project);

      const layers = state.project.layers.map((l) => {
        if (l.id !== layerId) return l;
        const keyframes = l.keyframes.map((kf) => {
          if (kf.frame === fromFrame) {
            return { ...kf, frame: toFrame };
          }
          return kf;
        }).sort((a, b) => a.frame - b.frame);
        return { ...l, keyframes };
      });

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'ADD_KEYFRAME_AT_FRAME': {
      const { layerId, frame } = action.payload;
      const layer = state.project.layers.find(l => l.id === layerId);
      if (!layer) return state;

      const past = pushHistoryState(state.past, state.project);
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
        borderRadius: activeProps.borderRadius,
        fontWeight: activeProps.fontWeight,
        textAlign: activeProps.textAlign,
        easing: activeProps.easing || 'linear',
      };

      const layers = state.project.layers.map((l) => {
        if (l.id !== layerId) return l;
        const keyframes = [...l.keyframes, newKf].sort((a, b) => a.frame - b.frame);
        return { ...l, keyframes };
      });

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'INSERT_KEYFRAME': {
      const { layerId, currentFrame } = action.payload;
      const layer = state.project.layers.find(l => l.id === layerId);
      if (!layer) return state;
      if (layer.keyframes.some(k => k.frame === currentFrame)) return state;

      const past = pushHistoryState(state.past, state.project);
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
        borderRadius: activeProps.borderRadius,
        fontWeight: activeProps.fontWeight,
        textAlign: activeProps.textAlign,
        easing: activeProps.easing || 'linear',
      };

      const layers = state.project.layers.map((l) => {
        if (l.id !== layerId) return l;
        const keyframes = [...l.keyframes, newKf].sort((a, b) => a.frame - b.frame);
        return { ...l, keyframes };
      });

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'REMOVE_KEYFRAME': {
      const { layerId, currentFrame } = action.payload;
      const layer = state.project.layers.find(l => l.id === layerId);
      if (!layer || layer.keyframes.length <= 1) return state;

      const past = pushHistoryState(state.past, state.project);

      const layers = state.project.layers.map((l) => {
        if (l.id !== layerId) return l;
        const keyframes = l.keyframes.filter(k => k.frame !== currentFrame);
        return { ...l, keyframes };
      });

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'REMOVE_KEYFRAME_AT': {
      const { layerId, frame } = action.payload;
      const layer = state.project.layers.find(l => l.id === layerId);
      if (!layer || layer.keyframes.length <= 1) return state;

      const past = pushHistoryState(state.past, state.project);

      const layers = state.project.layers.map((l) => {
        if (l.id !== layerId) return l;
        const keyframes = l.keyframes.filter(k => k.frame !== frame);
        return { ...l, keyframes };
      });

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'TOGGLE_VISIBILITY': {
      // visibility toggle can be undoable as requested in Phase 9
      const past = pushHistoryState(state.past, state.project);
      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers: state.project.layers.map((l) =>
            l.id === action.payload ? { ...l, visible: !l.visible } : l
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'TOGGLE_LOCK': {
      // lock toggle can be undoable as requested in Phase 9
      const past = pushHistoryState(state.past, state.project);
      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers: state.project.layers.map((l) =>
            l.id === action.payload ? { ...l, locked: !l.locked } : l
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'RENAME_LAYER': {
      const { id, name } = action.payload;
      const past = pushHistoryState(state.past, state.project);
      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers: state.project.layers.map((l) =>
            l.id === id ? { ...l, name } : l
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'DUPLICATE_LAYER': {
      const id = action.payload;
      const layer = state.project.layers.find((l) => l.id === id);
      if (!layer) return state;

      const past = pushHistoryState(state.past, state.project);
      const duplicate: Layer = {
        ...JSON.parse(JSON.stringify(layer)),
        id: `${layer.id}-copy-${Date.now()}`,
        name: `${layer.name} Copy`,
      };

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers: [...state.project.layers, duplicate],
          updatedAt: new Date().toISOString(),
        },
        activeLayerId: duplicate.id,
      };
    }

    case 'DELETE_LAYER': {
      const id = action.payload;
      const past = pushHistoryState(state.past, state.project);
      const layers = state.project.layers.filter((l) => l.id !== id);
      
      let activeLayerId = state.activeLayerId;
      if (activeLayerId === id) {
        activeLayerId = layers.length > 0 ? layers[layers.length - 1].id : null;
      }

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
        activeLayerId,
      };
    }

    case 'MOVE_LAYER': {
      const { id, direction } = action.payload;
      const layers = [...state.project.layers];
      const index = layers.findIndex((l) => l.id === id);
      if (index === -1) return state;

      const targetIndex = direction === 'up' ? index + 1 : index - 1;
      if (targetIndex < 0 || targetIndex >= layers.length) return state;

      const past = pushHistoryState(state.past, state.project);
      const temp = layers[index];
      layers[index] = layers[targetIndex];
      layers[targetIndex] = temp;

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'IMPORT_PROJECT': {
      const imported = action.payload;
      return {
        ...state,
        isPlaying: false,
        past: [],
        future: [],
        project: imported,
        activeLayerId: imported.layers[0]?.id || null,
        currentFrame: 0,
      };
    }

    case 'RESET_PROJECT': {
      return {
        ...state,
        isPlaying: false,
        past: [],
        future: [],
        project: action.payload,
        activeLayerId: action.payload.layers[0]?.id || null,
        currentFrame: 0,
      };
    }

    case 'UPDATE_PROJECT_SETTINGS': {
      const past = pushHistoryState(state.past, state.project);
      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'ADD_ASSET': {
      const past = pushHistoryState(state.past, state.project);
      const assetId = `asset-${Date.now()}`;
      const newAsset: ProjectAsset = {
        id: assetId,
        ...action.payload,
      };

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          assets: [...state.project.assets, newAsset],
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'DELETE_ASSET': {
      const assetId = action.payload;
      const past = pushHistoryState(state.past, state.project);
      const assets = state.project.assets.filter(a => a.id !== assetId);
      
      // Update any image layers that referenced this asset
      const layers = state.project.layers.map(layer => {
        if (layer.type === 'image' && layer.imageUrl === assetId) {
          return { ...layer, imageUrl: '' };
        }
        return layer;
      });

      return {
        ...state,
        past,
        future: [],
        project: {
          ...state.project,
          assets,
          layers,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    default:
      return state;
  }
}
