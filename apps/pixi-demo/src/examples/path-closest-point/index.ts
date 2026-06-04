import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Path Closest Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 380, y: 70 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Path Closest Point 예제 */
export const pathClosestPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'path-closest-point',
  title: 'Path Closest Point',
  description:
    '직선+cubic 고정 path에 probe를 drag하면 path 위 최근접점에 marker가 snap되고 연결선이 곡선에 수직으로 그려진다',
  categoryId: 'path',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
