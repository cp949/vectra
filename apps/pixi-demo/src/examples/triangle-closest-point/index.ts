import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Closest Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 620, y: 90 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle Closest Point 예제 */
export const triangleClosestPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-closest-point',
  title: 'Triangle Closest Point',
  description:
    'probe를 drag하면 고정 삼각형 위에서 가장 가까운 점이 marker로 스냅하고, 내부면 거리 0·외부면 가장 가까운 변으로 투영된다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
