import { Project } from '../types';

export const INITIAL_PROJECT: Project = {
  id: `proj-${Date.now()}`,
  schemaVersion: 1,
  name: 'Untitled Animation',
  fps: 24,
  duration: 4, // 4 seconds (96 frames total)
  width: 800,
  height: 500,
  backgroundColor: '#0f172a', // Slate 900
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assets: [],
  layers: [],
};
