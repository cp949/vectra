// Segment Snap 예제 소스
// pointer를 segment에 투영하여 closest point를 Canvas에 그린다
import type { PlaygroundExample } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../../canvas/api';
import code from './source.exam.ts?raw';

/** Segment Snap 예제의 runtimeSeed */
const seed: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 320, y: 180 },
  segment: { x1: 100, y1: 300, x2: 500, y2: 120 },
  rect: { x: 0, y: 0, width: 0, height: 0 },
  bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
  circle: { cx: 0, cy: 0, r: 0 },
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
