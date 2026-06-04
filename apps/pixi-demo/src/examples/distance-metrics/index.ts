import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Distance Metrics 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 510, y: 130 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Distance Metrics 예제 */
export const distanceMetricsExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'distance-metrics',
  title: 'Distance Metrics',
  description:
    '중앙 anchor에서 draggable probe까지의 거리를 Euclidean(원)·Manhattan(마름모)·Chebyshev(정사각형) 등거리 윤곽으로 비교한다',
  categoryId: 'math',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
