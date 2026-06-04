import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Triangle Overlap 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 540, y: 160 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle Triangle Overlap 예제 */
export const triangleTriangleOverlapExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-triangle-overlap',
  title: 'Triangle Triangle Overlap',
  description:
    '삼각형 B를 drag하면 고정 삼각형 A와 겹치는지 매 프레임 SAT으로 판정하고, 겹치면 두 삼각형이 hit 색으로 바뀐다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
