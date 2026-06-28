import { Project } from '../types';
import { renderProjectFrameToSvgString } from '../render/svgSceneRenderer';

/**
 * Creates an interactive, self-contained single-page HTML player for the animation.
 * Embedded SVG strings are pre-rendered to guarantee perfect 100% accuracy and high speed
 * across all web browsers with no external runtime dependencies or library imports.
 */
export function exportPlayableHtml(project: Project): void {
  const totalFrames = Math.max(1, project.fps * project.duration);
  const framesArray: string[] = [];

  for (let f = 0; f < totalFrames; f++) {
    framesArray.push(renderProjectFrameToSvgString(project, f));
  }

  const framesJson = JSON.stringify(framesArray);
  const escapedProjectName = project.name.replace(/"/g, '&quot;');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedProjectName} - Playable Animation</title>
  <style>
    :root {
      --bg-color: #030712;
      --card-bg: #0b0f19;
      --border-color: #1e293b;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --cyan-primary: #06b6d4;
      --cyan-hover: #22d3ee;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px 16px;
      overflow-x: hidden;
    }

    /* Container */
    .player-card {
      width: 100%;
      max-width: 860px;
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Stage Area */
    .stage-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: ${project.width} / ${project.height};
      background-color: ${project.backgroundColor};
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stage-wrapper svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-b: 1px solid var(--border-color);
      padding-bottom: 12px;
    }

    .title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text-main);
    }

    .branding {
      font-size: 11px;
      color: var(--text-muted);
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* Controls */
    .controls-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background-color: rgba(3, 7, 18, 0.4);
      padding: 12px;
      border-radius: 12px;
      border: 1px solid rgba(30, 41, 59, 0.5);
    }

    .button-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn {
      background-color: var(--border-color);
      color: var(--text-main);
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn:hover {
      background-color: rgba(30, 41, 59, 0.8);
    }

    .btn-primary {
      background-color: var(--cyan-primary);
      color: #000;
    }

    .btn-primary:hover {
      background-color: var(--cyan-hover);
    }

    /* Slider Track */
    .timeline-container {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 200px;
    }

    .timeline-slider {
      flex: 1;
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--border-color);
      outline: none;
      cursor: pointer;
    }

    .timeline-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--cyan-primary);
      cursor: pointer;
      border: 2px solid var(--card-bg);
      transition: transform 0.1s;
    }

    .timeline-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    .frame-counter {
      font-family: monospace;
      font-size: 12px;
      color: var(--cyan-primary);
      min-width: 75px;
      text-align: right;
    }

    /* Settings Control */
    .settings-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .loop-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      cursor: pointer;
      user-select: none;
      color: var(--text-muted);
    }

    .loop-toggle input {
      accent-color: var(--cyan-primary);
      cursor: pointer;
    }

    .speed-select {
      background-color: var(--border-color);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11px;
      outline: none;
      cursor: pointer;
    }

    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      padding: 4px 8px;
    }
  </style>
</head>
<body>

  <div class="player-card">
    <div class="header">
      <h1 class="title">${escapedProjectName}</h1>
      <span class="branding">Animation Creator</span>
    </div>

    <!-- Stage -->
    <div class="stage-wrapper" id="stage-container"></div>

    <!-- Controls -->
    <div class="controls-row">
      <div class="button-group">
        <button id="play-pause-btn" class="btn btn-primary">Play</button>
        <button id="restart-btn" class="btn">Restart</button>
      </div>

      <div class="timeline-container">
        <input type="range" id="timeline" class="timeline-slider" min="0" max="${totalFrames - 1}" value="0">
        <span id="counter" class="frame-counter">0000 / ${totalFrames.toString().padStart(4, '0')}</span>
      </div>

      <div class="settings-group">
        <label class="loop-toggle">
          <input type="checkbox" id="loop-checkbox" checked>
          Loop
        </label>
        
        <select id="speed-select" class="speed-select">
          <option value="0.5">0.5x Speed</option>
          <option value="1" selected>1.0x Speed</option>
          <option value="1.5">1.5x Speed</option>
          <option value="2">2.0x Speed</option>
        </select>
      </div>
    </div>

    <div class="footer">
      <span>Created with Omni-Animator</span>
      <span>Owned by Omni-Science &bull; By king_of_coding</span>
    </div>
  </div>

  <script>
    const frames = ${framesJson};
    const fps = ${project.fps};
    const totalFrames = ${totalFrames};
    
    let currentFrame = 0;
    let isPlaying = true;
    let isLooping = true;
    let speedMultiplier = 1;
    let lastTickTime = performance.now();

    const stageContainer = document.getElementById('stage-container');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const timeline = document.getElementById('timeline');
    const counter = document.getElementById('counter');
    const loopCheckbox = document.getElementById('loop-checkbox');
    const speedSelect = document.getElementById('speed-select');

    function updateStage() {
      stageContainer.innerHTML = frames[currentFrame];
      timeline.value = currentFrame;
      counter.textContent = String(currentFrame).padStart(4, '0') + ' / ' + String(totalFrames).padStart(4, '0');
    }

    function play() {
      isPlaying = true;
      playPauseBtn.textContent = 'Pause';
      playPauseBtn.classList.remove('btn-primary');
    }

    function pause() {
      isPlaying = false;
      playPauseBtn.textContent = 'Play';
      playPauseBtn.classList.add('btn-primary');
    }

    playPauseBtn.addEventListener('click', () => {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    });

    restartBtn.addEventListener('click', () => {
      currentFrame = 0;
      updateStage();
      play();
    });

    timeline.addEventListener('input', (e) => {
      pause();
      currentFrame = parseInt(e.target.value);
      updateStage();
    });

    loopCheckbox.addEventListener('change', (e) => {
      isLooping = e.target.checked;
    });

    speedSelect.addEventListener('change', (e) => {
      speedMultiplier = parseFloat(e.target.value);
    });

    function animationLoop(now) {
      requestAnimationFrame(animationLoop);

      if (!isPlaying) {
        lastTickTime = now;
        return;
      }

      const frameDuration = (1000 / fps) / speedMultiplier;
      const elapsed = now - lastTickTime;

      if (elapsed >= frameDuration) {
        const frameTicks = Math.floor(elapsed / frameDuration);
        currentFrame += frameTicks;
        lastTickTime = now - (elapsed % frameDuration);

        if (currentFrame >= totalFrames) {
          if (isLooping) {
            currentFrame = currentFrame % totalFrames;
          } else {
            currentFrame = totalFrames - 1;
            pause();
          }
        }
        updateStage();
      }
    }

    // Initial render and start
    updateStage();
    play();
    requestAnimationFrame(animationLoop);
  </script>
</body>
</html>
`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_player.html`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
