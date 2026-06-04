import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Triangle Side Classification 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Triangle Side Classification 예제 */
export const triangleSideClassificationExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'triangle-side-classification',
  title: 'Triangle Side Classification',
  description:
    '꼭짓점 3개를 drag하면 변 길이 같음 여부로 equilateral / isosceles / scalene을 분류하고 같은 길이 변을 같은 색으로 강조한다',
  categoryId: 'triangle',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
