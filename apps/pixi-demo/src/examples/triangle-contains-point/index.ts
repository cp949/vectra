import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Contains Point 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 380, y: 60 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle Contains Point 예제 */
export const triangleContainsPointExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-contains-point',
  title: 'Triangle Contains Point',
  description:
    'probe 점을 drag하면 고정 triangle 내부(경계 포함)인지 매 프레임 판정하고, 내부일 때 triangle fill이 hit 색으로 바뀐다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
