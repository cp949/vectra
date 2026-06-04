import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Ray Cubic Hits 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 460 },
  pointer: { x: 360, y: 240 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Ray Cubic Hits 예제 */
export const rayCubicHitsExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'ray-cubic-hits',
  title: 'Ray Cubic Hits',
  description:
    'aim handle로 forward ray 방향을 돌리면 고정 cubic Bezier 곡선과의 교차점이 곡선 위 marker로 다시 계산된다 (곡선 path raycast)',
  categoryId: 'ray',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
