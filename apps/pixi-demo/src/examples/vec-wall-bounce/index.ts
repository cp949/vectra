import type { PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../../pixi/api';
import code from './source.exam.ts?raw';

/** Vec Wall Bounce 예제의 runtimeSeed */
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 280, y: 130 },
  segment: { a: { x: 180, y: 330 }, b: { x: 560, y: 250 } },
  circle: { center: { x: 370, y: 290 }, radius: 0 },
};

/** Vec Wall Bounce 예제 */
export const vecWallBounceExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'vec-wall-bounce',
  title: 'Vec Wall Bounce',
  description:
    'source 핸들을 drag하면 입사 벡터를 고정 벽 법선에 대해 반사해 반사 빔을 다시 계산하고, 입사각=반사각·속력 보존을 보인다',
  categoryId: 'vector',
  source: { language: 'ts', code },
  runtimeSeed: seed,
};
