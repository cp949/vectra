// Polygon Hit Test 예제 소스
// polygon 내부 포함 여부와 가장 가까운 점을 Canvas에 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Polygon Hit Test 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 280, y: 200 },
  segment: { x1: 0, y1: 0, x2: 0, y2: 0 },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
  circle: { cx: 0, cy: 0, r: 0 },
  polygon: [150, 80, 350, 60, 460, 180, 400, 320, 200, 340, 100, 240],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Polygon Hit Test 예제 */
export const polygonHitTestExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'polygon-hit-test',
  title: 'Polygon Hit Test',
  description: 'containsPoint로 hit test하고 closestPointInto로 경계 snap을 구한다',
  categoryId: 'interaction',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
