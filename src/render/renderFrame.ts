/**
 * Renders an SVG string of a frame onto an HTML5 Canvas asynchronously.
 * This is used to convert pure vector SVG data into rasterized Canvas content
 * for exporting PNGs or Sprite Sheets.
 */
export async function renderSvgToCanvas(
  svgString: string,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not retrieve 2D context from canvas element'));
      return;
    }

    const img = new Image();
    // Enable crossOrigin for CORS safe images if any
    img.crossOrigin = 'anonymous';

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG frame into Image object'));
    };

    img.src = url;
  });
}
