import { Project } from '../types';
import { renderProjectFrameToSvgString } from '../render/svgSceneRenderer';
import { renderSvgToCanvas } from '../render/renderFrame';

/**
 * Renders a specific project frame to an SVG string, draws it to a canvas,
 * and triggers a browser download for the resulting PNG.
 */
export async function exportFrameToPng(project: Project, frame: number): Promise<void> {
  const svgString = renderProjectFrameToSvgString(project, frame);
  const canvas = await renderSvgToCanvas(svgString, project.width, project.height);
  
  const dataUrl = canvas.toDataURL('image/png');
  const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_frame_${frame.toString().padStart(4, '0')}.png`;
  
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  
  document.body.removeChild(anchor);
}
