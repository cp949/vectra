import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Clearance Closest Point Lab 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 780, height: 500 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Clearance Closest Point Lab 예제 */
export const clearanceClosestPointLabExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'clearance-closest-point-lab',
  title: 'Clearance Closest Point Lab',
  description: 'probe를 장애물 주변으로 drag하며 AABB, circle, triangle, path의 최근접점과 clearance를 비교한다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
