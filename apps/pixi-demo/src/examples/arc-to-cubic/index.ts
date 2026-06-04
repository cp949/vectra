import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Arc To Cubic 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 500, y: 360 },
  segment: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  circle: { center: { x: 0, y: 0 }, radius: 0 },
};

/** Arc To Cubic 예제 */
export const arcToCubicExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'arc-to-cubic',
  title: 'Arc To Cubic',
  description: '원호의 끝 handle을 drag해 호를 ≤90° cubic Bezier segment 목록으로 근사하고 분할 흐름을 드러낸다',
  categoryId: 'curve',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
