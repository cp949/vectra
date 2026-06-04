// Polygon Hit Test 예제 소스
// polygon 내부 포함 여부와 가장 가까운 점을 Canvas에 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Polygon Hit Test 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 280, y: 200 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [
    { x: 150, y: 80 },
    { x: 350, y: 60 },
    { x: 460, y: 180 },
    { x: 400, y: 320 },
    { x: 200, y: 340 },
    { x: 100, y: 240 },
  ],
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
