import { Project, Layer, Keyframe, Point, ShapeType, ProjectAsset } from '../types';

export type AnimatorAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_ACTIVE_LAYER'; payload: string | null }
  | { type: 'SET_CURRENT_FRAME'; payload: number }
  | { type: 'SET_ONION_SKIN'; payload: boolean }
  | { type: 'SET_GRID_SNAP'; payload: boolean }
  | { type: 'SET_ACTIVE_TOOL'; payload: any }
  | { type: 'SET_GUIDE_OPEN'; payload: boolean }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'ADD_LAYER'; payload: { type: ShapeType; defaultProperties: Partial<Keyframe>; currentFrame: number; text?: string; imageUrl?: string } }
  | { type: 'ADD_FREEFORM_LAYER'; payload: { points: Point[]; center: Point; currentFrame: number } }
  | { type: 'UPDATE_LAYER_PROPERTY'; payload: { layerId: string; property: keyof Keyframe | 'text' | 'imageUrl'; value: any; currentFrame: number; pushToHistory?: boolean } }
  | { type: 'MOVE_KEYFRAME'; payload: { layerId: string; fromFrame: number; toFrame: number } }
  | { type: 'ADD_KEYFRAME_AT_FRAME'; payload: { layerId: string; frame: number } }
  | { type: 'INSERT_KEYFRAME'; payload: { layerId: string; currentFrame: number } }
  | { type: 'REMOVE_KEYFRAME'; payload: { layerId: string; currentFrame: number } }
  | { type: 'REMOVE_KEYFRAME_AT'; payload: { layerId: string; frame: number } }
  | { type: 'TOGGLE_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_LOCK'; payload: string }
  | { type: 'RENAME_LAYER'; payload: { id: string; name: string } }
  | { type: 'DUPLICATE_LAYER'; payload: string }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'MOVE_LAYER'; payload: { id: string; direction: 'up' | 'down' } }
  | { type: 'IMPORT_PROJECT'; payload: Project }
  | { type: 'RESET_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT_SETTINGS'; payload: { name: string; fps: number; duration: number; width: number; height: number; backgroundColor: string } }
  | { type: 'ADD_ASSET'; payload: Omit<ProjectAsset, 'id'> }
  | { type: 'DELETE_ASSET'; payload: string };
