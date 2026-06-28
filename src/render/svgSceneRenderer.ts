import { Project, Layer, Keyframe } from '../types';
import { getInterpolatedProperties } from '../utils/animation';

export function getAssetOrUrl(imageUrl: string | undefined, assets: { id: string; dataUrl: string }[]): string {
  if (!imageUrl) return '';
  const asset = assets.find(a => a.id === imageUrl);
  return asset ? asset.dataUrl : imageUrl;
}

export function renderProjectFrameToSvgString(project: Project, frame: number): string {
  const { width, height, backgroundColor, layers, assets } = project;
  
  const layersSvg = layers
    .filter(layer => layer.visible)
    .map(layer => {
      const props = getInterpolatedProperties(layer, frame);
      const fillColor = props.color;
      const strokeColor = props.strokeColor;
      const strokeWidth = props.strokeWidth;
      const opacity = props.opacity;
      
      const sharedProps = `opacity="${opacity}"`;

      switch (layer.type) {
        case 'circle': {
          const radius = Math.max(0, props.width / 2);
          return `<circle cx="${props.x}" cy="${props.y}" r="${radius}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" transform="rotate(${props.rotation}, ${props.x}, ${props.y})" ${sharedProps} />`;
        }
        case 'square':
        case 'rectangle': {
          const xOffset = props.x - props.width / 2;
          const yOffset = props.y - props.height / 2;
          const rx = layer.type === 'square' 
            ? (props.borderRadius !== undefined ? props.borderRadius : props.width * 0.05)
            : (props.borderRadius || 0);
          return `<rect x="${xOffset}" y="${yOffset}" width="${props.width}" height="${props.height}" rx="${rx}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" transform="rotate(${props.rotation}, ${props.x}, ${props.y})" ${sharedProps} />`;
        }
        case 'line': {
          const x1 = props.x - props.width / 2;
          const x2 = props.x + props.width / 2;
          const y = props.y;
          return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${fillColor}" stroke-width="${strokeWidth || 4}" stroke-linecap="round" transform="rotate(${props.rotation}, ${props.x}, ${props.y})" ${sharedProps} />`;
        }
        case 'text': {
          const fontWeight = props.fontWeight || 'bold';
          const textAnchor = props.textAlign === 'left' ? 'start' : props.textAlign === 'right' ? 'end' : 'middle';
          const strokeAttr = strokeWidth > 0 ? `stroke="${strokeColor}" stroke-width="${strokeWidth}"` : '';
          return `<text x="${props.x}" y="${props.y}" fill="${fillColor}" ${strokeAttr} font-size="${props.fontSize}" font-family="Inter, system-ui, sans-serif" font-weight="${fontWeight}" text-anchor="${textAnchor}" dominant-baseline="central" transform="rotate(${props.rotation}, ${props.x}, ${props.y})" ${sharedProps}>${escapeXml(layer.text || 'TEXT')}</text>`;
        }
        case 'image': {
          const xOffset = props.x - props.width / 2;
          const yOffset = props.y - props.height / 2;
          const imgSource = getAssetOrUrl(layer.imageUrl, assets);
          return `<image href="${imgSource}" x="${xOffset}" y="${yOffset}" width="${props.width}" height="${props.height}" transform="rotate(${props.rotation}, ${props.x}, ${props.y})" preserveAspectRatio="xMidYMid slice" ${sharedProps} />`;
        }
        case 'freeform':
        case 'brush': {
          const isBrush = layer.type === 'brush';
          const points = isBrush ? layer.brushPoints : layer.freeformPoints;
          if (!points || points.length === 0) return '';
          
          let pathData = '';
          const smoothingAmount = isBrush ? (layer.brushSmoothing ?? 0.5) : (layer.freeformSmoothing ? 1 : 0);
          
          if (smoothingAmount === 0 || points.length < 3) {
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

          const activeStroke = strokeWidth > 0 ? strokeColor : fillColor;
          const cap = layer.strokeLinecap || 'round';
          const join = layer.strokeLinejoin || 'round';
          const fill = fillColor === 'transparent' ? 'none' : fillColor;

          return `<path d="${pathData}" fill="${fill}" stroke="${activeStroke}" stroke-width="${strokeWidth || 4}" stroke-linecap="${cap}" stroke-linejoin="${join}" transform="translate(${props.x}, ${props.y}) rotate(${props.rotation}) scale(${props.scaleX}, ${props.scaleY})" ${sharedProps} />`;
        }
        default:
          return '';
      }
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: ${backgroundColor};">
  ${layersSvg}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
