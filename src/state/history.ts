import { Project } from '../types';

const MAX_HISTORY_LIMIT = 50;

/**
 * Clones the current project state and appends it to the history list,
 * trimming the oldest items if it exceeds the maximum size limit.
 */
export function pushHistoryState(past: Project[], currentProject: Project): Project[] {
  const cloned = JSON.parse(JSON.stringify(currentProject));
  const newPast = [...past, cloned];
  if (newPast.length > MAX_HISTORY_LIMIT) {
    return newPast.slice(newPast.length - MAX_HISTORY_LIMIT);
  }
  return newPast;
}
