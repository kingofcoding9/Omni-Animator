import { Project } from '../types';
import { renderProjectFrameToSvgString } from '../render/svgSceneRenderer';
import { renderSvgToCanvas } from '../render/renderFrame';

/**
 * Renders all frames of the project, stitches them together into a 2D grid Sprite Sheet,
 * and triggers a download. Supports progress callbacks and cancellation.
 */
export async function exportAnimationToSpriteSheet(
  project: Project,
  onProgress: (current: number, total: number) => void,
  cancelRef: { current: boolean }
): Promise<void> {
  const totalFrames = Math.max(1, project.fps * project.duration);
  
  // Arrange frames into a square-ish or wide grid
  const cols = Math.ceil(Math.sqrt(totalFrames));
  const rows = Math.ceil(totalFrames / cols);
  
  const spriteSheetCanvas = document.createElement('canvas');
  spriteSheetCanvas.width = cols * project.width;
  spriteSheetCanvas.height = rows * project.height;
  
  const ctx = spriteSheetCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context for sprite sheet assembly');
  }
  
  // Draw background
  ctx.fillStyle = project.backgroundColor;
  ctx.fillRect(0, 0, spriteSheetCanvas.width, spriteSheetCanvas.height);
  
  // Render frames sequentially to support progress tracking and early abort
  for (let frame = 0; frame < totalFrames; frame++) {
    if (cancelRef.current) {
      throw new Error('Sprite sheet export cancelled by user');
    }
    
    onProgress(frame + 1, totalFrames);
    
    const svgString = renderProjectFrameToSvgString(project, frame);
    const frameCanvas = await renderSvgToCanvas(svgString, project.width, project.height);
    
    const col = frame % cols;
    const row = Math.floor(frame / cols);
    const dx = col * project.width;
    const dy = row * project.height;
    
    ctx.drawImage(frameCanvas, dx, dy);
    
    // Give browser a micro-yield to keep the UI interactive
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  if (cancelRef.current) {
    throw new Error('Sprite sheet export cancelled by user');
  }
  
  const dataUrl = spriteSheetCanvas.toDataURL('image/png');
  const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_spritesheet.png`;
  
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
