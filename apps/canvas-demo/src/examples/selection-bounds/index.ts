// Selection Bounds 예제 소스
// 여러 점을 포함하는 bounds/rect를 구하고 Canvas에 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Selection Bounds 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Selection Bounds 예제 */
export const selectionBoundsExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'selection-bounds',
  title: 'Selection Bounds',
  description: '여러 점에서 fromPointsInto로 selection bounds를 구한다',
  categoryId: 'interaction',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
