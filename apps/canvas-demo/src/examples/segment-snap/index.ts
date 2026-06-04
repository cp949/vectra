// Segment Snap 예제 소스
// pointer를 segment에 투영하여 closest point를 Canvas에 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Segment Snap 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 320, y: 180 },
  segment: { a: { x: 100, y: 300 }, b: { x: 500, y: 120 } },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

/** Segment Snap 예제 */
export const segmentSnapExample: PlaygroundExample<CanvasRuntimeSeed> = {
  id: 'segment-snap',
  title: 'Segment Snap',
  description: 'pointer를 segment에 투영하여 closest point를 구한다',
  categoryId: 'interaction',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
