// Matrix Transform 예제 소스
// translation / rotation / scaling matrix를 조합하여 rect를 변환한다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Matrix Transform 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: -60, y: -40, width: 120, height: 80 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Matrix Transform 예제 */
export const matrixTransformExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'matrix-transform',
  title: 'Matrix Transform',
  description: 'translation / rotation / scaling matrix 조합과 transformRectInto',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
