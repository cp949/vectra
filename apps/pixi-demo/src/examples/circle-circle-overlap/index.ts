import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Circle Circle Overlap 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 480, y: 215 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Circle Circle Overlap 예제 */
export const circleCircleOverlapExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'circle-circle-overlap',
  title: 'Circle Circle Overlap',
  description:
    'circle B를 drag하면 고정 circle A와 겹치는지(disk overlap) 매 프레임 판정하고, centerDist ≤ rA+rB일 때 두 원과 연결선이 hit 색으로 바뀐다',
  categoryId: 'circle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
