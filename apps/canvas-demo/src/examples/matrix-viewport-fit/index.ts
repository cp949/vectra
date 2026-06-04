// Matrix Viewport Fit 예제 소스
// world bounds를 viewport bounds에 맞추고 screen/world 좌표 변환을 표시한다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Matrix Viewport Fit 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 760, height: 440 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: -120, y: -80 }, max: { x: 360, y: 260 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Matrix Viewport Fit 예제 */
export const matrixViewportFitExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'matrix-viewport-fit',
  title: 'Matrix Viewport Fit',
  description: 'world bounds를 viewport에 맞추고 inverse matrix로 screen 좌표를 world 좌표로 되돌린다',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
