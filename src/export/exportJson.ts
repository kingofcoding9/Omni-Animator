import { Project } from '../types';

/**
 * Downloads the current project as a formatted JSON file.
 */
export function exportProjectToJson(project: Project) {
  const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_project.json`;
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  
  // Clean up
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
