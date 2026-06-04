import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Bounds Closest Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 560, y: 110 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Bounds Closest Point 예제 */
export const boundsClosestPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'bounds-closest-point',
  title: 'Bounds Closest Point',
  description:
    '질의 점 P를 drag하면 고정 사각 영역(AABB) 위 P 최근접점(foot)을 매 drag마다 다시 구한다. P를 box 밖으로 끌면 foot가 가까운 변·모서리에 axis별 clamp로 안착하고, 안으로 끌면 foot=P(거리 0)가 된다',
  categoryId: 'rect',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
