import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Transform Handles 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 460, y: 290 },
  segment: { a: { x: 260, y: 150 }, b: { x: 460, y: 290 } },
  circle: { center: { x: 360, y: 220 }, radius: 7 },
};

/** Transform Handles 예제 */
export const transformHandlesExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'transform-handles',
  title: 'Transform Handles',
  description:
    '사각형의 resize handle을 드래그하면 그 변형을 affine matrix로 환산해 적용하고 최소 크기로 보정한다. Shift로 등비례 잠금',
  categoryId: 'transform',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
