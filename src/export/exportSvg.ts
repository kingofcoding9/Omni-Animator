import { Project } from '../types';
import { renderProjectFrameToSvgString } from '../render/svgSceneRenderer';

export const exportSvg = (project: Project, currentFrame: number) => {
  const svgString = renderProjectFrameToSvgString(project, currentFrame);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `frame_${currentFrame}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
